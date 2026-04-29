import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, OnDestroy, inject, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { Subject, takeUntil, filter, take, combineLatest } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import {
  previewSubcontractorInvite,
  acceptSubcontractorInvite,
  acceptSubcontractorInviteSuccess,
  acceptSubcontractorInviteFailure,
  resetAcceptInviteState,
} from '../../../store/subcontractors/subcontractors.actions';
import {
  selectSubcontractorInvitePreview,
  selectSubcontractorInvitePreviewError,
} from '../../../store/subcontractors/subcontractors.selectors';
import { selectUserCompanies } from '../../../store/user/user.selectors';
import { UserStoreService } from '../../../store/user/user-store.service';
import { AuthService } from '../../../core/auth/auth.service';

type PageView = 'loading' | 'status' | 'invalid' | 'accepting' | 'error' | 'success';

@Component({
  selector: 'app-subcontractor-accept-invite',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './subcontractor-accept-invite.component.html',
  styleUrls: ['./subcontractor-accept-invite.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubcontractorAcceptInviteComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly actions$ = inject(Actions);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly userStore = inject(UserStoreService);
  private readonly authService = inject(AuthService);
  private readonly destroy$ = new Subject<void>();

  token: string | null = null;

  view = signal<PageView>('loading');
  acceptError = signal<string | null>(null);

  readonly preview$ = this.store.select(selectSubcontractorInvitePreview);
  readonly userCompanies$ = this.store.select(selectUserCompanies);

  ngOnInit(): void {
    this.store.dispatch(resetAcceptInviteState());

    this.token = this.route.snapshot.queryParamMap.get('token');
    if (!this.token) {
      this.view.set('invalid');
      return;
    }

    this.store.dispatch(previewSubcontractorInvite({ token: this.token }));

    this.store.select(selectSubcontractorInvitePreviewError)
      .pipe(takeUntil(this.destroy$), filter((e): e is string => e !== null), take(1))
      .subscribe(() => {
        this.view.set('invalid');
        this.cdr.markForCheck();
      });

    // When preview loads, check if the user already has a company in the store.
    // If the backend returns NO_COMPANY but the user store shows they have a company,
    // skip the company creation step and re-fetch the preview so the backend
    // can re-evaluate with the freshly available auth context.
    combineLatest([
      this.store.select(selectSubcontractorInvitePreview),
      this.store.select(selectUserCompanies),
    ])
      .pipe(
        takeUntil(this.destroy$),
        filter(([preview]) => preview !== null),
        take(1),
      )
      .subscribe(([preview, companies]) => {
        if (preview!.acceptorStatus === 'NO_COMPANY' && companies.length > 0) {
          // User already has a company — re-dispatch preview so the backend
          // can return the correct READY status with the updated auth state.
          this.store.dispatch(previewSubcontractorInvite({ token: this.token! }));

          // Wait for the refreshed preview
          this.store.select(selectSubcontractorInvitePreview)
            .pipe(
              takeUntil(this.destroy$),
              // Skip the stale NO_COMPANY value, wait for the next emission
              filter(p => p !== null && p.acceptorStatus !== 'NO_COMPANY'),
              take(1),
            )
            .subscribe(() => {
              this.view.set('status');
              this.cdr.markForCheck();
            });

          // If the re-fetch still returns NO_COMPANY after a short delay, show status anyway
          setTimeout(() => {
            if (this.view() === 'loading') {
              this.view.set('status');
              this.cdr.markForCheck();
            }
          }, 3000);
        } else {
          this.view.set('status');
          this.cdr.markForCheck();
        }
      });
  }

  /** Build the full current invite URL to pass as a redirect target */
  private get inviteReturnUrl(): string {
    return `/subcontractor-invite?token=${this.token!}`;
  }

  onLogin(): void {
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: this.inviteReturnUrl },
    });
  }

  onSignUp(): void {
    const preview = this.store.selectSignal(selectSubcontractorInvitePreview)();
    const email = preview?.invitedEmail ?? '';

    // Generate a temp password that satisfies Cognito requirements
    const tempPassword = `Tmp!${Math.random().toString(36).slice(2, 10)}A1`;

    // Trigger signUp immediately so Cognito sends the verification email right now
    this.authService.signUp(email, tempPassword, 'Invited', 'User').catch(() => {
      // Ignore UsernameExistsException — code was already sent previously, user can still proceed
    });

    this.router.navigate(['/signup'], {
      queryParams: {
        inviteToken: this.token,
        email,
        tempPassword,
      },
    });
  }

  onCreateCompany(): void {
    this.router.navigate(['/create-company'], {
      queryParams: { returnUrl: this.inviteReturnUrl },
    });
  }

  onGoToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  onAccept(): void {
    if (!this.token) return;

    this.view.set('accepting');
    this.cdr.markForCheck();
    this.store.dispatch(acceptSubcontractorInvite({ token: this.token }));

    this.actions$.pipe(ofType(acceptSubcontractorInviteSuccess), take(1), takeUntil(this.destroy$))
      .subscribe(() => {
        // Reload user so company context is fresh, then navigate
        this.userStore.loadUser();

        this.view.set('success');
        this.cdr.markForCheck();

        setTimeout(() => this.router.navigate(['/principal-companies']), 1500);
      });

    this.actions$.pipe(ofType(acceptSubcontractorInviteFailure), take(1), takeUntil(this.destroy$))
      .subscribe(({ error }) => {
        this.acceptError.set(error);
        this.view.set('error');
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

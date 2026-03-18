import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, OnDestroy, inject, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { Subject, takeUntil, filter, take } from 'rxjs';
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
import { UserStoreService } from '../../../store/user/user-store.service';

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
  private readonly destroy$ = new Subject<void>();

  token: string | null = null;

  view = signal<PageView>('loading');
  acceptError = signal<string | null>(null);

  readonly preview$ = this.store.select(selectSubcontractorInvitePreview);

  ngOnInit(): void {
    this.store.dispatch(resetAcceptInviteState());

    this.token = this.route.snapshot.queryParamMap.get('token');
    if (!this.token) {
      this.view.set('invalid');
      return;
    }

    // Preview endpoint is public — call it immediately without auth
    this.store.dispatch(previewSubcontractorInvite({ token: this.token }));

    this.store.select(selectSubcontractorInvitePreviewError)
      .pipe(takeUntil(this.destroy$), filter((e): e is string => e !== null), take(1))
      .subscribe(() => {
        this.view.set('invalid');
        this.cdr.markForCheck();
      });

    this.store.select(selectSubcontractorInvitePreview)
      .pipe(takeUntil(this.destroy$), filter(p => p !== null), take(1))
      .subscribe(() => {
        this.view.set('status');
        this.cdr.markForCheck();
      });
  }

  /** Build the full current invite URL to pass as a redirect target */
  private get inviteReturnUrl(): string {
    return encodeURIComponent(`/subcontractor-invite?token=${this.token!}`);
  }

  onLogin(): void {
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: this.inviteReturnUrl },
    });
  }

  onSignUp(): void {
    this.router.navigate(['/signup'], {
      queryParams: { returnUrl: this.inviteReturnUrl },
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

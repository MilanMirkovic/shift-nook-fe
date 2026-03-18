import {
  ChangeDetectionStrategy, Component, OnInit, OnDestroy, inject, signal,
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
  selectSubcontractorInvitePreviewLoading,
  selectSubcontractorInvitePreviewError,
  selectSubcontractorAccepting,
} from '../../../store/subcontractors/subcontractors.selectors';
import { AuthService } from '../../../core/auth/auth.service';
import { UserStoreService } from '../../../store/user/user-store.service';
import { loadUserSuccess } from '../../../store/user/user.actions';

type PageView = 'loading' | 'preview' | 'invalid' | 'accepting' | 'error' | 'success';

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
  private readonly authService = inject(AuthService);
  private readonly userStore = inject(UserStoreService);
  private readonly destroy$ = new Subject<void>();

  private token: string | null = null;

  view = signal<PageView>('loading');
  acceptError = signal<string | null>(null);

  readonly preview$ = this.store.select(selectSubcontractorInvitePreview);
  readonly previewLoading$ = this.store.select(selectSubcontractorInvitePreviewLoading);
  readonly previewError$ = this.store.select(selectSubcontractorInvitePreviewError);
  readonly accepting$ = this.store.select(selectSubcontractorAccepting);

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
      .subscribe(() => this.view.set('invalid'));

    this.store.select(selectSubcontractorInvitePreview)
      .pipe(takeUntil(this.destroy$), filter(p => p !== null), take(1))
      .subscribe(() => this.view.set('preview'));
  }

  async onAccept(): Promise<void> {
    if (!this.token) return;

    const isLoggedIn = await this.authService.isAuthenticated();
    if (!isLoggedIn) {
      sessionStorage.setItem('pendingSubcontractorToken', this.token);
      this.router.navigate(['/login'], {
        queryParams: { returnTo: '/subcontractor-invite', token: this.token },
      });
      return;
    }

    this.view.set('accepting');
    this.store.dispatch(acceptSubcontractorInvite({ token: this.token }));

    this.actions$.pipe(ofType(acceptSubcontractorInviteSuccess), take(1), takeUntil(this.destroy$))
      .subscribe(() => {
        sessionStorage.removeItem('pendingSubcontractorToken');
        this.userStore.loadUser();
        this.actions$.pipe(ofType(loadUserSuccess), take(1), takeUntil(this.destroy$))
          .subscribe(() => {
            this.view.set('success');
            setTimeout(() => this.router.navigate(['/principal-companies']), 1500);
          });
      });

    this.actions$.pipe(ofType(acceptSubcontractorInviteFailure), take(1), takeUntil(this.destroy$))
      .subscribe(({ error }) => {
        this.acceptError.set(error);
        this.view.set('error');
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

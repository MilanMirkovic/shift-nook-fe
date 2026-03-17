import {
  Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, signal, ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, filter, firstValueFrom } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { previewInvitation, acceptInvitation } from '../../store/invitations/invitations.actions';
import {
  selectInvitationsPreviewResult,
  selectInvitationsPreviewError,
  selectInvitationsAcceptError,
  selectInvitationsAcceptResult,
} from '../../store/invitations/invitations.selectors';
import { InvitationPreview } from '../../store/invitations/invitations.models';
import { AuthService } from '../../core/auth/auth.service';
import { UserApi } from '../../store/user/user.api';
import { UserStoreService } from '../../store/user/user-store.service';

export type PageView =
  | 'loading'
  | 'preview'
  | 'invalid-token'
  | 'profile-form'
  | 'accepting'
  | 'accept-error';

@Component({
  selector: 'app-accept-invite',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './accept-invite.component.html',
  styleUrls: ['./accept-invite.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AcceptInviteComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly userApi = inject(UserApi);
  private readonly userStore = inject(UserStoreService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  view = signal<PageView>('loading');
  preview: InvitationPreview | null = null;

  private currentToken: string | null = null;

  profileForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
  });
  profileError = signal('');
  profileSaving = signal(false);

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.view.set('invalid-token');
      return;
    }

    this.currentToken = token;

    this.store.dispatch(previewInvitation({ token }));

    this.store.select(selectInvitationsPreviewError)
      .pipe(takeUntil(this.destroy$), filter(e => e !== null))
      .subscribe(() => {
        this.view.set('invalid-token');
        this.cdr.markForCheck();
      });

    this.store.select(selectInvitationsPreviewResult)
      .pipe(takeUntil(this.destroy$), filter(r => r !== null))
      .subscribe(result => {
        this.preview = result;
        this.view.set('preview');
        this.cdr.markForCheck();
      });
  }

  async onAcceptClicked(): Promise<void> {
    const token = this.currentToken!;
    const preview = this.preview!;
    await this.continueAfterPreview(token, preview);
  }

  private async continueAfterPreview(token: string, preview: InvitationPreview): Promise<void> {
    const isLoggedIn = await this.authService.isAuthenticated();

    if (isLoggedIn) {
      const currentEmail = await this.authService.getCurrentUserEmail();
      const emailMismatch =
        currentEmail !== null &&
        currentEmail.toLowerCase() !== preview.invitedEmail.toLowerCase();

      if (emailMismatch) {
        await this.authService.signOut();
        this.userStore.logout();
      }
    }

    const stillLoggedIn = await this.authService.isAuthenticated();
    if (!stillLoggedIn) {
      sessionStorage.setItem('pendingInviteToken', token);
      this.router.navigate(['/auth/reset-password'], {
        queryParams: {
          email: preview.invitedEmail,
          mode: 'set',
          returnTo: '/accept-invite',
        },
      });
      return;
    }

    try {
      const profile = await firstValueFrom(this.userApi.getCurrentUser());
      if (!profile.onboardingComplete) {
        this.view.set('profile-form');
        this.cdr.markForCheck();
        return;
      }
    } catch {
      // If we can't load the profile, try accepting anyway
    }

    this.doAccept(preview.companyId, token);
  }

  async onProfileSubmit(): Promise<void> {
    if (this.profileForm.invalid) return;

    const token = this.currentToken!;
    const { firstName, lastName } = this.profileForm.value;

    this.profileSaving.set(true);
    this.profileError.set('');

    try {
      await firstValueFrom(this.userApi.updateProfile(firstName, lastName));
      this.doAccept(this.preview!.companyId, token);
    } catch (err: any) {
      this.profileError.set(err?.error?.message ?? 'Failed to save profile. Please try again.');
      this.profileSaving.set(false);
    }
  }

  private doAccept(companyId: string, token: string): void {
    this.view.set('accepting');
    this.store.dispatch(acceptInvitation({ companyId, token }));

    this.store.select(selectInvitationsAcceptResult)
      .pipe(takeUntil(this.destroy$), filter(r => r !== null))
      .subscribe(result => {
        sessionStorage.removeItem('pendingInviteToken');
        this.userStore.loadUser();
        this.router.navigate(['/companies', result!.companyId]);
      });

    this.store.select(selectInvitationsAcceptError)
      .pipe(takeUntil(this.destroy$), filter(e => e !== null))
      .subscribe(() => {
        this.view.set('accept-error');
        this.cdr.markForCheck();
      });
  }

  roleLabel(role: string): string {
    const map: Record<string, string> = {
      OWNER: 'Owner',
      ADMIN: 'Admin',
      ACCOUNTANT: 'Accountant',
      WORKER: 'Worker',
    };
    return map[role] ?? role;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}


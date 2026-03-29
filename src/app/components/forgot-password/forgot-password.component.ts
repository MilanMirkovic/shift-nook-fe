import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { UserApi } from '../../store/user/user.api';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
})
export class ForgotPasswordComponent implements OnInit {
  /** Step 1: enter email → Step 2: enter code + new password */
  step: 1 | 2 = 1;

  emailForm: FormGroup;
  resetForm: FormGroup;

  isLoading = false;
  errorMessage = '';
  successMessage = '';
  hidePassword = true;
  email = '';

  /**
   * When mode === 'set' the copy changes to "Set your password" and after
   * completing the flow the user is signed in automatically then redirected
   * to `returnTo` (restored from the query param or sessionStorage).
   */
  mode: 'reset' | 'set' = 'reset';
  private returnTo = '/login';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private userApi: UserApi,
  ) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.resetForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;

    // mode param
    if (params.get('mode') === 'set') {
      this.mode = 'set';
    }

    // returnTo param
    const returnTo = params.get('returnTo');
    if (returnTo) {
      this.returnTo = returnTo;
    }

    // Pre-fill email when coming from the invite flow
    const emailParam = params.get('email');
    if (emailParam) {
      this.email = emailParam;
      this.emailForm.patchValue({ email: emailParam });

      // Automatically request the code whenever email is pre-filled via query param
      void this.requestCode();
    }
  }

  get pageTitle(): string {
    return this.mode === 'set' ? 'Set Your Password' : 'Forgot Password';
  }

  get step2Title(): string {
    return this.mode === 'set' ? 'Set Your Password' : 'Reset Password';
  }

  get step2Subtitle(): string {
    return this.mode === 'set'
      ? `We sent a verification code to ${this.email}. Enter it below to set your password.`
      : `Enter the code sent to ${this.email} and choose a new password.`;
  }

  async requestCode(): Promise<void> {
    if (this.emailForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.email = this.emailForm.value.email;

    try {
      await this.authService.forgotPassword(this.email);
      this.step = 2;
    } catch (err: any) {
      this.errorMessage = this.mapError(err);
    } finally {
      this.isLoading = false;
    }
  }

  async resetPassword(): Promise<void> {
    if (this.resetForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';
    const { code, newPassword } = this.resetForm.value;

    try {
      await this.authService.confirmForgotPassword(this.email, code, newPassword);

      if (this.mode === 'set') {
        // Sign the worker in automatically after setting their password
        await this.authService.signIn(this.email, newPassword);

        // Fetch current profile and call updateProfile to mark onboardingComplete = true
        try {
          const profile = await firstValueFrom(this.userApi.getCurrentUser());
          await firstValueFrom(this.userApi.updateProfile(profile.firstName, profile.lastName));
        } catch {
          // Non-fatal — proceed even if this fails
        }

        // Restore the pending invite token that was saved before the redirect
        const pendingToken = sessionStorage.getItem('pendingInviteToken');
        const destination = this.returnTo;

        if (pendingToken) {
          sessionStorage.removeItem('pendingInviteToken');
          this.router.navigate([destination], { queryParams: { token: pendingToken } });
        } else {
          this.router.navigate([destination]);
        }
      } else {
        this.router.navigate(['/login'], { state: { passwordReset: true } });
      }
    } catch (err: any) {
      this.errorMessage = this.mapError(err);
    } finally {
      this.isLoading = false;
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  goBack(): void {
    this.step = 1;
    this.errorMessage = '';
    this.successMessage = '';
  }

  private mapError(err: any): string {
    switch (err?.name) {
      case 'UserNotFoundException':
        return 'No account found with this email.';
      case 'CodeMismatchException':
        return 'Invalid verification code. Please try again.';
      case 'ExpiredCodeException':
        return 'Code has expired. Please request a new one.';
      case 'InvalidPasswordException':
        return 'Password does not meet requirements (min 8 chars, upper, lower, number, symbol).';
      case 'LimitExceededException':
        return 'Too many attempts. Please try again later.';
      default:
        return err?.message ?? 'Something went wrong. Please try again.';
    }
  }
}

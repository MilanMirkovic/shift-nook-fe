import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-set-password',
  standalone: true,
  templateUrl: './set-password.component.html',
  styleUrl: './set-password.component.scss',
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
export class SetPasswordComponent implements OnInit {
  form: FormGroup;

  isLoading = false;
  errorMessage = '';
  hideTemp = true;
  hideNew = true;

  private email = '';
  private returnTo = '/accept-invite';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
  ) {
    this.form = this.fb.group({
      temporaryPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    this.email = params.get('email') ?? '';
    const returnTo = params.get('returnTo');
    if (returnTo) {
      this.returnTo = returnTo;
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const { temporaryPassword, newPassword } = this.form.value;

    try {
      // Step 1 — sign in with the temporary password from the Cognito invite email
      const result = await this.authService.signIn(this.email, temporaryPassword);

      if (result.nextStep?.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        // Step 2 — Cognito challenge: set a permanent password
        await this.authService.confirmSignIn(newPassword);
      } else if (!result.isSignedIn) {
        this.errorMessage = 'Sign-in failed. Please check your temporary password.';
        this.isLoading = false;
        return;
      }

      // Restore the pending invite token and navigate back to accept-invite
      const pendingToken = sessionStorage.getItem('pendingInviteToken');
      if (pendingToken) {
        this.router.navigate([this.returnTo], { queryParams: { token: pendingToken } });
      } else {
        this.router.navigate([this.returnTo]);
      }
    } catch (err: any) {
      this.errorMessage = this.mapError(err);
      this.isLoading = false;
    }
  }

  private mapError(err: any): string {
    switch (err?.name) {
      case 'NotAuthorizedException':
        return 'Incorrect temporary password. Please check your invitation email.';
      case 'InvalidPasswordException':
        return 'New password does not meet requirements (min 8 chars, upper, lower, number, symbol).';
      case 'LimitExceededException':
        return 'Too many attempts. Please try again later.';
      case 'UserNotFoundException':
        return 'No account found. Please contact your company owner.';
      default:
        return err?.message ?? 'Something went wrong. Please try again.';
    }
  }
}

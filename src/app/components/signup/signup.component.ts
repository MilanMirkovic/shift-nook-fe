import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  hidePassword = true;
  isLoading = false;
  errorMessage = '';

  /** Token present when coming from the subcontractor invite flow */
  inviteToken: string | null = null;
  /** Temp password generated at invite page — used for signIn after confirm */
  private tempPassword: string | null = null;
  /** True after signUp() succeeds — shows the code field */
  codeSent = false;
  /** Generic returnUrl for other flows */
  private returnUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
  ) {
    this.signupForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      code: [''],
    });
  }

  ngOnInit(): void {
    this.inviteToken = this.route.snapshot.queryParamMap.get('inviteToken');
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    this.tempPassword = this.route.snapshot.queryParamMap.get('tempPassword');

    // Pre-fill and lock the email when coming from invite
    const inviteEmail = this.route.snapshot.queryParamMap.get('email');
    if (inviteEmail) {
      this.signupForm.get('email')!.setValue(inviteEmail);
      this.signupForm.get('email')!.disable();
    }

    // If tempPassword is present, the account + code were already triggered — go straight to step 2
    if (this.inviteToken && this.tempPassword) {
      this.codeSent = true;
      this.signupForm.get('code')!.setValidators([
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(6),
      ]);
      this.signupForm.get('code')!.updateValueAndValidity();
    }
  }

  async onSubmit(): Promise<void> {
    if (this.signupForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';
    const { firstName, lastName, email, password, code } = this.signupForm.getRawValue();

    try {
      if (this.inviteToken && this.tempPassword) {
        // Invite flow: confirm → signIn with temp → change password → update attributes
        await this.authService.confirmSignUp(email, code);
        await this.authService.signIn(email, this.tempPassword);
        // Change password first so the session is stable before updating attributes
        await this.authService.changePassword(this.tempPassword, password);
        // Now update name attributes on the fresh, post-password-change session
        await this.authService.updateUserAttributes(firstName, lastName);
        this.router.navigate(['/create-company'], {
          queryParams: { returnUrl: `/subcontractor-invite?token=${this.inviteToken}` },
        });
      } else {
        // Normal flow: create account → go to confirm-email page
        await this.authService.signUp(email, password, firstName, lastName);
        this.router.navigate(['/confirm'], {
          state: { email, returnUrl: this.returnUrl },
          queryParams: { ...(this.returnUrl ? { returnUrl: this.returnUrl } : {}) },
        });
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

  private mapError(err: any): string {
    switch (err?.name) {
      case 'UsernameExistsException':
        return 'An account with this email already exists.';
      case 'InvalidPasswordException':
        return 'Password does not meet requirements (min 8 chars, upper, lower, number, symbol).';
      case 'CodeMismatchException':
        return 'Invalid verification code. Please check your email and try again.';
      case 'ExpiredCodeException':
        return 'Verification code has expired. Please request a new one.';
      case 'LimitExceededException':
        return 'Too many attempts. Please try again later.';
      default:
        return err?.message ?? 'Sign-up failed. Please try again.';
    }
  }
}

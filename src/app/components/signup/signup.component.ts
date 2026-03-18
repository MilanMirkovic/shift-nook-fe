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

    // Code is required only in the invite flow
    if (this.inviteToken) {
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
    const { firstName, lastName, email, password, code } = this.signupForm.value;

    try {
      await this.authService.signUp(email, password, firstName, lastName);

      if (this.inviteToken) {
        // Invite flow: confirm email + sign in right here, then go create company
        await this.authService.confirmSignUp(email, code);
        await this.authService.signIn(email, password);
        this.router.navigate(['/create-company'], {
          queryParams: { returnUrl: `/subcontractor-invite?token=${this.inviteToken}` },
        });
      } else {
        // Normal flow: go to confirm-email page
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

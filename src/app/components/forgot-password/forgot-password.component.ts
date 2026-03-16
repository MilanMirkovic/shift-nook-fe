import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/auth/auth.service';

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
  ],
})
export class ForgotPasswordComponent {
  /** Step 1: enter email → Step 2: enter code + new password */
  step: 1 | 2 = 1;

  emailForm: FormGroup;
  resetForm: FormGroup;

  isLoading = false;
  errorMessage = '';
  successMessage = '';
  hidePassword = true;
  email = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
  ) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.resetForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
    });
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
      this.router.navigate(['/login'], { state: { passwordReset: true } });
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


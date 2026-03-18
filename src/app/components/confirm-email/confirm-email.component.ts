import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-confirm-email',
  standalone: true,
  templateUrl: './confirm-email.component.html',
  styleUrl: './confirm-email.component.scss',
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
export class ConfirmEmailComponent implements OnInit {
  confirmForm: FormGroup;
  isLoading = false;
  isResending = false;
  errorMessage = '';
  successMessage = '';
  email = '';
  private returnUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
  ) {
    this.confirmForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    });
  }

  ngOnInit(): void {
    // Pre-fill email if passed via router state (from signup / login redirect)
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state ?? history.state;
    if (state?.email) {
      this.email = state.email;
      this.confirmForm.patchValue({ email: this.email });
    }
    if (state?.returnUrl) {
      this.returnUrl = state.returnUrl;
    }
  }

  async onSubmit(): Promise<void> {
    if (this.confirmForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';
    const { email, code } = this.confirmForm.value;

    try {
      await this.authService.confirmSignUp(email, code);
      this.router.navigate(['/login'], {
        state: { confirmed: true, returnUrl: this.returnUrl },
        queryParams: this.returnUrl ? { returnUrl: this.returnUrl } : {},
      });
    } catch (err: any) {
      this.errorMessage = this.mapError(err);
    } finally {
      this.isLoading = false;
    }
  }

  async resendCode(): Promise<void> {
    const email = this.confirmForm.get('email')?.value;
    if (!email) {
      this.errorMessage = 'Please enter your email address first.';
      return;
    }

    this.isResending = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      await this.authService.resendCode(email);
      this.successMessage = 'A new code has been sent to your email.';
    } catch (err: any) {
      this.errorMessage = this.mapError(err);
    } finally {
      this.isResending = false;
    }
  }

  private mapError(err: any): string {
    switch (err?.name) {
      case 'CodeMismatchException':
        return 'Invalid verification code. Please try again.';
      case 'ExpiredCodeException':
        return 'Code has expired. Please request a new one.';
      case 'LimitExceededException':
        return 'Too many attempts. Please try again later.';
      default:
        return err?.message ?? 'Verification failed. Please try again.';
    }
  }
}

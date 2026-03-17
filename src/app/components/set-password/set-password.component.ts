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
  isSendingCode = false;
  codeSent = false;
  errorMessage = '';
  hideNew = true;

  email = '';
  private returnTo = '/accept-invite';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
  ) {
    this.form = this.fb.group({
      code: ['', [Validators.required]],
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

    // Automatically send the code when the page loads
    if (this.email) {
      this.sendCode();
    }
  }

  async sendCode(): Promise<void> {
    this.isSendingCode = true;
    this.errorMessage = '';
    try {
      await this.authService.forgotPassword(this.email);
      this.codeSent = true;
    } catch (err: any) {
      this.errorMessage = this.mapError(err);
    } finally {
      this.isSendingCode = false;
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const { code, newPassword } = this.form.value;

    try {
      await this.authService.confirmForgotPassword(this.email, code, newPassword);

      // Sign in with the new password
      await this.authService.signIn(this.email, newPassword);

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
      case 'CodeMismatchException':
        return 'Incorrect code. Please check your email and try again.';
      case 'ExpiredCodeException':
        return 'This code has expired. Please request a new one.';
      case 'InvalidPasswordException':
        return 'Password does not meet requirements (min 8 chars, upper, lower, number, symbol).';
      case 'LimitExceededException':
        return 'Too many attempts. Please try again later.';
      case 'UserNotFoundException':
        return 'No account found. Please contact your company owner.';
      default:
        return err?.message ?? 'Something went wrong. Please try again.';
    }
  }
}

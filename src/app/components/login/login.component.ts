import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, filter, take } from 'rxjs';
import { UserStoreService } from '../../store/user/user-store.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnDestroy {
  loginForm: FormGroup;
  hidePassword = true;
  isLoading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userStore: UserStoreService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;

      // TODO: Implement actual authentication
      // For now, simulate login and load user
      setTimeout(() => {
        // Load user data from /api/me
        this.userStore.loadUser();

        // Wait for user data to be loaded, then redirect
        this.userStore.user$
          .pipe(
            filter(user => user !== null), // Wait until user is loaded
            take(1), // Take only the first emission
            takeUntil(this.destroy$)
          )
          .subscribe(user => {
            this.isLoading = false;

            // Check if user has multiple companies
            if (user.companies && user.companies.length > 1) {
              // User has multiple companies, let them select
              this.router.navigate(['/select-company']);
            } else if (user.companies && user.companies.length === 1) {
              // User has only one company, go to dashboard
              this.router.navigate(['/dashboard']);
            } else {
              // No companies, still go to dashboard (might show empty state)
              this.router.navigate(['/dashboard']);
            }
          });
      }, 1500);
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }
}

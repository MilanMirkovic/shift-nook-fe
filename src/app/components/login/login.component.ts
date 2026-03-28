import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, filter, take, of } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { UserStoreService } from '../../store/user/user-store.service';
import { catchError, tap } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  hidePassword = true;
  isLoading = false;
  errorMessage = '';
  private destroy$ = new Subject<void>();
  private returnUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private userStore: UserStoreService,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  async ngOnInit(): Promise<void> {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    if (await this.authService.isAuthenticated()) {
      this.router.navigateByUrl(this.returnUrl ?? '/dashboard');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async onSubmit(): Promise<void> {
    console.log('onSubmit called');
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';
    const { email, password } = this.loginForm.value;

    try {
      const result = await this.authService.signIn(email, password);
      console.log('signIn result:', result);

      if (result.nextStep?.signInStep === 'CONFIRM_SIGN_UP') {
        this.router.navigate(['/confirm'], { state: { email, returnUrl: this.returnUrl } });
        return;
      }

      console.log('Calling userStore.loadUser()');
      // Load user data from /api/me then redirect
      this.userStore.loadUser();
      this.userStore.user$
        .pipe(
          tap((user) => console.log('user$ emission:', user)),
          filter((user) => user !== null),
          take(1),
          takeUntil(this.destroy$),
          catchError((err) => {
            console.error('Error in user$ observable:', err);
            return of(null);
          }),
        )
        .subscribe((user) => {
          this.isLoading = false;
          console.log('User object after login:', user);
          if (!user) {
            console.log('Branch: user is null, returning');
            return;
          }

          if (user.role === 'ADMIN') {
            console.log('Branch: user is ADMIN, navigating to /dashboard');
            this.router.navigate(['/dashboard']);
            return;
          }

          if (this.returnUrl) {
            console.log('Branch: returnUrl present, navigating to', this.returnUrl);
            this.router.navigateByUrl(this.returnUrl);
            return;
          }

          if (user.companies && user.companies.length > 1) {
            console.log('Branch: user has multiple companies, navigating to /select-company');
            this.router.navigate(['/select-company']);
            return;
          }

          if (!user.companies || user.companies.length === 0) {
            if (user.canCreateCompany) {
              console.log('Branch: user has no companies and can create, navigating to /create-company');
              this.router.navigate(['/create-company']);
            } else {
              console.log('Branch: user has no companies and cannot create, navigating to /dashboard');
              this.router.navigate(['/dashboard']);
            }
            return;
          }

          console.log('Branch: fallback, navigating to /dashboard');
          this.router.navigate(['/dashboard']);
        });
    } catch (err: any) {
      this.isLoading = false;
      if (err?.name === 'UserAlreadyAuthenticatedException') {
        this.router.navigateByUrl(this.returnUrl ?? '/dashboard');
        return;
      }
      this.errorMessage = this.mapError(err);
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  private mapError(err: any): string {
    switch (err?.name) {
      case 'NotAuthorizedException':
        return 'Incorrect email or password.';
      case 'UserNotFoundException':
        return 'No account found with this email.';
      case 'UserNotConfirmedException':
        return 'Please confirm your email before signing in.';
      case 'LimitExceededException':
        return 'Too many attempts. Please try again later.';
      default:
        return err?.message ?? 'Sign-in failed. Please try again.';
    }
  }
}

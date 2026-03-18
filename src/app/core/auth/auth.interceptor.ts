import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { from, switchMap, catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { UserStoreService } from '../../store/user/user-store.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const userStore = inject(UserStoreService);

  // Public endpoints — skip
  if (
    !req.url.includes('/api/') ||
    req.url.includes('/api/health') ||
    req.url.includes('/invitations/preview')
  ) {
    return next(req);
  }

  // Local dev mode — skip Cognito, inject a hardcoded token
  if (environment.skipCognito) {
    const token = environment.localAuthToken;
    const localReq = token
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;
    return next(localReq);
  }

  return from(authService.getAccessToken()).pipe(
    switchMap(token => {
      if (token) {
        req = req.clone({
          setHeaders: { Authorization: `Bearer ${token}` },
        });
      }
      return next(req);
    }),
    catchError(err => {
      if (err?.status === 401) {
        const currentUrl = router.url;
        const publicRoutes = ['/accept-invite', '/auth/set-password', '/auth/reset-password', '/login', '/signup'];
        const isPublicRoute = publicRoutes.some(r => currentUrl.startsWith(r));
        if (!isPublicRoute) {
          // Token expired or invalid — force logout and redirect to login
          authService.signOut().finally(() => {
            userStore.logout();
            router.navigate(['/login']);
          });
        }
      }
      return throwError(() => err);
    }),
  );
};

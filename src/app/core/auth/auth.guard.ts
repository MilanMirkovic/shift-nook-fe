import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = async (_route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (await authService.isAuthenticated()) {
    return true;
  }
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

/** Redirects already-signed-in users away from public auth pages (login, signup, etc.) */
export const publicGuard: CanActivateFn = async (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (await authService.isAuthenticated()) {
    const returnUrl = route.queryParamMap.get('returnUrl');
    if (returnUrl) {
      return router.parseUrl(returnUrl);
    }
    return router.createUrlTree(['/dashboard']);
  }
  return true;
};

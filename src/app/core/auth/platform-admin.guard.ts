import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { UserStoreService } from '../../store/user/user-store.service';

/**
 * Route guard that only allows access for users with platform role === 'ADMIN'.
 * Redirects to /dashboard if the user is not a platform admin.
 */
export const platformAdminGuard: CanActivateFn = () => {
  const userStore = inject(UserStoreService);
  const router = inject(Router);

  return userStore.user$.pipe(
    take(1),
    map(user => {
      if (user?.role === 'ADMIN') {
        return true;
      }
      return router.createUrlTree(['/dashboard']);
    })
  );
};


import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { UserStoreService } from '../../store/user/user-store.service';
import { CompanyRole } from '../../shared/models/company-role';

export const dashboardRoleGuard: CanActivateFn = () => {
  const userStore = inject(UserStoreService);
  const router = inject(Router);

  return userStore.user$.pipe(
    take(1),
    map(user => {
      // Get the user's role in their current company (first company as fallback)
      const role = user?.companies?.[0]?.role;
      const allowed = [CompanyRole.OWNER, CompanyRole.ACCOUNTANT];
      if (role && allowed.includes(role)) {
        return true;
      }
      return router.createUrlTree(['/unauthorized']);
    })
  );
};

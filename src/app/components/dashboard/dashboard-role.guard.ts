import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, filter, map, take } from 'rxjs';
import { UserStoreService } from '../../store/user/user-store.service';
import { selectUserLoading } from '../../store/user/user.selectors';
import { CompanyRole } from '../../shared/models/company-role';

export const dashboardRoleGuard: CanActivateFn = () => {
  const userStore = inject(UserStoreService);
  const store     = inject(Store);
  const router    = inject(Router);

  // Trigger load in case user data isn't in the store yet
  userStore.loadUser();

  return combineLatest([userStore.user$, store.select(selectUserLoading)]).pipe(
    // Wait until the load has finished (loading = false) AND user is present
    filter(([user, loading]) => !loading && user !== null),
    take(1),
    map(([user]) => {
      // No companies at all — send to create-company or jobsites
      if (!user?.companies || user.companies.length === 0) {
        if (user?.canCreateCompany) {
          return router.createUrlTree(['/create-company']);
        }
        return router.createUrlTree(['/jobsites']);
      }

      const role = user.companies[0].role;
      const allowed = [CompanyRole.OWNER, CompanyRole.ACCOUNTANT];
      if (allowed.includes(role)) {
        return true;
      }

      // Workers and other roles go to jobsites
      return router.createUrlTree(['/jobsites']);
    })
  );
};

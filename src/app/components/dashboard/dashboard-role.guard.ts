import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, filter, map, take } from 'rxjs';
import { UserStoreService } from '../../store/user/user-store.service';
import { selectUserLoading, selectCurrentCompany } from '../../store/user/user.selectors';
import { CompanyRole } from '../../shared/models/company-role';

export const dashboardRoleGuard: CanActivateFn = () => {
  const userStore = inject(UserStoreService);
  const store     = inject(Store);
  const router    = inject(Router);

  // Only trigger a load if user data is not yet in the store.
  // Avoid re-triggering when navigating from accept-invite, which already
  // loaded a fresh user profile — that would create a race condition.
  userStore.user$.pipe(take(1)).subscribe(user => {
    if (!user) {
      userStore.loadUser();
    }
  });

  return combineLatest([
    userStore.user$,
    store.select(selectUserLoading),
    store.select(selectCurrentCompany),
  ]).pipe(
    // Wait until the load has finished (loading = false) AND user is present
    filter(([user, loading]) => !loading && user !== null),
    take(1),
    map(([user, , currentCompany]) => {
      // No companies at all — send to create-company or select-company
      if (!user?.companies || user.companies.length === 0) {
        if (user?.canCreateCompany) {
          return router.createUrlTree(['/create-company']);
        }
        return router.createUrlTree(['/jobsites']);
      }

      // Use the selected company's role (falls back to first company if none selected)
      const role = currentCompany?.role ?? user.companies[0].role;
      const allowed = [CompanyRole.OWNER, CompanyRole.ACCOUNTANT];
      if (allowed.includes(role)) {
        return true;
      }

      // Workers and other roles go to jobsites
      return router.createUrlTree(['/jobsites']);
    })
  );
};

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { UserStoreService } from '../../store/user/user-store.service';
import { CompanyRole } from '../../shared/models/company-role';

/**
 * Creates a route guard that only allows access for users whose current company role
 * matches one of the specified roles.
 */
export function roleGuard(...allowedRoles: CompanyRole[]): CanActivateFn {
  return () => {
    const userStore = inject(UserStoreService);
    const router = inject(Router);

    return userStore.currentCompany$.pipe(
      take(1),
      map(company => {
        if (company && allowedRoles.includes(company.role as CompanyRole)) {
          return true;
        }
        return router.createUrlTree(['/dashboard']);
      })
    );
  };
}


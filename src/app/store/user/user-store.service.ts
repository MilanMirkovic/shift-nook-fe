import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, map } from 'rxjs';

import { selectUser, selectIsAuthenticated, selectUserCompanies, selectCurrentCompany, selectSelectedCompanyId } from './user.selectors';
import { loadUser, clearUser, selectCompany } from './user.actions';
import { User, CompanyMembership } from './user.models';
import { CompanyRole } from '../../shared/models/company-role';

@Injectable({ providedIn: 'root' })
export class UserStoreService {
  private readonly store = inject(Store);

  // Observables
  readonly user$ = this.store.select(selectUser);
  readonly isAuthenticated$ = this.store.select(selectIsAuthenticated);
  readonly companies$ = this.store.select(selectUserCompanies);
  readonly currentCompany$ = this.store.select(selectCurrentCompany);
  readonly selectedCompanyId$ = this.store.select(selectSelectedCompanyId);

  // Role check observables
  readonly isOwner$ = this.user$.pipe(
    map(user => this.hasRole(user, CompanyRole.OWNER))
  );

  readonly isAccountant$ = this.user$.pipe(
    map(user => this.hasRole(user, CompanyRole.ACCOUNTANT))
  );

  readonly isWorker$ = this.user$.pipe(
    map(user => this.hasRole(user, CompanyRole.WORKER))
  );

  readonly isAdmin$ = this.user$.pipe(
    map(user => this.hasRole(user, CompanyRole.ADMIN))
  );

  // Platform-level admin check (checks user.role, NOT company role)
  readonly isPlatformAdmin$ = this.user$.pipe(
    map(user => user?.role === 'ADMIN')
  );

  // Actions
  loadUser(): void {
    this.store.dispatch(loadUser());
  }

  logout(): void {
    this.store.dispatch(clearUser());
  }

  selectCompany(companyId: string): void {
    this.store.dispatch(selectCompany({ companyId }));
  }

  // Synchronous role checks (for use in guards, etc.)
  // Note: These check the current snapshot of the store
  isOwner(): Observable<boolean> {
    return this.isOwner$;
  }

  isAccountant(): Observable<boolean> {
    return this.isAccountant$;
  }

  isWorker(): Observable<boolean> {
    return this.isWorker$;
  }

  isAdmin(): Observable<boolean> {
    return this.isAdmin$;
  }

  hasRole(user: User | null, role: CompanyRole): boolean {
    if (!user || !user.companies || user.companies.length === 0) {
      return false;
    }
    // Check if user has the role in ANY company
    return user.companies.some(company => company.role === role);
  }

  hasRoleInCompany(user: User | null, companyId: string, role: CompanyRole): boolean {
    if (!user || !user.companies) {
      return false;
    }
    const membership = user.companies.find(c => c.companyId === companyId);
    return membership?.role === role;
  }

  // Get user's role in a specific company
  getRoleInCompany(companyId: string): Observable<CompanyRole | null> {
    return this.user$.pipe(
      map(user => {
        if (!user || !user.companies) return null;
        const membership = user.companies.find(c => c.companyId === companyId);
        return membership?.role ?? null;
      })
    );
  }

  // Check if user can create a company
  canCreateCompany(): Observable<boolean> {
    return this.user$.pipe(
      map(user => user?.canCreateCompany ?? false)
    );
  }

  // Get all companies user belongs to
  getUserCompanies(): Observable<CompanyMembership[]> {
    return this.companies$;
  }

  // Get current/primary company (first one in the list)
  getCurrentCompany(): Observable<CompanyMembership | null> {
    return this.currentCompany$;
  }
}

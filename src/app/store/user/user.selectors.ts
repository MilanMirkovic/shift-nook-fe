import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UserState } from './user.models';

export const USER_FEATURE_KEY = 'user';

export const selectUserState = createFeatureSelector<UserState>(USER_FEATURE_KEY);

export const selectUser = createSelector(selectUserState, state => state.user);

export const selectUserLoading = createSelector(selectUserState, state => state.loading);

export const selectUserError = createSelector(selectUserState, state => state.error);

export const selectUserCompanies = createSelector(
  selectUser,
  user => user?.companies ?? []
);

export const selectSelectedCompanyId = createSelector(
  selectUserState,
  state => state.selectedCompanyId
);

export const selectCurrentCompany = createSelector(
  selectUser,
  selectSelectedCompanyId,
  (user, selectedCompanyId) => {
    if (!user?.companies) return null;
    if (selectedCompanyId) {
      return user.companies.find(c => c.companyId === selectedCompanyId) ?? null;
    }
    // Fallback to first company if none selected
    return user.companies[0] ?? null;
  }
);

export const selectIsAuthenticated = createSelector(
  selectUser,
  user => user !== null
);

export const selectCurrentUserRole = createSelector(
  selectCurrentCompany,
  company => company?.role ?? null
);

export const selectCanManageJobsites = createSelector(
  selectCurrentUserRole,
  role => role === 'OWNER' || role === 'ACCOUNTANT'
);

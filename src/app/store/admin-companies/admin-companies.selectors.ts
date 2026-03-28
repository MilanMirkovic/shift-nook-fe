import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AdminCompaniesState } from './admin-companies.models';
import { ADMIN_COMPANIES_FEATURE_KEY } from './admin-companies.reducer';

export const selectAdminCompaniesState =
  createFeatureSelector<AdminCompaniesState>(ADMIN_COMPANIES_FEATURE_KEY);

export const selectAdminCompanies =
  createSelector(selectAdminCompaniesState, (s) => s.items);

export const selectAdminCompaniesTotal =
  createSelector(selectAdminCompaniesState, (s) => s.total);

export const selectAdminCompaniesPage =
  createSelector(selectAdminCompaniesState, (s) => s.page);

export const selectAdminCompaniesSize =
  createSelector(selectAdminCompaniesState, (s) => s.size);

export const selectAdminCompaniesLoading =
  createSelector(selectAdminCompaniesState, (s) => s.loading);

export const selectAdminCompaniesError =
  createSelector(selectAdminCompaniesState, (s) => s.error);

export const selectSelectedAdminCompany =
  createSelector(selectAdminCompaniesState, (s) => s.selectedCompany);

export const selectSelectedAdminCompanyLoading =
  createSelector(selectAdminCompaniesState, (s) => s.selectedCompanyLoading);

export const selectSelectedAdminCompanyError =
  createSelector(selectAdminCompaniesState, (s) => s.selectedCompanyError);

export const selectAdminCompaniesSubmitting =
  createSelector(selectAdminCompaniesState, (s) => s.submitting);

export const selectAdminCompaniesSubmitError =
  createSelector(selectAdminCompaniesState, (s) => s.submitError);


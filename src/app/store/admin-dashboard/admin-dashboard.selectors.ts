import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AdminDashboardState } from './admin-dashboard.models';
import { ADMIN_DASHBOARD_FEATURE_KEY } from './admin-dashboard.reducer';

export const selectAdminDashboardState =
  createFeatureSelector<AdminDashboardState>(ADMIN_DASHBOARD_FEATURE_KEY);

export const selectAdminDashboardStats =
  createSelector(selectAdminDashboardState, (s) => s.stats);

export const selectAdminDashboardRecentUsers =
  createSelector(selectAdminDashboardState, (s) => s.recentUsers);

export const selectAdminDashboardRecentCompanies =
  createSelector(selectAdminDashboardState, (s) => s.recentCompanies);

export const selectAdminDashboardLoading =
  createSelector(selectAdminDashboardState, (s) => s.loading);

export const selectAdminDashboardError =
  createSelector(selectAdminDashboardState, (s) => s.error);

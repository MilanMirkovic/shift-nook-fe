import { createAction, props } from '@ngrx/store';
import { AdminPlatformStats, RecentUser, RecentCompany } from './admin-dashboard.models';

export const loadAdminDashboard = createAction('[Admin Dashboard] Load');

export const loadAdminDashboardSuccess = createAction(
  '[Admin Dashboard] Load Success',
  props<{ stats: AdminPlatformStats; recentUsers: RecentUser[]; recentCompanies: RecentCompany[] }>()
);

export const loadAdminDashboardFailure = createAction(
  '[Admin Dashboard] Load Failure',
  props<{ error: string }>()
);


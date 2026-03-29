import { createReducer, on } from '@ngrx/store';
import { AdminDashboardState } from './admin-dashboard.models';
import * as Actions from './admin-dashboard.actions';

export const ADMIN_DASHBOARD_FEATURE_KEY = 'adminDashboard';

export const initialState: AdminDashboardState = {
  stats: null,
  recentUsers: [],
  recentCompanies: [],
  loading: false,
  error: null,
};

export const adminDashboardReducer = createReducer(
  initialState,
  on(Actions.loadAdminDashboard, (state) => ({ ...state, loading: true, error: null })),
  on(Actions.loadAdminDashboardSuccess, (state, { stats, recentUsers, recentCompanies }) => ({
    ...state,
    stats,
    recentUsers,
    recentCompanies,
    loading: false,
  })),
  on(Actions.loadAdminDashboardFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  }))
);


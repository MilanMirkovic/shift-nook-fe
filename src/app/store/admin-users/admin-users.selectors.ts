import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AdminUsersState } from './admin-users.models';
import { ADMIN_USERS_FEATURE_KEY } from './admin-users.reducer';

export const selectAdminUsersState =
  createFeatureSelector<AdminUsersState>(ADMIN_USERS_FEATURE_KEY);

export const selectAdminUsers =
  createSelector(selectAdminUsersState, (s) => s.items);

export const selectAdminUsersTotal =
  createSelector(selectAdminUsersState, (s) => s.total);

export const selectAdminUsersPage =
  createSelector(selectAdminUsersState, (s) => s.page);

export const selectAdminUsersSize =
  createSelector(selectAdminUsersState, (s) => s.size);

export const selectAdminUsersLoading =
  createSelector(selectAdminUsersState, (s) => s.loading);

export const selectAdminUsersError =
  createSelector(selectAdminUsersState, (s) => s.error);

export const selectSelectedAdminUser =
  createSelector(selectAdminUsersState, (s) => s.selectedUser);

export const selectSelectedAdminUserLoading =
  createSelector(selectAdminUsersState, (s) => s.selectedUserLoading);

export const selectSelectedAdminUserError =
  createSelector(selectAdminUsersState, (s) => s.selectedUserError);

export const selectAdminUsersSubmitting =
  createSelector(selectAdminUsersState, (s) => s.submitting);

export const selectAdminUsersSubmitError =
  createSelector(selectAdminUsersState, (s) => s.submitError);


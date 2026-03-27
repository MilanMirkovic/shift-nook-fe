import { createAction, props } from '@ngrx/store';
import { AdminUser, CreateUserRequest, AssignCompanyRequest } from './admin-users.models';
import { UserRole } from '../../shared/models/user-role';

// ── List users ──────────────────────────────────────────────────────────────
export const loadAdminUsers = createAction(
  '[Admin Users] Load',
  props<{ page: number; size: number; role?: UserRole; q?: string }>()
);

export const loadAdminUsersSuccess = createAction(
  '[Admin Users] Load Success',
  props<{ users: AdminUser[]; total: number; page: number; size: number }>()
);

export const loadAdminUsersFailure = createAction(
  '[Admin Users] Load Failure',
  props<{ error: string }>()
);

// ── Get single user ─────────────────────────────────────────────────────────
export const loadAdminUser = createAction(
  '[Admin Users] Load One',
  props<{ userId: string }>()
);

export const loadAdminUserSuccess = createAction(
  '[Admin Users] Load One Success',
  props<{ user: AdminUser }>()
);

export const loadAdminUserFailure = createAction(
  '[Admin Users] Load One Failure',
  props<{ error: string }>()
);

// ── Create user ─────────────────────────────────────────────────────────────
export const createAdminUser = createAction(
  '[Admin Users] Create',
  props<{ request: CreateUserRequest }>()
);

export const createAdminUserSuccess = createAction(
  '[Admin Users] Create Success',
  props<{ user: AdminUser }>()
);

export const createAdminUserFailure = createAction(
  '[Admin Users] Create Failure',
  props<{ error: string }>()
);

// ── Update role ─────────────────────────────────────────────────────────────
export const updateAdminUserRole = createAction(
  '[Admin Users] Update Role',
  props<{ userId: string; role: UserRole }>()
);

export const updateAdminUserRoleSuccess = createAction(
  '[Admin Users] Update Role Success',
  props<{ user: AdminUser }>()
);

export const updateAdminUserRoleFailure = createAction(
  '[Admin Users] Update Role Failure',
  props<{ error: string }>()
);

// ── Assign company ──────────────────────────────────────────────────────────
export const assignAdminUserCompany = createAction(
  '[Admin Users] Assign Company',
  props<{ userId: string; request: AssignCompanyRequest }>()
);

export const assignAdminUserCompanySuccess = createAction(
  '[Admin Users] Assign Company Success',
  props<{ user: AdminUser }>()
);

export const assignAdminUserCompanyFailure = createAction(
  '[Admin Users] Assign Company Failure',
  props<{ error: string }>()
);

// ── Remove from company ─────────────────────────────────────────────────────
export const removeAdminUserFromCompany = createAction(
  '[Admin Users] Remove From Company',
  props<{ userId: string; companyId: string }>()
);

export const removeAdminUserFromCompanySuccess = createAction(
  '[Admin Users] Remove From Company Success',
  props<{ userId: string; companyId: string }>()
);

export const removeAdminUserFromCompanyFailure = createAction(
  '[Admin Users] Remove From Company Failure',
  props<{ error: string }>()
);

// ── Clear state ─────────────────────────────────────────────────────────────
export const clearAdminUserDetail = createAction('[Admin Users] Clear Detail');
export const clearAdminUsersError = createAction('[Admin Users] Clear Error');


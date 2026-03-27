import { createReducer, on } from '@ngrx/store';
import { AdminUsersState } from './admin-users.models';
import * as Actions from './admin-users.actions';

export const ADMIN_USERS_FEATURE_KEY = 'adminUsers';

export const initialState: AdminUsersState = {
  items: [],
  total: 0,
  page: 0,
  size: 50,
  loading: false,
  error: null,

  selectedUser: null,
  selectedUserLoading: false,
  selectedUserError: null,

  submitting: false,
  submitError: null,
};

export const adminUsersReducer = createReducer(
  initialState,

  // ── List ────────────────────────────────────────────────────────────────
  on(Actions.loadAdminUsers, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(Actions.loadAdminUsersSuccess, (state, { users, total, page, size }) => ({
    ...state,
    items: users,
    total,
    page,
    size,
    loading: false,
  })),
  on(Actions.loadAdminUsersFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // ── Single user ─────────────────────────────────────────────────────────
  on(Actions.loadAdminUser, (state) => ({
    ...state,
    selectedUserLoading: true,
    selectedUserError: null,
  })),
  on(Actions.loadAdminUserSuccess, (state, { user }) => ({
    ...state,
    selectedUser: user,
    selectedUserLoading: false,
  })),
  on(Actions.loadAdminUserFailure, (state, { error }) => ({
    ...state,
    selectedUserLoading: false,
    selectedUserError: error,
  })),

  // ── Create ──────────────────────────────────────────────────────────────
  on(Actions.createAdminUser, (state) => ({
    ...state,
    submitting: true,
    submitError: null,
  })),
  on(Actions.createAdminUserSuccess, (state, { user }) => ({
    ...state,
    items: [user, ...state.items],
    total: state.total + 1,
    submitting: false,
  })),
  on(Actions.createAdminUserFailure, (state, { error }) => ({
    ...state,
    submitting: false,
    submitError: error,
  })),

  // ── Update role ─────────────────────────────────────────────────────────
  on(Actions.updateAdminUserRole, (state) => ({
    ...state,
    submitting: true,
    submitError: null,
  })),
  on(Actions.updateAdminUserRoleSuccess, (state, { user }) => ({
    ...state,
    selectedUser: user,
    items: state.items.map((u) => (u.id === user.id ? { ...u, role: user.role } : u)),
    submitting: false,
  })),
  on(Actions.updateAdminUserRoleFailure, (state, { error }) => ({
    ...state,
    submitting: false,
    submitError: error,
  })),

  // ── Assign company ──────────────────────────────────────────────────────
  on(Actions.assignAdminUserCompany, (state) => ({
    ...state,
    submitting: true,
    submitError: null,
  })),
  on(Actions.assignAdminUserCompanySuccess, (state, { user }) => ({
    ...state,
    selectedUser: user,
    submitting: false,
  })),
  on(Actions.assignAdminUserCompanyFailure, (state, { error }) => ({
    ...state,
    submitting: false,
    submitError: error,
  })),

  // ── Remove from company ─────────────────────────────────────────────────
  on(Actions.removeAdminUserFromCompany, (state) => ({
    ...state,
    submitting: true,
    submitError: null,
  })),
  on(Actions.removeAdminUserFromCompanySuccess, (state, { userId, companyId }) => ({
    ...state,
    selectedUser: state.selectedUser
      ? {
          ...state.selectedUser,
          companies: state.selectedUser.companies.filter((c) => c.companyId !== companyId),
        }
      : null,
    submitting: false,
  })),
  on(Actions.removeAdminUserFromCompanyFailure, (state, { error }) => ({
    ...state,
    submitting: false,
    submitError: error,
  })),

  // ── Clear ───────────────────────────────────────────────────────────────
  on(Actions.clearAdminUserDetail, (state) => ({
    ...state,
    selectedUser: null,
    selectedUserLoading: false,
    selectedUserError: null,
  })),
  on(Actions.clearAdminUsersError, (state) => ({
    ...state,
    error: null,
    submitError: null,
  })),
);


import { createAction, props } from '@ngrx/store';
import {
  AccountantTeamMember,
  AccountantDetail,
  PagedResponse,
  AssignCompaniesRequest,
  AccountantTeamStats,
} from './accountant-team.models';

// ─── Load Accountants (List) ────────────────────────────────────────────────
export const loadAccountants = createAction(
  '[Accountant Team] Load Accountants',
  props<{
    companyId: string;
    page: number;
    size: number;
    q: string | null;
  }>()
);

export const loadAccountantsSuccess = createAction(
  '[Accountant Team] Load Accountants Success',
  props<{ response: PagedResponse<AccountantTeamMember> }>()
);

export const loadAccountantsFailure = createAction(
  '[Accountant Team] Load Accountants Failure',
  props<{ error: string }>()
);

// ─── Load Accountant Detail ─────────────────────────────────────────────────
export const loadAccountantDetail = createAction(
  '[Accountant Team] Load Accountant Detail',
  props<{ companyId: string; userId: string }>()
);

export const loadAccountantDetailSuccess = createAction(
  '[Accountant Team] Load Accountant Detail Success',
  props<{ accountant: AccountantDetail }>()
);

export const loadAccountantDetailFailure = createAction(
  '[Accountant Team] Load Accountant Detail Failure',
  props<{ error: string }>()
);

// ─── Assign Companies ───────────────────────────────────────────────────────
export const assignCompanies = createAction(
  '[Accountant Team] Assign Companies',
  props<{
    companyId: string;
    userId: string;
    request: AssignCompaniesRequest;
  }>()
);

export const assignCompaniesSuccess = createAction(
  '[Accountant Team] Assign Companies Success'
);

export const assignCompaniesFailure = createAction(
  '[Accountant Team] Assign Companies Failure',
  props<{ error: string }>()
);

// ─── Remove Company Assignment ──────────────────────────────────────────────
export const removeCompanyAssignment = createAction(
  '[Accountant Team] Remove Company Assignment',
  props<{
    companyId: string;
    userId: string;
    assignedCompanyId: string;
  }>()
);

export const removeCompanyAssignmentSuccess = createAction(
  '[Accountant Team] Remove Company Assignment Success',
  props<{ assignedCompanyId: string }>()
);

export const removeCompanyAssignmentFailure = createAction(
  '[Accountant Team] Remove Company Assignment Failure',
  props<{ error: string }>()
);

// ─── Filters & Pagination ───────────────────────────────────────────────────
export const updateFilters = createAction(
  '[Accountant Team] Update Filters',
  props<{ q: string | null }>()
);

export const updatePage = createAction(
  '[Accountant Team] Update Page',
  props<{ page: number; size: number }>()
);

// ─── Load Stats ─────────────────────────────────────────────────────────────
export const loadStats = createAction(
  '[Accountant Team] Load Stats',
  props<{ companyId: string }>()
);

export const loadStatsSuccess = createAction(
  '[Accountant Team] Load Stats Success',
  props<{ stats: AccountantTeamStats }>()
);

export const loadStatsFailure = createAction(
  '[Accountant Team] Load Stats Failure',
  props<{ error: string }>()
);

// ─── Invite Accountant ──────────────────────────────────────────────────────
export const inviteAccountant = createAction(
  '[Accountant Team] Invite Accountant',
  props<{
    companyId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  }>()
);

export const inviteAccountantSuccess = createAction(
  '[Accountant Team] Invite Accountant Success',
  props<{ accountant: AccountantTeamMember }>()
);

export const inviteAccountantFailure = createAction(
  '[Accountant Team] Invite Accountant Failure',
  props<{ error: string }>()
);

// ─── Update Accountant ──────────────────────────────────────────────────────
export const updateAccountant = createAction(
  '[Accountant Team] Update Accountant',
  props<{
    companyId: string;
    userId: string;
    updates: {
      firstName: string;
      lastName: string;
    };
  }>()
);

export const updateAccountantSuccess = createAction(
  '[Accountant Team] Update Accountant Success',
  props<{ accountant: AccountantTeamMember }>()
);

export const updateAccountantFailure = createAction(
  '[Accountant Team] Update Accountant Failure',
  props<{ error: string }>()
);

// ─── Clear State ────────────────────────────────────────────────────────────
export const clearAccountants = createAction('[Accountant Team] Clear Accountants');

export const clearSelectedAccountant = createAction('[Accountant Team] Clear Selected Accountant');

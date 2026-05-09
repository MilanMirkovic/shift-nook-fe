import { createReducer, on } from '@ngrx/store';
import { AccountantTeamState } from './accountant-team.models';
import * as AccountantTeamActions from './accountant-team.actions';

export const initialState: AccountantTeamState = {
  accountants: [],
  total: 0,
  page: 0,
  size: 20,
  filters: {
    q: null,
  },
  loading: false,
  loaded: false,
  error: null,

  stats: null,
  statsLoading: false,
  statsError: null,

  selectedAccountant: null,
  selectedLoading: false,
  selectedError: null,

  assigningCompanies: false,
  assignError: null,
};

export const accountantTeamReducer = createReducer(
  initialState,

  // ─── Load Accountants ───────────────────────────────────────────────────────
  on(AccountantTeamActions.loadAccountants, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(AccountantTeamActions.loadAccountantsSuccess, (state, { response }) => ({
    ...state,
    accountants: response.items,
    total: response.total,
    loading: false,
    loaded: true,
    error: null,
  })),

  on(AccountantTeamActions.loadAccountantsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // ─── Load Accountant Detail ─────────────────────────────────────────────────
  on(AccountantTeamActions.loadAccountantDetail, (state) => ({
    ...state,
    selectedLoading: true,
    selectedError: null,
  })),

  on(AccountantTeamActions.loadAccountantDetailSuccess, (state, { accountant }) => ({
    ...state,
    selectedAccountant: accountant,
    selectedLoading: false,
    selectedError: null,
  })),

  on(AccountantTeamActions.loadAccountantDetailFailure, (state, { error }) => ({
    ...state,
    selectedLoading: false,
    selectedError: error,
  })),

  // ─── Assign Companies ───────────────────────────────────────────────────────
  on(AccountantTeamActions.assignCompanies, (state) => ({
    ...state,
    assigningCompanies: true,
    assignError: null,
  })),

  on(AccountantTeamActions.assignCompaniesSuccess, (state) => ({
    ...state,
    assigningCompanies: false,
    assignError: null,
  })),

  on(AccountantTeamActions.assignCompaniesFailure, (state, { error }) => ({
    ...state,
    assigningCompanies: false,
    assignError: error,
  })),

  // ─── Remove Company Assignment ──────────────────────────────────────────────
  on(AccountantTeamActions.removeCompanyAssignmentSuccess, (state, { assignedCompanyId }) => {
    if (!state.selectedAccountant) return state;

    return {
      ...state,
      selectedAccountant: {
        ...state.selectedAccountant,
        assignedCompanies: state.selectedAccountant.assignedCompanies.filter(
          (c) => c.companyId !== assignedCompanyId
        ),
        metrics: {
          ...state.selectedAccountant.metrics,
          companiesAssigned: state.selectedAccountant.metrics.companiesAssigned - 1,
        },
      },
    };
  }),

  // ─── Load Stats ─────────────────────────────────────────────────────────────
  on(AccountantTeamActions.loadStats, (state) => ({
    ...state,
    statsLoading: true,
    statsError: null,
  })),

  on(AccountantTeamActions.loadStatsSuccess, (state, { stats }) => ({
    ...state,
    stats,
    statsLoading: false,
    statsError: null,
  })),

  on(AccountantTeamActions.loadStatsFailure, (state, { error }) => ({
    ...state,
    statsLoading: false,
    statsError: error,
  })),

  // ─── Invite Accountant ──────────────────────────────────────────────────────
  on(AccountantTeamActions.inviteAccountant, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(AccountantTeamActions.inviteAccountantSuccess, (state, { accountant }) => ({
    ...state,
    accountants: [...state.accountants, accountant],
    total: state.total + 1,
    loading: false,
    error: null,
  })),

  on(AccountantTeamActions.inviteAccountantFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // ─── Update Accountant ──────────────────────────────────────────────────────
  on(AccountantTeamActions.updateAccountant, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(AccountantTeamActions.updateAccountantSuccess, (state, { accountant }) => ({
    ...state,
    accountants: state.accountants.map((a) =>
      a.userId === accountant.userId ? accountant : a
    ),
    loading: false,
    error: null,
  })),

  on(AccountantTeamActions.updateAccountantFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // ─── Filters & Pagination ───────────────────────────────────────────────────
  on(AccountantTeamActions.updateFilters, (state, { q }) => ({
    ...state,
    filters: { q },
    page: 0, // Reset to first page
  })),

  on(AccountantTeamActions.updatePage, (state, { page, size }) => ({
    ...state,
    page,
    size,
  })),

  // ─── Clear State ────────────────────────────────────────────────────────────
  on(AccountantTeamActions.clearAccountants, () => initialState),

  on(AccountantTeamActions.clearSelectedAccountant, (state) => ({
    ...state,
    selectedAccountant: null,
    selectedLoading: false,
    selectedError: null,
  }))
);

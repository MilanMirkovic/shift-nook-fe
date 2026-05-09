import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AccountantTeamState, ACCOUNTANT_TEAM_FEATURE_KEY } from './accountant-team.models';

// Feature selector
export const selectAccountantTeamState = createFeatureSelector<AccountantTeamState>(
  ACCOUNTANT_TEAM_FEATURE_KEY
);

// ─── List State ─────────────────────────────────────────────────────────────
export const selectAccountants = createSelector(
  selectAccountantTeamState,
  (state) => state.accountants
);

export const selectTotal = createSelector(
  selectAccountantTeamState,
  (state) => state.total
);

export const selectPage = createSelector(
  selectAccountantTeamState,
  (state) => state.page
);

export const selectPageSize = createSelector(
  selectAccountantTeamState,
  (state) => state.size
);

export const selectFilters = createSelector(
  selectAccountantTeamState,
  (state) => state.filters
);

export const selectLoading = createSelector(
  selectAccountantTeamState,
  (state) => state.loading
);

export const selectLoaded = createSelector(
  selectAccountantTeamState,
  (state) => state.loaded
);

export const selectError = createSelector(
  selectAccountantTeamState,
  (state) => state.error
);

// ─── Stats ──────────────────────────────────────────────────────────────────
export const selectStats = createSelector(
  selectAccountantTeamState,
  (state) => state.stats
);

export const selectStatsLoading = createSelector(
  selectAccountantTeamState,
  (state) => state.statsLoading
);

export const selectStatsError = createSelector(
  selectAccountantTeamState,
  (state) => state.statsError
);

// ─── Selected Accountant (Detail) ───────────────────────────────────────────
export const selectSelectedAccountant = createSelector(
  selectAccountantTeamState,
  (state) => state.selectedAccountant
);

export const selectSelectedAccountantLoading = createSelector(
  selectAccountantTeamState,
  (state) => state.selectedLoading
);

export const selectSelectedAccountantError = createSelector(
  selectAccountantTeamState,
  (state) => state.selectedError
);

// ─── Assign Companies State ─────────────────────────────────────────────────
export const selectAssigningCompanies = createSelector(
  selectAccountantTeamState,
  (state) => state.assigningCompanies
);

export const selectAssignError = createSelector(
  selectAccountantTeamState,
  (state) => state.assignError
);

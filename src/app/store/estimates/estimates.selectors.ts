import { createFeatureSelector, createSelector } from '@ngrx/store';
import { EstimatesState } from './estimates.models';

export const ESTIMATES_FEATURE_KEY = 'estimates';

export const selectEstimatesState = createFeatureSelector<EstimatesState>(ESTIMATES_FEATURE_KEY);

export const selectEstimates = createSelector(
  selectEstimatesState,
  (state) => state.estimates
);

export const selectEstimatesTotal = createSelector(
  selectEstimatesState,
  (state) => state.total
);

export const selectEstimatesLoading = createSelector(
  selectEstimatesState,
  (state) => state.loading
);

export const selectEstimatesError = createSelector(
  selectEstimatesState,
  (state) => state.error
);

export const selectEstimatesFilters = createSelector(
  selectEstimatesState,
  (state) => state.filters
);

export const selectEstimatesPage = createSelector(
  selectEstimatesState,
  (state) => state.filters.page
);

export const selectEstimatesSize = createSelector(
  selectEstimatesState,
  (state) => state.filters.size
);

export const selectEstimateById = (estimateId: string) => createSelector(
  selectEstimatesState,
  (state) => state.estimates.find(e => e.id === estimateId) ?? undefined
);

export const selectEstimatesByClientId = (clientId: string) => createSelector(
  selectEstimatesState,
  (state) => state.estimates.filter(e => e.clientId === clientId)
);


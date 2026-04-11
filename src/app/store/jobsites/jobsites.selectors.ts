import { createFeatureSelector, createSelector } from '@ngrx/store';
import { JobsitesState } from './jobsites.models';

export const JOBSITES_FEATURE_KEY = 'jobsites';

export const selectJobsitesState = createFeatureSelector<JobsitesState>(JOBSITES_FEATURE_KEY);

export const selectJobsites = createSelector(
  selectJobsitesState,
  (state) => state.jobsites
);

export const selectTotal = createSelector(
  selectJobsitesState,
  (state) => state.total
);

export const selectLoading = createSelector(
  selectJobsitesState,
  (state) => state.loading
);

export const selectLoaded = createSelector(
  selectJobsitesState,
  (state) => state.loaded
);

export const selectError = createSelector(
  selectJobsitesState,
  (state) => state.error
);

export const selectFilters = createSelector(
  selectJobsitesState,
  (state) => state.filters
);

// Additional selectors for the service
export const selectSelectedJobsite = createSelector(
  selectJobsitesState,
  (state) => state.jobsites[0] ?? undefined
);

export const selectJobsitesLoading = createSelector(
  selectJobsitesState,
  (state) => state.loading
);

export const selectJobsiteLoadingById = createSelector(
  selectJobsitesState,
  (state) => state.loading
);

export const selectJobsiteCreating = createSelector(
  selectJobsitesState,
  (state) => false
);

export const selectJobsitesError = createSelector(
  selectJobsitesState,
  (state) => state.error
);

export const selectJobsitesTotal = createSelector(
  selectJobsitesState,
  (state) => state.total
);

export const selectJobsitesPage = createSelector(
  selectJobsitesState,
  (state) => state.filters.page
);

export const selectJobsitesSize = createSelector(
  selectJobsitesState,
  (state) => state.filters.size
);

export const selectJobsiteById = (jobsiteId: string) => createSelector(
  selectJobsitesState,
  (state) => state.jobsites.find(j => j.id === jobsiteId) ?? undefined
);

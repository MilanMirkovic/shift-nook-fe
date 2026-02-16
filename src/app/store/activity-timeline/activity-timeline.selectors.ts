import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ActivityTimelineState } from './activity-timeline.models';

export const ACTIVITY_TIMELINE_FEATURE_KEY = 'activityTimeline';

export const selectActivityTimelineState = createFeatureSelector<ActivityTimelineState>(ACTIVITY_TIMELINE_FEATURE_KEY);

export const selectActivitiesByKey = (key: string) =>
  createSelector(
    selectActivityTimelineState,
    (state) => state.activities[key] || []
  );

export const selectActivitiesLoading = (key: string) =>
  createSelector(
    selectActivityTimelineState,
    (state) => state.loading[key] || false
  );

export const selectActivitiesError = (key: string) =>
  createSelector(
    selectActivityTimelineState,
    (state) => state.error[key] || null
  );

export const selectActivitiesPagination = (key: string) =>
  createSelector(
    selectActivityTimelineState,
    (state) => state.pagination[key] || {
      currentPage: 0,
      totalItems: 0,
      pageSize: 20,
      hasMore: false
    }
  );

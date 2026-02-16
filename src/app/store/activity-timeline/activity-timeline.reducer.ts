import { createReducer, on } from '@ngrx/store';
import { ActivityTimelineState } from './activity-timeline.models';
import * as ActivityTimelineActions from './activity-timeline.actions';

export const initialState: ActivityTimelineState = {
  activities: {},
  loading: {},
  error: {},
  pagination: {}
};

export const activityTimelineReducer = createReducer(
  initialState,

  on(ActivityTimelineActions.loadActivities, (state, { entityType, entityId, reset }) => {
    const key = `${entityType}:${entityId}`;
    return {
      ...state,
      loading: { ...state.loading, [key]: true },
      error: { ...state.error, [key]: null },
      // Clear activities if reset is true
      ...(reset ? { activities: { ...state.activities, [key]: [] } } : {})
    };
  }),

  on(ActivityTimelineActions.loadActivitiesSuccess, (state, { key, response, reset }) => {
    const existingActivities = state.activities[key] || [];
    const newActivities = reset ? response.items : [...existingActivities, ...response.items];

    return {
      ...state,
      activities: { ...state.activities, [key]: newActivities },
      loading: { ...state.loading, [key]: false },
      error: { ...state.error, [key]: null },
      pagination: {
        ...state.pagination,
        [key]: {
          currentPage: response.page,
          totalItems: response.total,
          pageSize: response.size,
          hasMore: (response.page + 1) * response.size < response.total
        }
      }
    };
  }),

  on(ActivityTimelineActions.loadActivitiesFailure, (state, { key, error }) => ({
    ...state,
    loading: { ...state.loading, [key]: false },
    error: { ...state.error, [key]: error }
  })),

  on(ActivityTimelineActions.clearActivities, (state, { key }) => {
    const { [key]: _, ...remainingActivities } = state.activities;
    const { [key]: __, ...remainingLoading } = state.loading;
    const { [key]: ___, ...remainingError } = state.error;
    const { [key]: ____, ...remainingPagination } = state.pagination;

    return {
      activities: remainingActivities,
      loading: remainingLoading,
      error: remainingError,
      pagination: remainingPagination
    };
  })
);

export const reducer = activityTimelineReducer;

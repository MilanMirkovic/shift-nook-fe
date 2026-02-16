import { createAction, props } from '@ngrx/store';
import { ActivityTimelineResponse } from '../../shared/models/activity.models';
import { LoadActivitiesParams } from './activity-timeline.models';

export const loadActivities = createAction(
  '[Activity Timeline] Load Activities',
  props<LoadActivitiesParams>()
);

export const loadActivitiesSuccess = createAction(
  '[Activity Timeline] Load Activities Success',
  props<{
    key: string;
    response: ActivityTimelineResponse;
    reset: boolean;
  }>()
);

export const loadActivitiesFailure = createAction(
  '[Activity Timeline] Load Activities Failure',
  props<{ key: string; error: string }>()
);

export const clearActivities = createAction(
  '[Activity Timeline] Clear Activities',
  props<{ key: string }>()
);


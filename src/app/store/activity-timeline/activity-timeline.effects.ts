import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of, timer } from 'rxjs';
import { map, catchError, switchMap, mergeMap } from 'rxjs/operators';
import { ActivityTimelineService } from '../../api/activity-timeline.service';
import * as ActivityTimelineActions from './activity-timeline.actions';
import * as JobsiteTaskActions from '../jobsite-tasks/jobsite-tasks.actions';

@Injectable()
export class ActivityTimelineEffects {
  private readonly actions$ = inject(Actions);
  private readonly activityService = inject(ActivityTimelineService);

  loadActivities$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ActivityTimelineActions.loadActivities),
      switchMap((action) => {
        const { companyId, entityType, entityId, reset = false, page = 0, size = 20, startDate, endDate } = action;

        const key = `${entityType}:${entityId}`;

        const params: any = {
          page,
          size
        };

        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        return this.activityService.getJobsiteActivity(companyId, entityId, params).pipe(
          map((response) => {
            return ActivityTimelineActions.loadActivitiesSuccess({ key, response, reset });
          }),
          catchError((error) => {
            return of(ActivityTimelineActions.loadActivitiesFailure({
              key,
              error: error.message || 'Failed to load activities'
            }));
          })
        );
      })
    )
  );

  // Auto-refresh activities when a task is created
  refreshActivitiesOnTaskCreated$ = createEffect(() =>
    this.actions$.pipe(
      ofType(JobsiteTaskActions.createJobsiteTaskSuccess),
      // Wait 2 seconds for backend to process audit log
      mergeMap((action) =>
        timer(2000).pipe(
          map(() => {
            const task = action.task;
            // Reload activities for this jobsite
            return ActivityTimelineActions.loadActivities({
              companyId: task.companyId || '',
              entityType: 'JOBSITE_TASK',
              entityId: task.jobsiteId,
              reset: true
            });
          })
        )
      )
    )
  );
}

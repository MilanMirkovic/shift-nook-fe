import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import {
  loadJobsiteTasks,
  loadJobsiteTasksSuccess,
  loadJobsiteTasksFailure,
  loadJobsiteTaskById,
  loadJobsiteTaskByIdSuccess,
  loadJobsiteTaskByIdFailure,
  createJobsiteTask,
  createJobsiteTaskSuccess,
  createJobsiteTaskFailure,
  updateJobsiteTask,
  updateJobsiteTaskSuccess,
  updateJobsiteTaskFailure,
  deleteJobsiteTask,
  deleteJobsiteTaskSuccess,
  deleteJobsiteTaskFailure
} from './jobsite-tasks.actions';
import { JobsiteTasksApi } from './jobsite-tasks.api';

@Injectable()
export class JobsiteTasksEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(JobsiteTasksApi);

  loadJobsiteTasks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadJobsiteTasks),
      switchMap(({ companyId, jobsiteId }) =>
        this.api.getJobsiteTasks(companyId, jobsiteId).pipe(
          map(({ items, total }) => loadJobsiteTasksSuccess({ tasks: items, total })),
          catchError((err) => of(loadJobsiteTasksFailure({ error: this.toErrorMessage(err) })))
        )
      )
    )
  );

  loadJobsiteTaskById$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadJobsiteTaskById),
      switchMap(({ companyId, jobsiteId, taskId }) =>
        this.api.getJobsiteTaskById(companyId, jobsiteId, taskId).pipe(
          map((task) => loadJobsiteTaskByIdSuccess({ task })),
          catchError((err) => of(loadJobsiteTaskByIdFailure({ error: this.toErrorMessage(err) })))
        )
      )
    )
  );

  createJobsiteTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createJobsiteTask),
      switchMap(({ companyId, task }) =>
        this.api.createJobsiteTask(companyId, task).pipe(
          map((createdTask) => createJobsiteTaskSuccess({ task: createdTask })),
          catchError((err) => of(createJobsiteTaskFailure({ error: this.toErrorMessage(err) })))
        )
      )
    )
  );

  updateJobsiteTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateJobsiteTask),
      switchMap(({ companyId, jobsiteId, taskId, updateData }) =>
        this.api.updateJobsiteTask(companyId, jobsiteId, taskId, updateData).pipe(
          map((updatedTask) => updateJobsiteTaskSuccess({ task: updatedTask })),
          catchError((err) => of(updateJobsiteTaskFailure({ error: this.toErrorMessage(err) })))
        )
      )
    )
  );

  deleteJobsiteTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteJobsiteTask),
      switchMap(({ companyId, jobsiteId, taskId }) =>
        this.api.deleteJobsiteTask(companyId, jobsiteId, taskId).pipe(
          map(() => deleteJobsiteTaskSuccess({ taskId })),
          catchError((err) => of(deleteJobsiteTaskFailure({ error: this.toErrorMessage(err) })))
        )
      )
    )
  );

  private toErrorMessage(err: unknown): string {
    if (typeof err === 'string') return err;

    const anyErr = err as any;
    const backendMessage = anyErr?.error?.message || anyErr?.error?.error || anyErr?.message;
    if (backendMessage && typeof backendMessage === 'string') return backendMessage;

    const status = anyErr?.status;
    const statusText = anyErr?.statusText;
    if (status) return `Request failed (${status}${statusText ? ` ${statusText}` : ''})`;

    return 'Request failed';
  }
}


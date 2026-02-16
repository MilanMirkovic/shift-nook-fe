import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import {
  loadTimesheets,
  loadTimesheetsSuccess,
  loadTimesheetsFailure,
  loadTimesheetById,
  loadTimesheetByIdSuccess,
  loadTimesheetByIdFailure,
  createTimesheet,
  createTimesheetSuccess,
  createTimesheetFailure,
  updateTimesheet,
  updateTimesheetSuccess,
  updateTimesheetFailure,
  loadWorkerTimesheets,
  loadWorkerTimesheetsSuccess,
  loadWorkerTimesheetsFailure
} from './timesheets.actions';
import { TimesheetsApi } from './timesheets.api';

@Injectable()
export class TimesheetsEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(TimesheetsApi);

  /**
   * Load timesheets when loadTimesheets action is dispatched
   */
  loadTimesheets$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadTimesheets),
      switchMap(({ companyId, page = 0, size = 20 }) =>
        this.api.getTimesheets(companyId, page, size).pipe(
          map(({ items, total }) => loadTimesheetsSuccess({ timesheets: items, total })),
          catchError((err) => of(loadTimesheetsFailure({ error: this.toErrorMessage(err) })))
        )
      )
    )
  );

  /**
   * Load worker timesheets when loadWorkerTimesheets action is dispatched
   */
  loadWorkerTimesheets$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadWorkerTimesheets),
      switchMap(({ companyId, workerUserId, page = 0, size = 20, sort, startDate, endDate }) =>
        this.api.getWorkerTimesheets(companyId, workerUserId, page, size, sort, startDate, endDate).pipe(
          map(({ items, total, page, size }) => loadWorkerTimesheetsSuccess({ timesheets: items, total, page, size })),
          catchError((err) => of(loadWorkerTimesheetsFailure({ error: this.toErrorMessage(err) })))
        )
      )
    )
  );

  /**
   * Load a single timesheet by ID
   */
  loadTimesheetById$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadTimesheetById),
      switchMap(({ companyId, timesheetId }) =>
        this.api.getTimesheetById(companyId, timesheetId).pipe(
          map((timesheet) => loadTimesheetByIdSuccess({ timesheet })),
          catchError((err) => of(loadTimesheetByIdFailure({ error: this.toErrorMessage(err) })))
        )
      )
    )
  );

  /**
   * Create a new timesheet entry (check-in)
   */
  createTimesheet$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createTimesheet),
      switchMap(({ companyId, timesheet }) =>
        this.api.createTimesheet(companyId, timesheet).pipe(
          map((createdTimesheet) => createTimesheetSuccess({ timesheet: createdTimesheet })),
          catchError((err) => of(createTimesheetFailure({ error: this.toErrorMessage(err) })))
        )
      )
    )
  );

  /**
   * Update a timesheet (check-out)
   */
  updateTimesheet$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateTimesheet),
      switchMap(({ companyId, timesheetId, updateData }) =>
        this.api.updateTimesheet(companyId, timesheetId, updateData).pipe(
          map((updatedTimesheet) => updateTimesheetSuccess({ timesheet: updatedTimesheet })),
          catchError((err) => of(updateTimesheetFailure({ error: this.toErrorMessage(err) })))
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

import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { CompanyWorkSessionsApiService } from './company-work-sessions.api';
import * as WorkSessionActions from './company-work-sessions.actions';

@Injectable()
export class CompanyWorkSessionsEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(CompanyWorkSessionsApiService);

  // ========== Load Current Session ==========

  loadCurrentSession$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WorkSessionActions.loadCurrentSession),
      switchMap(() =>
        this.api.getCurrentSession().pipe(
          map(session => WorkSessionActions.loadCurrentSessionSuccess({ session })),
          catchError(error => {
            console.error('Error loading current session:', error);
            return of(WorkSessionActions.loadCurrentSessionFailure({
              error: error.message || 'Failed to load current session'
            }));
          })
        )
      )
    )
  );

  // ========== Start Work Session ==========

  startWorkSession$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WorkSessionActions.startWorkSession),
      switchMap(({ companyId }) =>
        this.api.startWorkSession({ companyId }).pipe(
          map(session => WorkSessionActions.startWorkSessionSuccess({ session })),
          catchError(error => {
            console.error('Error starting work session:', error);
            const errorMessage = error.status === 404
              ? 'Company not found'
              : error.message || 'Failed to start work session';
            return of(WorkSessionActions.startWorkSessionFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  // ========== Stop Work Session ==========

  stopWorkSession$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WorkSessionActions.stopWorkSession),
      switchMap(({ description }) =>
        this.api.stopWorkSession({ description }).pipe(
          map(session => WorkSessionActions.stopWorkSessionSuccess({ session })),
          catchError(error => {
            console.error('Error stopping work session:', error);
            const errorMessage = error.status === 404
              ? 'No active session to stop'
              : error.message || 'Failed to stop work session';
            return of(WorkSessionActions.stopWorkSessionFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  // ========== Statistics Effects ==========

  loadDailyStatistics$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WorkSessionActions.loadDailyStatistics),
      switchMap(({ date, timezone }) =>
        this.api.getDailyStatistics(date, timezone).pipe(
          map(statistics => WorkSessionActions.loadStatisticsSuccess({ statistics })),
          catchError(error => {
            console.error('Error loading daily statistics:', error);
            return of(WorkSessionActions.loadStatisticsFailure({
              error: error.message || 'Failed to load statistics'
            }));
          })
        )
      )
    )
  );

  loadWeeklyStatistics$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WorkSessionActions.loadWeeklyStatistics),
      switchMap(({ weekStart, timezone }) =>
        this.api.getWeeklyStatistics(weekStart, timezone).pipe(
          map(statistics => WorkSessionActions.loadStatisticsSuccess({ statistics })),
          catchError(error => {
            console.error('Error loading weekly statistics:', error);
            return of(WorkSessionActions.loadStatisticsFailure({
              error: error.message || 'Failed to load statistics'
            }));
          })
        )
      )
    )
  );

  loadMonthlyStatistics$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WorkSessionActions.loadMonthlyStatistics),
      switchMap(({ year, month, timezone }) =>
        this.api.getMonthlyStatistics(year, month, timezone).pipe(
          map(statistics => WorkSessionActions.loadStatisticsSuccess({ statistics })),
          catchError(error => {
            console.error('Error loading monthly statistics:', error);
            return of(WorkSessionActions.loadStatisticsFailure({
              error: error.message || 'Failed to load statistics'
            }));
          })
        )
      )
    )
  );

  loadYearlyStatistics$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WorkSessionActions.loadYearlyStatistics),
      switchMap(({ year, timezone }) =>
        this.api.getYearlyStatistics(year, timezone).pipe(
          map(statistics => WorkSessionActions.loadStatisticsSuccess({ statistics })),
          catchError(error => {
            console.error('Error loading yearly statistics:', error);
            return of(WorkSessionActions.loadStatisticsFailure({
              error: error.message || 'Failed to load statistics'
            }));
          })
        )
      )
    )
  );
}

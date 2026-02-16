import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import {
  selectTimesheets,
  selectSelectedTimesheet,
  selectTimesheetsLoading,
  selectTimesheetLoadingById,
  selectTimesheetCreating,
  selectTimesheetUpdating,
  selectTimesheetsError,
  selectTimesheetsTotal,
  selectTimesheetsPage,
  selectTimesheetsSize,
  selectTimesheetById,
  selectActiveTimesheets,
  selectCompletedTimesheets,
  selectActiveTimesheetsForWorker
} from './timesheets.selectors';
import {
  loadTimesheets,
  loadWorkerTimesheets,
  loadTimesheetById,
  createTimesheet,
  updateTimesheet,
  updatePage,
  clearTimesheets
} from './timesheets.actions';
import { Timesheet, CreateTimesheetRequest, UpdateTimesheetRequest } from './timesheets.models';

@Injectable({ providedIn: 'root' })
export class TimesheetsStoreService {
  private readonly store = inject(Store);

  // Observables
  readonly timesheets$ = this.store.select(selectTimesheets);
  readonly selectedTimesheet$ = this.store.select(selectSelectedTimesheet);
  readonly loading$ = this.store.select(selectTimesheetsLoading);
  readonly loadingById$ = this.store.select(selectTimesheetLoadingById);
  readonly creating$ = this.store.select(selectTimesheetCreating);
  readonly updating$ = this.store.select(selectTimesheetUpdating);
  readonly error$ = this.store.select(selectTimesheetsError);
  readonly total$ = this.store.select(selectTimesheetsTotal);
  readonly page$ = this.store.select(selectTimesheetsPage);
  readonly size$ = this.store.select(selectTimesheetsSize);
  readonly activeTimesheets$ = this.store.select(selectActiveTimesheets);
  readonly completedTimesheets$ = this.store.select(selectCompletedTimesheets);

  /**
   * Load timesheets for a specific company
   */
  loadTimesheets(companyId: string, page = 0, size = 20): void {
    this.store.dispatch(loadTimesheets({ companyId, page, size }));
  }

  /**
   * Load timesheets for a specific worker
   */
  loadWorkerTimesheets(companyId: string, workerUserId: string, page = 0, size = 20, sort?: string[], startDate?: string, endDate?: string): void {
    this.store.dispatch(loadWorkerTimesheets({ companyId, workerUserId, page, size, sort, startDate, endDate }));
  }

  /**
   * Load a single timesheet by ID
   */
  loadTimesheetById(companyId: string, timesheetId: string): void {
    this.store.dispatch(loadTimesheetById({ companyId, timesheetId }));
  }

  /**
   * Create a new timesheet entry (check-in)
   */
  createTimesheet(companyId: string, timesheet: CreateTimesheetRequest): void {
    this.store.dispatch(createTimesheet({ companyId, timesheet }));
  }

  /**
   * Update a timesheet (e.g., check-out)
   */
  updateTimesheet(companyId: string, timesheetId: string, updateData: UpdateTimesheetRequest): void {
    this.store.dispatch(updateTimesheet({ companyId, timesheetId, updateData }));
  }

  /**
   * Update pagination
   */
  updatePage(page: number, size: number): void {
    this.store.dispatch(updatePage({ page, size }));
  }

  /**
   * Clear timesheets from state
   */
  clearTimesheets(): void {
    this.store.dispatch(clearTimesheets());
  }

  /**
   * Get a specific timesheet by ID from the list (returns Observable)
   */
  getTimesheetById(id: string): Observable<Timesheet | undefined> {
    return this.store.select(selectTimesheetById(id));
  }

  /**
   * Get all timesheets
   */
  getTimesheets(): Observable<Timesheet[]> {
    return this.timesheets$;
  }

  /**
   * Get the currently selected/loaded timesheet
   */
  getSelectedTimesheet(): Observable<Timesheet | null> {
    return this.selectedTimesheet$;
  }

  /**
   * Get active timesheets (checked in but not checked out)
   */
  getActiveTimesheets(): Observable<Timesheet[]> {
    return this.activeTimesheets$;
  }

  /**
   * Get completed timesheets (checked out)
   */
  getCompletedTimesheets(): Observable<Timesheet[]> {
    return this.completedTimesheets$;
  }

  /**
   * Get active timesheets for a specific worker (returns Observable)
   */
  activeTimesheetsForWorker$(workerUserId: string): Observable<Timesheet[]> {
    return this.store.select(selectActiveTimesheetsForWorker(workerUserId));
  }
}

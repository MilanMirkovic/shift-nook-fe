import { createAction, props } from '@ngrx/store';
import { Timesheet, CreateTimesheetRequest, UpdateTimesheetRequest } from './timesheets.models';

/**
 * Load timesheets for a company
 */
export const loadTimesheets = createAction(
  '[Timesheets] Load',
  props<{ companyId: string; page?: number; size?: number }>()
);

/**
 * Load timesheets for a specific worker
 */
export const loadWorkerTimesheets = createAction(
  '[Timesheets] Load Worker Timesheets',
  props<{ companyId: string; workerUserId: string; page?: number; size?: number; sort?: string[]; startDate?: string; endDate?: string }>()
);

/**
 * Load timesheets success
 */
export const loadTimesheetsSuccess = createAction(
  '[Timesheets] Load Success',
  props<{ timesheets: Timesheet[]; total: number }>()
);

/**
 * Load timesheets failure
 */
export const loadTimesheetsFailure = createAction(
  '[Timesheets] Load Failure',
  props<{ error: string }>()
);

/**
 * Load a single timesheet by ID
 */
export const loadTimesheetById = createAction(
  '[Timesheets] Load Timesheet By ID',
  props<{ companyId: string; timesheetId: string }>()
);

/**
 * Load timesheet by ID success
 */
export const loadTimesheetByIdSuccess = createAction(
  '[Timesheets] Load Timesheet By ID Success',
  props<{ timesheet: Timesheet }>()
);

/**
 * Load timesheet by ID failure
 */
export const loadTimesheetByIdFailure = createAction(
  '[Timesheets] Load Timesheet By ID Failure',
  props<{ error: string }>()
);

/**
 * Create a new timesheet entry (check-in)
 */
export const createTimesheet = createAction(
  '[Timesheets] Create',
  props<{ companyId: string; timesheet: CreateTimesheetRequest }>()
);

/**
 * Create timesheet success
 */
export const createTimesheetSuccess = createAction(
  '[Timesheets] Create Success',
  props<{ timesheet: Timesheet }>()
);

/**
 * Create timesheet failure
 */
export const createTimesheetFailure = createAction(
  '[Timesheets] Create Failure',
  props<{ error: string }>()
);

/**
 * Update pagination
 */
export const updatePage = createAction(
  '[Timesheets] Update Page',
  props<{ page: number; size: number }>()
);

/**
 * Clear timesheets (on logout or company change)
 */
export const clearTimesheets = createAction('[Timesheets] Clear');

/**
 * Update a timesheet (e.g., check-out)
 */
export const updateTimesheet = createAction(
  '[Timesheets] Update',
  props<{ companyId: string; timesheetId: string; updateData: UpdateTimesheetRequest }>()
);

/**
 * Update timesheet success
 */
export const updateTimesheetSuccess = createAction(
  '[Timesheets] Update Success',
  props<{ timesheet: Timesheet }>()
);

/**
 * Update timesheet failure
 */
export const updateTimesheetFailure = createAction(
  '[Timesheets] Update Failure',
  props<{ error: string }>()
);

/**
 * Load worker timesheets success
 */
export const loadWorkerTimesheetsSuccess = createAction(
  '[Timesheets] Load Worker Timesheets Success',
  props<{ timesheets: Timesheet[]; total: number; page: number; size: number }>()
);

/**
 * Load worker timesheets failure
 */
export const loadWorkerTimesheetsFailure = createAction(
  '[Timesheets] Load Worker Timesheets Failure',
  props<{ error: string }>()
);

import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TimesheetState } from './timesheets.models';

export const TIMESHEETS_FEATURE_KEY = 'timesheets';

export const selectTimesheetsState = createFeatureSelector<TimesheetState>(TIMESHEETS_FEATURE_KEY);

export const selectTimesheets = createSelector(
  selectTimesheetsState,
  state => state.timesheets
);

export const selectSelectedTimesheet = createSelector(
  selectTimesheetsState,
  state => state.selectedTimesheet
);

export const selectTimesheetsLoading = createSelector(
  selectTimesheetsState,
  state => state.loading
);

export const selectTimesheetLoadingById = createSelector(
  selectTimesheetsState,
  state => state.loadingById
);

export const selectTimesheetCreating = createSelector(
  selectTimesheetsState,
  state => state.creating
);

export const selectTimesheetUpdating = createSelector(
  selectTimesheetsState,
  state => state.updating
);

export const selectTimesheetsError = createSelector(
  selectTimesheetsState,
  state => state.error
);

export const selectTimesheetsTotal = createSelector(
  selectTimesheetsState,
  state => state.total
);

export const selectTimesheetsPage = createSelector(
  selectTimesheetsState,
  state => state.page
);

export const selectTimesheetsSize = createSelector(
  selectTimesheetsState,
  state => state.size
);

export const selectTimesheetById = (id: string) => createSelector(
  selectTimesheets,
  timesheets => timesheets.find(timesheet => timesheet.id === id)
);

/**
 * Get active timesheets (checked in but not checked out)
 */
export const selectActiveTimesheets = createSelector(
  selectTimesheets,
  timesheets => timesheets.filter(t => !t.checkOutTime && t.status !== 'CLOSED')
);

/**
 * Get completed timesheets (checked out)
 */
export const selectCompletedTimesheets = createSelector(
  selectTimesheets,
  timesheets => timesheets.filter(t => t.checkOutTime || t.status === 'CLOSED')
);

/**
 * Get active timesheets for a specific worker (checked in but not checked out)
 */
export const selectActiveTimesheetsForWorker = (userId: string) => createSelector(
  selectActiveTimesheets,
  timesheets => timesheets.filter(t => t.userId === userId || t.workerUserId === userId)
);

/**
 * Get unbilled timesheets (closed but not yet invoiced)
 */
export const selectUnbilledTimesheets = createSelector(
  selectTimesheets,
  timesheets => timesheets.filter(t =>
    t.status === 'CLOSED' && !t.invoiceId
  )
);

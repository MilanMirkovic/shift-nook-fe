import { createAction, props } from '@ngrx/store';
import { WorkSession, WorkSessionStatistics } from './company-work-sessions.models';

// ========== Active Session Actions ==========

/**
 * Load the current active session (called on app init)
 */
export const loadCurrentSession = createAction(
  '[Company Work Sessions] Load Current Session'
);

export const loadCurrentSessionSuccess = createAction(
  '[Company Work Sessions] Load Current Session Success',
  props<{ session: WorkSession | null }>()
);

export const loadCurrentSessionFailure = createAction(
  '[Company Work Sessions] Load Current Session Failure',
  props<{ error: string }>()
);

/**
 * Start a new work session for a company
 */
export const startWorkSession = createAction(
  '[Company Work Sessions] Start Work Session',
  props<{ companyId: string }>()
);

export const startWorkSessionSuccess = createAction(
  '[Company Work Sessions] Start Work Session Success',
  props<{ session: WorkSession }>()
);

export const startWorkSessionFailure = createAction(
  '[Company Work Sessions] Start Work Session Failure',
  props<{ error: string }>()
);

/**
 * Stop the current work session
 */
export const stopWorkSession = createAction(
  '[Company Work Sessions] Stop Work Session',
  props<{ description?: string }>()
);

export const stopWorkSessionSuccess = createAction(
  '[Company Work Sessions] Stop Work Session Success',
  props<{ session: WorkSession }>()
);

export const stopWorkSessionFailure = createAction(
  '[Company Work Sessions] Stop Work Session Failure',
  props<{ error: string }>()
);

/**
 * Update elapsed time (called by timer every minute)
 */
export const updateElapsedTime = createAction(
  '[Company Work Sessions] Update Elapsed Time',
  props<{ elapsedMinutes: number }>()
);

// ========== Statistics Actions ==========

/**
 * Load daily statistics
 */
export const loadDailyStatistics = createAction(
  '[Company Work Sessions] Load Daily Statistics',
  props<{ date: string; timezone?: string }>()
);

/**
 * Load weekly statistics
 */
export const loadWeeklyStatistics = createAction(
  '[Company Work Sessions] Load Weekly Statistics',
  props<{ weekStart: string; timezone?: string }>()
);

/**
 * Load monthly statistics
 */
export const loadMonthlyStatistics = createAction(
  '[Company Work Sessions] Load Monthly Statistics',
  props<{ year: number; month: number; timezone?: string }>()
);

/**
 * Load yearly statistics
 */
export const loadYearlyStatistics = createAction(
  '[Company Work Sessions] Load Yearly Statistics',
  props<{ year: number; timezone?: string }>()
);

/**
 * Statistics loaded successfully
 */
export const loadStatisticsSuccess = createAction(
  '[Company Work Sessions] Load Statistics Success',
  props<{ statistics: WorkSessionStatistics }>()
);

/**
 * Statistics load failed
 */
export const loadStatisticsFailure = createAction(
  '[Company Work Sessions] Load Statistics Failure',
  props<{ error: string }>()
);

/**
 * Clear statistics
 */
export const clearStatistics = createAction(
  '[Company Work Sessions] Clear Statistics'
);

import { createReducer, on } from '@ngrx/store';
import { WorkSessionsState } from './company-work-sessions.models';
import * as WorkSessionActions from './company-work-sessions.actions';

export const initialState: WorkSessionsState = {
  activeSession: null,
  activeSessionLoading: false,
  activeSessionError: null,

  statistics: null,
  statisticsLoading: false,
  statisticsError: null,

  elapsedMinutes: 0
};

export const companyWorkSessionsReducer = createReducer(
  initialState,

  // ========== Load Current Session ==========
  on(WorkSessionActions.loadCurrentSession, (state): WorkSessionsState => ({
    ...state,
    activeSessionLoading: true,
    activeSessionError: null
  })),

  on(WorkSessionActions.loadCurrentSessionSuccess, (state, { session }): WorkSessionsState => ({
    ...state,
    activeSession: session,
    activeSessionLoading: false,
    activeSessionError: null,
    elapsedMinutes: session ? calculateElapsedMinutes(session.startTime) : 0
  })),

  on(WorkSessionActions.loadCurrentSessionFailure, (state, { error }): WorkSessionsState => ({
    ...state,
    activeSessionLoading: false,
    activeSessionError: error
  })),

  // ========== Start Work Session ==========
  on(WorkSessionActions.startWorkSession, (state): WorkSessionsState => ({
    ...state,
    activeSessionLoading: true,
    activeSessionError: null
  })),

  on(WorkSessionActions.startWorkSessionSuccess, (state, { session }): WorkSessionsState => ({
    ...state,
    activeSession: session,
    activeSessionLoading: false,
    activeSessionError: null,
    elapsedMinutes: 0
  })),

  on(WorkSessionActions.startWorkSessionFailure, (state, { error }): WorkSessionsState => ({
    ...state,
    activeSessionLoading: false,
    activeSessionError: error
  })),

  // ========== Stop Work Session ==========
  on(WorkSessionActions.stopWorkSession, (state): WorkSessionsState => ({
    ...state,
    activeSessionLoading: true,
    activeSessionError: null
  })),

  on(WorkSessionActions.stopWorkSessionSuccess, (state): WorkSessionsState => ({
    ...state,
    activeSession: null,
    activeSessionLoading: false,
    activeSessionError: null,
    elapsedMinutes: 0
  })),

  on(WorkSessionActions.stopWorkSessionFailure, (state, { error }): WorkSessionsState => ({
    ...state,
    activeSessionLoading: false,
    activeSessionError: error
  })),

  // ========== Update Elapsed Time ==========
  on(WorkSessionActions.updateElapsedTime, (state, { elapsedMinutes }): WorkSessionsState => ({
    ...state,
    elapsedMinutes
  })),

  // ========== Statistics ==========
  on(
    WorkSessionActions.loadDailyStatistics,
    WorkSessionActions.loadWeeklyStatistics,
    WorkSessionActions.loadMonthlyStatistics,
    WorkSessionActions.loadYearlyStatistics,
    (state): WorkSessionsState => ({
      ...state,
      statisticsLoading: true,
      statisticsError: null
    })
  ),

  on(WorkSessionActions.loadStatisticsSuccess, (state, { statistics }): WorkSessionsState => ({
    ...state,
    statistics,
    statisticsLoading: false,
    statisticsError: null
  })),

  on(WorkSessionActions.loadStatisticsFailure, (state, { error }): WorkSessionsState => ({
    ...state,
    statisticsLoading: false,
    statisticsError: error
  })),

  on(WorkSessionActions.clearStatistics, (state): WorkSessionsState => ({
    ...state,
    statistics: null,
    statisticsLoading: false,
    statisticsError: null
  }))
);

/**
 * Calculate elapsed minutes from start time to now
 */
function calculateElapsedMinutes(startTime: string): number {
  const start = new Date(startTime).getTime();
  const now = new Date().getTime();
  return Math.floor((now - start) / 1000 / 60);
}


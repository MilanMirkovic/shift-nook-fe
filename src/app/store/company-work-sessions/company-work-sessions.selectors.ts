import { createFeatureSelector, createSelector } from '@ngrx/store';
import { WorkSessionsState } from './company-work-sessions.models';

export const selectCompanyWorkSessionsState = createFeatureSelector<WorkSessionsState>('companyWorkSessions');

// ========== Active Session Selectors ==========

export const selectActiveSession = createSelector(
  selectCompanyWorkSessionsState,
  (state) => state.activeSession
);

export const selectActiveSessionLoading = createSelector(
  selectCompanyWorkSessionsState,
  (state) => state.activeSessionLoading
);

export const selectActiveSessionError = createSelector(
  selectCompanyWorkSessionsState,
  (state) => state.activeSessionError
);

export const selectIsWorkingOnCompany = createSelector(
  selectActiveSession,
  (session) => session !== null && session.isActive
);

export const selectCurrentWorkingCompanyId = createSelector(
  selectActiveSession,
  (session) => session?.companyId ?? null
);

export const selectCurrentWorkingCompanyName = createSelector(
  selectActiveSession,
  (session) => session?.companyName ?? null
);

export const selectElapsedMinutes = createSelector(
  selectCompanyWorkSessionsState,
  (state) => state.elapsedMinutes
);

export const selectElapsedTimeFormatted = createSelector(
  selectElapsedMinutes,
  (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }
);

// ========== Statistics Selectors ==========

export const selectStatistics = createSelector(
  selectCompanyWorkSessionsState,
  (state) => state.statistics
);

export const selectStatisticsLoading = createSelector(
  selectCompanyWorkSessionsState,
  (state) => state.statisticsLoading
);

export const selectStatisticsError = createSelector(
  selectCompanyWorkSessionsState,
  (state) => state.statisticsError
);

export const selectTotalMinutesForPeriod = createSelector(
  selectStatistics,
  (statistics) => statistics?.totalMinutes ?? 0
);

export const selectTotalHoursForPeriod = createSelector(
  selectTotalMinutesForPeriod,
  (minutes) => (minutes / 60).toFixed(1)
);

export const selectCompaniesByWorkTime = createSelector(
  selectStatistics,
  (statistics) => statistics?.byCompany ?? []
);


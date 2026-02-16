import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { WorkSessionsState, WorkSession, WorkSessionStatistics } from './company-work-sessions.models';
import * as WorkSessionActions from './company-work-sessions.actions';
import * as WorkSessionSelectors from './company-work-sessions.selectors';

@Injectable({ providedIn: 'root' })
export class CompanyWorkSessionsStoreService {
  constructor(private readonly store: Store<WorkSessionsState>) {}

  // ========== Active Session ==========

  /**
   * Load the current active session (call on app init)
   */
  loadCurrentSession(): void {
    this.store.dispatch(WorkSessionActions.loadCurrentSession());
  }

  /**
   * Start tracking time for a company
   */
  startWorkSession(companyId: string): void {
    this.store.dispatch(WorkSessionActions.startWorkSession({ companyId }));
  }

  /**
   * Stop the current work session
   */
  stopWorkSession(description?: string): void {
    this.store.dispatch(WorkSessionActions.stopWorkSession({ description }));
  }

  /**
   * Update elapsed time (called by timer)
   */
  updateElapsedTime(elapsedMinutes: number): void {
    this.store.dispatch(WorkSessionActions.updateElapsedTime({ elapsedMinutes }));
  }

  // ========== Selectors ==========

  getActiveSession(): Observable<WorkSession | null> {
    return this.store.select(WorkSessionSelectors.selectActiveSession);
  }

  getActiveSessionLoading(): Observable<boolean> {
    return this.store.select(WorkSessionSelectors.selectActiveSessionLoading);
  }

  getActiveSessionError(): Observable<string | null> {
    return this.store.select(WorkSessionSelectors.selectActiveSessionError);
  }

  isWorkingOnCompany(): Observable<boolean> {
    return this.store.select(WorkSessionSelectors.selectIsWorkingOnCompany);
  }

  getCurrentWorkingCompanyId(): Observable<string | null> {
    return this.store.select(WorkSessionSelectors.selectCurrentWorkingCompanyId);
  }

  getCurrentWorkingCompanyName(): Observable<string | null> {
    return this.store.select(WorkSessionSelectors.selectCurrentWorkingCompanyName);
  }

  getElapsedMinutes(): Observable<number> {
    return this.store.select(WorkSessionSelectors.selectElapsedMinutes);
  }

  getElapsedTimeFormatted(): Observable<string> {
    return this.store.select(WorkSessionSelectors.selectElapsedTimeFormatted);
  }

  // ========== Statistics ==========

  loadDailyStatistics(date: string, timezone?: string): void {
    this.store.dispatch(WorkSessionActions.loadDailyStatistics({ date, timezone }));
  }

  loadWeeklyStatistics(weekStart: string, timezone?: string): void {
    this.store.dispatch(WorkSessionActions.loadWeeklyStatistics({ weekStart, timezone }));
  }

  loadMonthlyStatistics(year: number, month: number, timezone?: string): void {
    this.store.dispatch(WorkSessionActions.loadMonthlyStatistics({ year, month, timezone }));
  }

  loadYearlyStatistics(year: number, timezone?: string): void {
    this.store.dispatch(WorkSessionActions.loadYearlyStatistics({ year, timezone }));
  }

  clearStatistics(): void {
    this.store.dispatch(WorkSessionActions.clearStatistics());
  }

  getStatistics(): Observable<WorkSessionStatistics | null> {
    return this.store.select(WorkSessionSelectors.selectStatistics);
  }

  getStatisticsLoading(): Observable<boolean> {
    return this.store.select(WorkSessionSelectors.selectStatisticsLoading);
  }

  getStatisticsError(): Observable<string | null> {
    return this.store.select(WorkSessionSelectors.selectStatisticsError);
  }

  getTotalMinutesForPeriod(): Observable<number> {
    return this.store.select(WorkSessionSelectors.selectTotalMinutesForPeriod);
  }

  getTotalHoursForPeriod(): Observable<string> {
    return this.store.select(WorkSessionSelectors.selectTotalHoursForPeriod);
  }

  getCompaniesByWorkTime(): Observable<any[]> {
    return this.store.select(WorkSessionSelectors.selectCompaniesByWorkTime);
  }
}

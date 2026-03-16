import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WorkSession, StartWorkSessionRequest, StopWorkSessionRequest, WorkSessionStatistics } from './company-work-sessions.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CompanyWorkSessionsApiService {
  private readonly baseUrl = `${environment.apiBaseUrl}/company-work-sessions`;

  constructor(private readonly http: HttpClient) {}

  /**
   * Start a new work session for a company
   * Automatically stops any existing active session
   */
  startWorkSession(request: StartWorkSessionRequest): Observable<WorkSession> {
    return this.http.post<WorkSession>(`${this.baseUrl}/start`, request);
  }

  /**
   * Stop the currently active work session
   */
  stopWorkSession(request?: StopWorkSessionRequest): Observable<WorkSession> {
    return this.http.post<WorkSession>(`${this.baseUrl}/stop`, request || {});
  }

  /**
   * Get the currently active work session
   * Returns 204 No Content if no active session
   */
  getCurrentSession(): Observable<WorkSession | null> {
    return this.http.get<WorkSession | null>(`${this.baseUrl}/current`);
  }

  /**
   * Get daily statistics for a specific date
   */
  getDailyStatistics(date: string, timezone?: string): Observable<WorkSessionStatistics> {
    let params = new HttpParams().set('date', date);
    if (timezone) {
      params = params.set('timezone', timezone);
    }
    return this.http.get<WorkSessionStatistics>(`${this.baseUrl}/statistics/daily`, { params });
  }

  /**
   * Get weekly statistics starting from a specific date
   */
  getWeeklyStatistics(weekStart: string, timezone?: string): Observable<WorkSessionStatistics> {
    let params = new HttpParams().set('weekStart', weekStart);
    if (timezone) {
      params = params.set('timezone', timezone);
    }
    return this.http.get<WorkSessionStatistics>(`${this.baseUrl}/statistics/weekly`, { params });
  }

  /**
   * Get monthly statistics for a specific month
   */
  getMonthlyStatistics(year: number, month: number, timezone?: string): Observable<WorkSessionStatistics> {
    let params = new HttpParams()
      .set('year', year.toString())
      .set('month', month.toString());
    if (timezone) {
      params = params.set('timezone', timezone);
    }
    return this.http.get<WorkSessionStatistics>(`${this.baseUrl}/statistics/monthly`, { params });
  }

  /**
   * Get yearly statistics for a specific year
   */
  getYearlyStatistics(year: number, timezone?: string): Observable<WorkSessionStatistics> {
    let params = new HttpParams().set('year', year.toString());
    if (timezone) {
      params = params.set('timezone', timezone);
    }
    return this.http.get<WorkSessionStatistics>(`${this.baseUrl}/statistics/yearly`, { params });
  }
}

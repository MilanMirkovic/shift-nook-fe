import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Timesheet, CreateTimesheetRequest } from './timesheets.models';

@Injectable({ providedIn: 'root' })
export class TimesheetsApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/companies`;

  /**
   * Get timesheets for a specific company
   * API returns an array directly, not a paginated response
   */
  getTimesheets(companyId: string, page = 0, size = 20): Observable<{ items: Timesheet[]; total: number }> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Timesheet[]>(
      `${this.baseUrl}/${companyId}/timesheets`,
      { params }
    ).pipe(
      map(timesheets => ({
        items: timesheets,
        total: timesheets.length
      }))
    );
  }

  /**
   * Get timesheets for a specific worker with pagination
   * Backend expects ISO 8601 date-time strings for startDate and endDate (e.g., 2024-01-15T10:30:00Z)
   */
  getWorkerTimesheets(
    companyId: string,
    workerUserId: string,
    page = 0,
    size = 20,
    sort?: string[],
    startDate?: string, // ISO 8601 date-time string (e.g., "2024-01-15T00:00:00Z")
    endDate?: string    // ISO 8601 date-time string (e.g., "2024-01-15T23:59:59Z")
  ): Observable<{ items: Timesheet[]; total: number; page: number; size: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (sort && sort.length > 0) {
      sort.forEach(sortParam => {
        params = params.append('sort', sortParam);
      });
    }

    // Backend expects ISO 8601 date-time format for Instant parameters
    if (startDate) {
      params = params.set('startDate', startDate);
    }

    if (endDate) {
      params = params.set('endDate', endDate);
    }

    return this.http.get<{
      content: Timesheet[];
      totalElements: number;
      totalPages: number;
      size: number;
      number: number;
      numberOfElements: number;
      first: boolean;
      last: boolean;
      empty: boolean;
    }>(
      `${this.baseUrl}/${companyId}/timesheets/workers/${workerUserId}`,
      { params }
    ).pipe(
      map(response => ({
        items: response.content || [],
        total: response.totalElements || 0,
        page: response.number || 0,
        size: response.size || 20
      }))
    );
  }

  /**
   * Get a single timesheet by ID
   */
  getTimesheetById(companyId: string, timesheetId: string): Observable<Timesheet> {
    return this.http.get<Timesheet>(
      `${this.baseUrl}/${companyId}/timesheets/${timesheetId}`
    );
  }

  /**
   * Create a new timesheet entry (check-in)
   */
  createTimesheet(companyId: string, timesheet: CreateTimesheetRequest): Observable<Timesheet> {
    return this.http.post<Timesheet>(
      `${this.baseUrl}/${companyId}/timesheets`,
      timesheet
    );
  }

  /**
   * Update a timesheet (e.g., check-out)
   */
  updateTimesheet(companyId: string, timesheetId: string, timesheet: Partial<Timesheet>): Observable<Timesheet> {
    return this.http.put<Timesheet>(
      `${this.baseUrl}/${companyId}/timesheets/${timesheetId}`,
      timesheet
    );
  }

  /**
   * Delete a timesheet
   */
  deleteTimesheet(companyId: string, timesheetId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/${companyId}/timesheets/${timesheetId}`
    );
  }

  /**
   * Export worker timesheets as PDF for the authenticated user (self-export).
   * from / to must be ISO-8601 Instant strings, e.g. "2026-01-01T00:00:00Z"
   */
  exportTimesheetPdf(companyId: string, from: string, to: string): Observable<Blob> {
    const params = new HttpParams()
      .set('from', from)
      .set('to', to);

    return this.http.get(
      `${this.baseUrl}/${companyId}/timesheets/export/pdf`,
      { params, responseType: 'blob' }
    );
  }
}

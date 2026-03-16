import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { JobsitesPageResponse } from '../store/jobsites/jobsites.models';

export interface HealthResponse {
  status: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  health(): Observable<HealthResponse> {
    return this.http.get<HealthResponse>(`${this.baseUrl}/health`);
  }

  /**
   * Get jobsites for a specific client
   */
  getJobsitesByClient(companyId: string, clientId: string, page = 0, size = 20): Observable<JobsitesPageResponse> {
    return this.http.get<JobsitesPageResponse>(
      `${this.baseUrl}/companies/${companyId}/jobsites/by-client/${clientId}?page=${page}&size=${size}`
    );
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { JobsitesPageResponse, Jobsite, CreateJobsiteInput, UpdateJobsiteInput } from './jobsites.models';

@Injectable({ providedIn: 'root' })
export class JobsitesApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiBaseUrl;

  loadJobsites(
    companyId: string,
    page: number = 0,
    size: number = 20,
    sort?: string,
    search?: string
  ): Observable<JobsitesPageResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (sort) {
      params = params.set('sort', sort);
    }

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<JobsitesPageResponse>(
      `${this.apiUrl}/companies/${companyId}/jobsites`,
      { params }
    );
  }

  createJobsite(
    companyId: string,
    jobsite: CreateJobsiteInput
  ): Observable<Jobsite> {
    return this.http.post<Jobsite>(
      `${this.apiUrl}/companies/${companyId}/jobsites`,
      jobsite
    );
  }

  /**
   * Get a single jobsite by ID
   */
  getJobsiteById(companyId: string, jobsiteId: string): Observable<Jobsite> {
    return this.http.get<Jobsite>(
      `${this.apiUrl}/companies/${companyId}/jobsites/${jobsiteId}`
    );
  }

  /**
   * Soft delete a jobsite by ID
   */
  deleteJobsite(companyId: string, jobsiteId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/companies/${companyId}/jobsites/${jobsiteId}`
    );
  }

  /**
   * Update a jobsite by ID
   */
  updateJobsite(
    companyId: string,
    jobsiteId: string,
    jobsite: UpdateJobsiteInput
  ): Observable<Jobsite> {
    return this.http.put<Jobsite>(
      `${this.apiUrl}/companies/${companyId}/jobsites/${jobsiteId}`,
      jobsite
    );
  }
}

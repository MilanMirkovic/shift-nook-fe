import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ActivityTimelineResponse } from '../shared/models/activity.models';

@Injectable({
  providedIn: 'root'
})
export class ActivityTimelineService {
  constructor(private readonly http: HttpClient) {}

  getClientActivity(
    companyId: string,
    clientId: string,
    params?: {
      page?: number;
      size?: number;
      type?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Observable<ActivityTimelineResponse> {
    let httpParams = new HttpParams();

    if (params?.page !== undefined) httpParams = httpParams.set('page', params.page);
    if (params?.size !== undefined) httpParams = httpParams.set('size', params.size);
    if (params?.type) httpParams = httpParams.set('type', params.type);
    if (params?.startDate) httpParams = httpParams.set('startDate', params.startDate);
    if (params?.endDate) httpParams = httpParams.set('endDate', params.endDate);

    return this.http.get<ActivityTimelineResponse>(
      `/api/companies/${companyId}/clients/${clientId}/activity`,
      { params: httpParams }
    );
  }

  getMemberActivity(
    companyId: string,
    userId: string,
    params?: {
      page?: number;
      size?: number;
      type?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Observable<ActivityTimelineResponse> {
    let httpParams = new HttpParams();

    if (params?.page !== undefined) httpParams = httpParams.set('page', params.page);
    if (params?.size !== undefined) httpParams = httpParams.set('size', params.size);
    if (params?.type) httpParams = httpParams.set('type', params.type);
    if (params?.startDate) httpParams = httpParams.set('startDate', params.startDate);
    if (params?.endDate) httpParams = httpParams.set('endDate', params.endDate);

    return this.http.get<ActivityTimelineResponse>(
      `/api/companies/${companyId}/members/${userId}/activity`,
      { params: httpParams }
    );
  }

  getJobsiteActivity(
    companyId: string,
    jobsiteId: string,
    params?: {
      page?: number;
      size?: number;
      type?: string;
      entityType?: string; // Add entityType parameter
      startDate?: string;
      endDate?: string;
    }
  ): Observable<ActivityTimelineResponse> {
    let httpParams = new HttpParams();

    if (params?.page !== undefined) httpParams = httpParams.set('page', params.page);
    if (params?.size !== undefined) httpParams = httpParams.set('size', params.size);
    if (params?.type) httpParams = httpParams.set('type', params.type);
    if (params?.entityType) httpParams = httpParams.set('entityType', params.entityType);
    if (params?.startDate) httpParams = httpParams.set('startDate', params.startDate);
    if (params?.endDate) httpParams = httpParams.set('endDate', params.endDate);

    return this.http.get<ActivityTimelineResponse>(
      `/api/companies/${companyId}/jobsites/${jobsiteId}/activity`,
      { params: httpParams }
    );
  }
}

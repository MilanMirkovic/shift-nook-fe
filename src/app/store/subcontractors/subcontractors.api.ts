import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  SubcontractorLinkResponse,
  SubcontractorDetailResponse,
  SubcontractorInvitePreviewResponse,
  SubcontractorInviteRequest,
  SubcontractorWorkerStatus,
} from './subcontractors.models';

@Injectable({ providedIn: 'root' })
export class SubcontractorsApi {
  private readonly base = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  listSubcontractors(ownerCompanyId: string): Observable<SubcontractorLinkResponse[]> {
    return this.http.get<SubcontractorLinkResponse[]>(
      `${this.base}/companies/${ownerCompanyId}/subcontractors`
    );
  }

  getSubcontractorDetail(ownerCompanyId: string, linkId: string): Observable<SubcontractorDetailResponse> {
    return this.http.get<SubcontractorDetailResponse>(
      `${this.base}/companies/${ownerCompanyId}/subcontractors/${linkId}`
    );
  }

  inviteSubcontractor(ownerCompanyId: string, request: SubcontractorInviteRequest): Observable<{ linkId: string }> {
    return this.http.post<{ linkId: string }>(
      `${this.base}/companies/${ownerCompanyId}/subcontractors`,
      request
    );
  }

  revokeSubcontractor(ownerCompanyId: string, linkId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.base}/companies/${ownerCompanyId}/subcontractors/${linkId}`
    );
  }

  addWorker(ownerCompanyId: string, subcontractorCompanyId: string, workerUserId: string): Observable<void> {
    return this.http.post<void>(
      `${this.base}/companies/${ownerCompanyId}/subcontractor-company/${subcontractorCompanyId}/workers/${workerUserId}`,
      null
    );
  }

  removeWorker(ownerCompanyId: string, subcontractorCompanyId: string, workerUserId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.base}/companies/${ownerCompanyId}/subcontractor-company/${subcontractorCompanyId}/workers/${workerUserId}`
    );
  }

  listPrincipalCompanies(subcontractorCompanyId: string): Observable<SubcontractorLinkResponse[]> {
    return this.http.get<SubcontractorLinkResponse[]>(
      `${this.base}/companies/${subcontractorCompanyId}/principal-companies`
    );
  }

  /** Public — no auth required */
  previewInvite(token: string): Observable<SubcontractorInvitePreviewResponse> {
    return this.http.get<SubcontractorInvitePreviewResponse>(
      `${this.base}/subcontractor-invites/preview`,
      { params: { token } }
    );
  }

  acceptInvite(token: string): Observable<void> {
    return this.http.post<void>(
      `${this.base}/subcontractor-invites/accept`,
      null,
      { params: { token } }
    );
  }

  listMyWorkersWithAssignmentStatus(subcontractorCompanyId: string): Observable<SubcontractorWorkerStatus[]> {
    return this.http.get<SubcontractorWorkerStatus[]>(
      `${this.base}/companies/${subcontractorCompanyId}/subcontractor-workers`
    );
  }
}

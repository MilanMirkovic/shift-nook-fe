import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Invitation, InviteRequest, AcceptInviteResponse, InvitationPreview } from './invitations.models';

const PLACEHOLDER_COMPANY_ID = '00000000-0000-0000-0000-000000000000';

@Injectable({ providedIn: 'root' })
export class InvitationsApi {
  private readonly base = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  list(companyId: string): Observable<Invitation[]> {
    return this.http.get<Invitation[]>(`${this.base}/companies/${companyId}/invitations`);
  }

  send(companyId: string, request: InviteRequest): Observable<void> {
    return this.http.post<void>(`${this.base}/companies/${companyId}/invitations`, request);
  }

  revoke(companyId: string, inviteId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/companies/${companyId}/invitations/${inviteId}`);
  }

  /** Public endpoint — no Authorization header (interceptor skips /invitations/preview) */
  preview(token: string): Observable<InvitationPreview> {
    return this.http.get<InvitationPreview>(
      `${this.base}/companies/${PLACEHOLDER_COMPANY_ID}/invitations/preview`,
      { params: { token } }
    );
  }

  accept(companyId: string, token: string): Observable<AcceptInviteResponse> {
    return this.http.post<AcceptInviteResponse>(
      `${this.base}/companies/${companyId}/invitations/accept`,
      null,
      { params: { token } }
    );
  }
}


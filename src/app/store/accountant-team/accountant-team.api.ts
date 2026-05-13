import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AccountantTeamMember,
  AccountantDetail,
  AccountantTeamStats,
  PagedResponse,
  AssignCompaniesRequest,
} from './accountant-team.models';

@Injectable({ providedIn: 'root' })
export class AccountantTeamApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/companies`;

  listAccountants(
    companyId: string,
    params: { page: number; size: number; q?: string | null }
  ): Observable<PagedResponse<AccountantTeamMember>> {
    const cleanParams: any = { page: params.page, size: params.size };
    if (params.q) {
      cleanParams.q = params.q;
    }
    const url = `${this.baseUrl}/${companyId}/accountants`;
    console.log('🌐 [AccountantTeam API] GET request:', {
      url,
      params: cleanParams,
      companyId
    });
    return this.http.get<PagedResponse<AccountantTeamMember>>(url, { params: cleanParams });
  }

  getAccountantDetail(companyId: string, userId: string): Observable<AccountantDetail> {
    return this.http.get<AccountantDetail>(
      `${this.baseUrl}/${companyId}/accountants/${userId}`
    );
  }

  getStats(companyId: string): Observable<AccountantTeamStats> {
    return this.http.get<AccountantTeamStats>(
      `${this.baseUrl}/${companyId}/accountants/stats`
    );
  }

  assignCompanies(
    companyId: string,
    userId: string,
    request: AssignCompaniesRequest
  ): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/${companyId}/accountants/${userId}/companies`,
      request
    );
  }

  removeCompanyAssignment(
    companyId: string,
    userId: string,
    assignedCompanyId: string
  ): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/${companyId}/accountants/${userId}/companies/${assignedCompanyId}`
    );
  }
}

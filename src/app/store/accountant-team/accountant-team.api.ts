import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AccountantTeamMember,
  AccountantDetail,
  PagedResponse,
  AssignCompaniesRequest,
} from './accountant-team.models';

@Injectable({ providedIn: 'root' })
export class AccountantTeamApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/companies';

  listAccountants(
    companyId: string,
    params: { page: number; size: number; q?: string | null }
  ): Observable<PagedResponse<AccountantTeamMember>> {
    const cleanParams: any = { page: params.page, size: params.size };
    if (params.q) {
      cleanParams.q = params.q;
    }
    return this.http.get<PagedResponse<AccountantTeamMember>>(
      `${this.baseUrl}/${companyId}/accountants`,
      { params: cleanParams }
    );
  }

  getAccountantDetail(companyId: string, userId: string): Observable<AccountantDetail> {
    return this.http.get<AccountantDetail>(
      `${this.baseUrl}/${companyId}/accountants/${userId}`
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

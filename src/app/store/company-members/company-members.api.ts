import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { CompanyRole } from '../../shared/models/company-role';
import { CompanyMember, PagedResponse } from './company-members.models';

type SpringPage<T> = {
  content: T[];
  totalElements: number;
  number: number; // page index (0-based)
  size: number; // page size
};

@Injectable({ providedIn: 'root' })
export class CompanyMembersApi {

  constructor(private readonly http: HttpClient) {}

  listMembers(
    companyId: string,
    params: {
      page: number;
      size: number;
      role: CompanyRole | null;
      q: string | null;
    }
  ): Observable<PagedResponse<CompanyMember>> {

    let httpParams = new HttpParams()
      .set('page', params.page)
      .set('size', params.size);

    if (params.role) {
      httpParams = httpParams.set('role', params.role);
    }

    if (params.q) {
      httpParams = httpParams.set('q', params.q);
    }

    return this.http
      .get<SpringPage<CompanyMember>>(`/api/companies/${companyId}/members`, { params: httpParams })
      .pipe(
        map((res) => ({
          items: res.content ?? [],
          total: res.totalElements ?? 0,
          page: res.number ?? params.page,
          size: res.size ?? params.size
        }))
      );
  }

  /**
   * Get single member by ID
   */
  getMemberById(companyId: string, userId: string): Observable<CompanyMember> {
    return this.http.get<CompanyMember>(`/api/companies/${companyId}/members/${userId}`);
  }
}

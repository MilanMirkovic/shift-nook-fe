import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AdminCompany,
  AdminCompaniesPageResponse,
  CreateCompanyRequest,
  UpdateCompanyRequest,
} from './admin-companies.models';

@Injectable({ providedIn: 'root' })
export class AdminCompaniesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/admin/companies`;

  /**
   * List all companies (paginated, searchable)
   */
  listCompanies(page = 0, size = 50, q?: string): Observable<AdminCompaniesPageResponse> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (q && q.trim()) {
      params = params.set('q', q.trim());
    }

    return this.http.get<AdminCompaniesPageResponse>(this.baseUrl, { params });
  }

  /**
   * Get a single company
   */
  getCompany(companyId: string): Observable<AdminCompany> {
    return this.http.get<AdminCompany>(`${this.baseUrl}/${companyId}`);
  }

  /**
   * Create a new company
   */
  createCompany(request: CreateCompanyRequest): Observable<AdminCompany> {
    return this.http.post<AdminCompany>(this.baseUrl, request);
  }

  /**
   * Update a company
   */
  updateCompany(companyId: string, request: UpdateCompanyRequest): Observable<AdminCompany> {
    return this.http.put<AdminCompany>(`${this.baseUrl}/${companyId}`, request);
  }

  /**
   * Delete a company (soft-delete)
   */
  deleteCompany(companyId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${companyId}`);
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CompanyDetails {
  companyName: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
}

export type UpdateCompanyInput = {
  companyName?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  website?: string | null;
};

export interface CompanyLogoResponse {
  logoUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class CompanyApiService {
  private readonly http   = inject(HttpClient);
  private readonly apiUrl = environment.apiBaseUrl;

  getCompany(companyId: string): Observable<CompanyDetails> {
    return this.http.get<CompanyDetails>(
      `${this.apiUrl}/companies/${companyId}`
    );
  }

  updateCompany(companyId: string, details: UpdateCompanyInput): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/companies/${companyId}`,
      details
    );
  }

  getLogo(companyId: string): Observable<CompanyLogoResponse> {
    return this.http.get<CompanyLogoResponse>(
      `${this.apiUrl}/companies/${companyId}/logo`
    );
  }

  uploadLogo(companyId: string, file: File): Observable<CompanyLogoResponse> {
    const fd = new FormData();
    fd.append('file', file, file.name);
    return this.http.post<CompanyLogoResponse>(
      `${this.apiUrl}/companies/${companyId}/files/logo`,
      fd
    );
  }
}

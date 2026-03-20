import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  EstimatesPageResponse,
  Estimate,
  CreateEstimateInput,
  UpdateEstimateInput,
  UpdateEstimateStatusInput
} from './estimates.models';

@Injectable({ providedIn: 'root' })
export class EstimatesApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiBaseUrl;

  loadEstimates(
    companyId: string,
    page: number = 0,
    size: number = 20,
    sort?: string,
    clientId?: string
  ): Observable<EstimatesPageResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (sort) {
      params = params.set('sort', sort);
    }
    if (clientId) {
      params = params.set('clientId', clientId);
    }

    return this.http.get<EstimatesPageResponse>(
      `${this.apiUrl}/companies/${companyId}/estimates`,
      { params }
    );
  }

  getEstimateById(companyId: string, estimateId: string): Observable<Estimate> {
    return this.http.get<Estimate>(
      `${this.apiUrl}/companies/${companyId}/estimates/${estimateId}`
    );
  }

  createEstimate(companyId: string, estimate: CreateEstimateInput): Observable<Estimate> {
    return this.http.post<Estimate>(
      `${this.apiUrl}/companies/${companyId}/estimates`,
      estimate
    );
  }

  updateEstimate(
    companyId: string,
    estimateId: string,
    estimate: UpdateEstimateInput
  ): Observable<Estimate> {
    return this.http.put<Estimate>(
      `${this.apiUrl}/companies/${companyId}/estimates/${estimateId}`,
      estimate
    );
  }

  updateEstimateStatus(
    companyId: string,
    estimateId: string,
    statusUpdate: UpdateEstimateStatusInput
  ): Observable<Estimate> {
    return this.http.patch<Estimate>(
      `${this.apiUrl}/companies/${companyId}/estimates/${estimateId}/status`,
      statusUpdate
    );
  }

  deleteEstimate(companyId: string, estimateId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/companies/${companyId}/estimates/${estimateId}`
    );
  }

  getPdfUrl(companyId: string, estimateId: string): string {
    return `${this.apiUrl}/companies/${companyId}/estimates/${estimateId}/pdf/url`;
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  InvoicesPageResponse,
  Invoice,
  CreateInvoiceInput,
  UpdateInvoiceInput,
  UpdateInvoiceStatusInput,
  Payment,
  CreatePaymentInput,
} from './invoices.models';
import {
  CreateInvoiceFromTimesheetsInput,
  CreateInvoiceFromTimesheetsResponse,
} from '../../shared/models/invoice-from-timesheets.model';

@Injectable({ providedIn: 'root' })
export class InvoicesApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiBaseUrl;

  loadInvoices(
    companyId: string,
    page: number = 0,
    size: number = 20,
    sort?: string,
    clientId?: string,
    jobsiteId?: string
  ): Observable<InvoicesPageResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (sort) params = params.set('sort', sort);
    if (clientId) params = params.set('clientId', clientId);
    if (jobsiteId) params = params.set('jobsiteId', jobsiteId);

    return this.http.get<InvoicesPageResponse>(
      `${this.apiUrl}/companies/${companyId}/invoices`,
      { params }
    );
  }

  getInvoiceById(companyId: string, invoiceId: string): Observable<Invoice> {
    return this.http.get<Invoice>(
      `${this.apiUrl}/companies/${companyId}/invoices/${invoiceId}`
    );
  }

  createInvoice(companyId: string, invoice: CreateInvoiceInput): Observable<Invoice> {
    return this.http.post<Invoice>(
      `${this.apiUrl}/companies/${companyId}/invoices`,
      invoice
    );
  }

  promoteEstimateToInvoice(companyId: string, estimateId: string): Observable<Invoice> {
    return this.http.post<Invoice>(
      `${this.apiUrl}/companies/${companyId}/invoices/from-estimate/${estimateId}`,
      null
    );
  }

  createInvoiceFromTimesheets(
    companyId: string,
    request: CreateInvoiceFromTimesheetsInput
  ): Observable<CreateInvoiceFromTimesheetsResponse> {
    return this.http.post<CreateInvoiceFromTimesheetsResponse>(
      `${this.apiUrl}/companies/${companyId}/invoices/from-timesheets`,
      request
    );
  }

  updateInvoice(companyId: string, invoiceId: string, invoice: UpdateInvoiceInput): Observable<Invoice> {
    return this.http.put<Invoice>(
      `${this.apiUrl}/companies/${companyId}/invoices/${invoiceId}`,
      invoice
    );
  }

  updateInvoiceStatus(companyId: string, invoiceId: string, statusUpdate: UpdateInvoiceStatusInput): Observable<Invoice> {
    return this.http.patch<Invoice>(
      `${this.apiUrl}/companies/${companyId}/invoices/${invoiceId}/status`,
      statusUpdate
    );
  }

  deleteInvoice(companyId: string, invoiceId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/companies/${companyId}/invoices/${invoiceId}`
    );
  }

  downloadPdf(companyId: string, invoiceId: string): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/companies/${companyId}/invoices/${invoiceId}/pdf`,
      { responseType: 'blob' }
    );
  }

  getPdfUrl(companyId: string, invoiceId: string): Observable<{ url: string }> {
    return this.http.get<{ url: string }>(
      `${this.apiUrl}/companies/${companyId}/invoices/${invoiceId}/pdf/url`
    );
  }

  // Payment methods
  createPayment(companyId: string, invoiceId: string, payment: CreatePaymentInput): Observable<Payment> {
    return this.http.post<Payment>(
      `${this.apiUrl}/companies/${companyId}/invoices/${invoiceId}/payments`,
      payment
    );
  }

  listPayments(companyId: string, invoiceId: string): Observable<Payment[]> {
    return this.http.get<Payment[]>(
      `${this.apiUrl}/companies/${companyId}/invoices/${invoiceId}/payments`
    );
  }

  deletePayment(companyId: string, paymentId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/companies/${companyId}/invoices/payments/${paymentId}`
    );
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  QuickBooksCustomer,
  QuickBooksCustomerMapping,
  CreateMappingRequest
} from './qb-customer-mappings.models';

@Injectable({ providedIn: 'root' })
export class QBCustomerMappingsApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiBaseUrl;

  /**
   * List all active QuickBooks customers for a company.
   * Used to populate the dropdown when creating mappings.
   */
  listQuickBooksCustomers(companyId: string): Observable<QuickBooksCustomer[]> {
    return this.http.get<QuickBooksCustomer[]>(
      `${this.apiUrl}/companies/${companyId}/quickbooks/customer-mappings/quickbooks-customers`
    );
  }

  /**
   * List all customer mappings for a company.
   */
  listMappings(companyId: string): Observable<QuickBooksCustomerMapping[]> {
    return this.http.get<QuickBooksCustomerMapping[]>(
      `${this.apiUrl}/companies/${companyId}/quickbooks/customer-mappings`
    );
  }

  /**
   * Get mapping for a specific client.
   */
  getMappingForClient(
    companyId: string,
    clientId: string
  ): Observable<QuickBooksCustomerMapping> {
    return this.http.get<QuickBooksCustomerMapping>(
      `${this.apiUrl}/companies/${companyId}/quickbooks/customer-mappings/client/${clientId}`
    );
  }

  /**
   * Create a new customer mapping.
   */
  createMapping(
    companyId: string,
    request: CreateMappingRequest
  ): Observable<QuickBooksCustomerMapping> {
    return this.http.post<QuickBooksCustomerMapping>(
      `${this.apiUrl}/companies/${companyId}/quickbooks/customer-mappings`,
      request
    );
  }

  /**
   * Delete a customer mapping.
   */
  deleteMapping(companyId: string, mappingId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/companies/${companyId}/quickbooks/customer-mappings/${mappingId}`
    );
  }
}

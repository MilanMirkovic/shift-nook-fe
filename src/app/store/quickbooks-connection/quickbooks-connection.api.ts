import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { QuickBooksConnection } from './quickbooks-connection.models';

interface AuthorizationUrlResponse {
  url: string;
}

@Injectable({
  providedIn: 'root',
})
export class QuickBooksConnectionApi {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiBaseUrl;

  getConnectionStatus(companyId: string): Observable<QuickBooksConnection> {
    return this.http.get<QuickBooksConnection>(
      `${this.apiUrl}/companies/${companyId}/quickbooks/auth/status`
    );
  }

  getAuthorizationUrl(companyId: string): Observable<AuthorizationUrlResponse> {
    return this.http.get<AuthorizationUrlResponse>(
      `${this.apiUrl}/companies/${companyId}/quickbooks/auth/url`
    );
  }

  disconnect(companyId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/companies/${companyId}/quickbooks/auth`
    );
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Client,
  ClientsApiPage,
  PagedResponse
} from './clients.models';

@Injectable({ providedIn: 'root' })
export class ClientsApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiBaseUrl;

  loadClients(
    companyId: string,
    page: number,
    size: number
  ): Observable<PagedResponse<Client>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);

    return this.http
      .get<ClientsApiPage>(
        `${this.apiUrl}/companies/${companyId}/clients`,
        { params }
      )
      .pipe(
        map((res) => ({
          items: res.content,
          total: res.totalElements,
          page: res.number,
          size: res.size
        }))
      );
  }

  createClient(
    companyId: string,
    client: Client
  ) {
    return this.http.post<Client>(
      `${this.apiUrl}/companies/${companyId}/clients`,
      client
    );
  }

  getClientById(companyId: string, clientId: string) {
    return this.http.get<Client>(
      `${this.apiUrl}/companies/${companyId}/clients/${clientId}`
    );
  }

  updateClient(companyId: string, clientId: string, client: Partial<Client>) {
    return this.http.put<Client>(
      `${this.apiUrl}/companies/${companyId}/clients/${clientId}`,
      client
    );
  }
}

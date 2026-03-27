import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AdminUser,
  AdminUsersPageResponse,
  CreateUserRequest,
  UpdateRoleRequest,
  AssignCompanyRequest
} from './admin-users.models';
import { UserRole } from '../../shared/models/user-role';

@Injectable({ providedIn: 'root' })
export class AdminUsersApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/admin/users`;

  /**
   * List all users (paginated, filterable)
   */
  listUsers(page = 0, size = 50, role?: UserRole, q?: string): Observable<AdminUsersPageResponse> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (role) {
      params = params.set('role', role);
    }
    if (q && q.trim()) {
      params = params.set('q', q.trim());
    }

    return this.http.get<AdminUsersPageResponse>(this.baseUrl, { params });
  }

  /**
   * Get a single user with company assignments
   */
  getUser(userId: string): Observable<AdminUser> {
    return this.http.get<AdminUser>(`${this.baseUrl}/${userId}`);
  }

  /**
   * Create a new user
   */
  createUser(request: CreateUserRequest): Observable<AdminUser> {
    return this.http.post<AdminUser>(this.baseUrl, request);
  }

  /**
   * Update a user's platform role
   */
  updateRole(userId: string, request: UpdateRoleRequest): Observable<AdminUser> {
    return this.http.patch<AdminUser>(`${this.baseUrl}/${userId}/role`, request);
  }

  /**
   * Assign user to a company (or update existing membership)
   */
  assignCompany(userId: string, request: AssignCompanyRequest): Observable<AdminUser> {
    return this.http.post<AdminUser>(`${this.baseUrl}/${userId}/companies`, request);
  }

  /**
   * Remove user from a company
   */
  removeFromCompany(userId: string, companyId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${userId}/companies/${companyId}`);
  }
}


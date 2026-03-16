import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from './user.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserApi {
  constructor(private readonly http: HttpClient) {}

  /**
   * Fetch current authenticated user profile
   */
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${environment.apiBaseUrl}/me`);
  }
}

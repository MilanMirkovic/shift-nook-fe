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

  /**
   * Update the user profile
   * @param firstName - The new first name of the user
   * @param lastName - The new last name of the user
   */
  updateProfile(firstName: string, lastName: string): Observable<User> {
    return this.http.put<User>(`${environment.apiBaseUrl}/me`, { firstName, lastName });
  }
}

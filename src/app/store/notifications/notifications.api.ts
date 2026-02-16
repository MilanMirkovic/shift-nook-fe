import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NotificationsPageResponse, UnreadCountResponse } from './notifications.models';

@Injectable({ providedIn: 'root' })
export class NotificationsApi {
  private readonly baseUrl = '/api/notifications';

  constructor(private readonly http: HttpClient) {}

  /**
   * Get paginated notifications, optionally filtered by company
   */
  getNotifications(page = 0, size = 20, unreadOnly = false, companyId?: string): Observable<NotificationsPageResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('unreadOnly', unreadOnly.toString());

    if (companyId) {
      params = params.set('companyId', companyId);
    }

    return this.http.get<NotificationsPageResponse>(this.baseUrl, { params });
  }

  /**
   * Get unread notifications count, optionally filtered by company
   */
  getUnreadCount(companyId?: string): Observable<UnreadCountResponse> {
    let params = new HttpParams();
    if (companyId) {
      params = params.set('companyId', companyId);
    }
    return this.http.get<UnreadCountResponse>(`${this.baseUrl}/unread-count`, { params });
  }

  /**
   * Mark a single notification as read
   */
  markAsRead(notificationId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${notificationId}/read`, {});
  }

  /**
   * Mark all notifications as read, optionally filtered by company
   */
  markAllAsRead(companyId?: string): Observable<void> {
    let params = new HttpParams();
    if (companyId) {
      params = params.set('companyId', companyId);
    }
    return this.http.post<void>(`${this.baseUrl}/read-all`, {}, { params });
  }
}

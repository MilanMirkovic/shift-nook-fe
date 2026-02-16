import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import {
  loadNotifications,
  loadNotificationsSuccess,
  loadNotificationsFailure,
  loadUnreadCount,
  loadUnreadCountSuccess,
  loadUnreadCountFailure,
  markAsRead,
  markAsReadSuccess,
  markAsReadFailure,
  markAllAsRead,
  markAllAsReadSuccess,
  markAllAsReadFailure,
  refreshNotifications
} from './notifications.actions';
import { NotificationsApi } from './notifications.api';

@Injectable()
export class NotificationsEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(NotificationsApi);

  /**
   * Load notifications
   */
  loadNotifications$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadNotifications),
      switchMap(({ page, unreadOnly, companyId }) =>
        this.api.getNotifications(page ?? 0, 20, unreadOnly ?? false, companyId).pipe(
          map((response) =>
            loadNotificationsSuccess({
              notifications: response.content,
              totalElements: response.totalElements,
              totalPages: response.totalPages,
              page: response.number,
              size: response.size,
              append: (page ?? 0) > 0
            })
          ),
          catchError((err) =>
            of(loadNotificationsFailure({ error: this.toErrorMessage(err) }))
          )
        )
      )
    )
  );

  /**
   * Load unread count
   */
  loadUnreadCount$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadUnreadCount),
      switchMap(({ companyId }) =>
        this.api.getUnreadCount(companyId).pipe(
          map((response) => loadUnreadCountSuccess({ count: response.count })),
          catchError((err) =>
            of(loadUnreadCountFailure({ error: this.toErrorMessage(err) }))
          )
        )
      )
    )
  );

  /**
   * Mark notification as read
   */
  markAsRead$ = createEffect(() =>
    this.actions$.pipe(
      ofType(markAsRead),
      switchMap(({ notificationId }) =>
        this.api.markAsRead(notificationId).pipe(
          map(() => markAsReadSuccess({ notificationId })),
          catchError((err) =>
            of(markAsReadFailure({ error: this.toErrorMessage(err) }))
          )
        )
      )
    )
  );

  /**
   * Mark all notifications as read
   */
  markAllAsRead$ = createEffect(() =>
    this.actions$.pipe(
      ofType(markAllAsRead),
      switchMap(({ companyId }) =>
        this.api.markAllAsRead(companyId).pipe(
          map(() => markAllAsReadSuccess()),
          catchError((err) =>
            of(markAllAsReadFailure({ error: this.toErrorMessage(err) }))
          )
        )
      )
    )
  );

  /**
   * Refresh notifications - reload first page
   */
  refreshNotifications$ = createEffect(() =>
    this.actions$.pipe(
      ofType(refreshNotifications),
      map(({ companyId }) => loadNotifications({ page: 0, unreadOnly: false, companyId }))
    )
  );

  private toErrorMessage(err: unknown): string {
    if (typeof err === 'string') return err;

    const anyErr = err as any;
    const backendMessage = anyErr?.error?.message || anyErr?.error?.error || anyErr?.message;
    if (backendMessage && typeof backendMessage === 'string') return backendMessage;

    const status = anyErr?.status;
    const statusText = anyErr?.statusText;
    if (status) return `Request failed (${status}${statusText ? ` ${statusText}` : ''})`;

    return 'Request failed';
  }
}

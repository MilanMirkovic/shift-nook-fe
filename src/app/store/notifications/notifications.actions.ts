import { createAction, props } from '@ngrx/store';
import { Notification } from './notifications.models';

// Load notifications (paginated)
export const loadNotifications = createAction(
  '[Notifications] Load',
  props<{ page?: number; unreadOnly?: boolean; companyId?: string }>()
);

export const loadNotificationsSuccess = createAction(
  '[Notifications] Load Success',
  props<{
    notifications: Notification[];
    totalElements: number;
    totalPages: number;
    page: number;
    size: number;
    append: boolean;
  }>()
);

export const loadNotificationsFailure = createAction(
  '[Notifications] Load Failure',
  props<{ error: string }>()
);

// Load unread count
export const loadUnreadCount = createAction(
  '[Notifications] Load Unread Count',
  props<{ companyId?: string }>()
);

export const loadUnreadCountSuccess = createAction(
  '[Notifications] Load Unread Count Success',
  props<{ count: number }>()
);

export const loadUnreadCountFailure = createAction(
  '[Notifications] Load Unread Count Failure',
  props<{ error: string }>()
);

// Mark single notification as read
export const markAsRead = createAction(
  '[Notifications] Mark As Read',
  props<{ notificationId: string }>()
);

export const markAsReadSuccess = createAction(
  '[Notifications] Mark As Read Success',
  props<{ notificationId: string }>()
);

export const markAsReadFailure = createAction(
  '[Notifications] Mark As Read Failure',
  props<{ error: string }>()
);

// Mark all notifications as read
export const markAllAsRead = createAction(
  '[Notifications] Mark All As Read',
  props<{ companyId?: string }>()
);

export const markAllAsReadSuccess = createAction('[Notifications] Mark All As Read Success');

export const markAllAsReadFailure = createAction(
  '[Notifications] Mark All As Read Failure',
  props<{ error: string }>()
);

// Clear notifications (e.g., on logout)
export const clearNotifications = createAction('[Notifications] Clear');

// Refresh notifications (reload first page)
export const refreshNotifications = createAction(
  '[Notifications] Refresh',
  props<{ companyId?: string }>()
);

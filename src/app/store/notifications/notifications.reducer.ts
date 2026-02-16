import { createReducer, on } from '@ngrx/store';
import { NotificationsState } from './notifications.models';
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
  clearNotifications,
  refreshNotifications
} from './notifications.actions';

export const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  totalElements: 0,
  totalPages: 0,
  currentPage: 0,
  pageSize: 20,
  hasMore: false
};

export const notificationsReducer = createReducer(
  initialState,

  // Load notifications
  on(loadNotifications, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(loadNotificationsSuccess, (state, { notifications, totalElements, totalPages, page, size, append }) => ({
    ...state,
    notifications: append ? [...state.notifications, ...notifications] : notifications,
    totalElements,
    totalPages,
    currentPage: page,
    pageSize: size,
    hasMore: page < totalPages - 1,
    loading: false,
    error: null
  })),

  on(loadNotificationsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Load unread count
  on(loadUnreadCount, (state) => state),

  on(loadUnreadCountSuccess, (state, { count }) => ({
    ...state,
    unreadCount: count
  })),

  on(loadUnreadCountFailure, (state) => state),

  // Mark as read
  on(markAsRead, (state) => state),

  on(markAsReadSuccess, (state, { notificationId }) => ({
    ...state,
    notifications: state.notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    ),
    unreadCount: Math.max(0, state.unreadCount - 1)
  })),

  on(markAsReadFailure, (state, { error }) => ({
    ...state,
    error
  })),

  // Mark all as read
  on(markAllAsRead, (state) => state),

  on(markAllAsReadSuccess, (state) => ({
    ...state,
    notifications: state.notifications.map(n => ({ ...n, read: true })),
    unreadCount: 0
  })),

  on(markAllAsReadFailure, (state, { error }) => ({
    ...state,
    error
  })),

  // Clear notifications
  on(clearNotifications, () => initialState),

  // Refresh notifications
  on(refreshNotifications, (state) => ({
    ...state,
    loading: true,
    error: null
  }))
);


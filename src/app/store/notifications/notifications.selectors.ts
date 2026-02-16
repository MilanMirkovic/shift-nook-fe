import { createFeatureSelector, createSelector } from '@ngrx/store';
import { NotificationsState } from './notifications.models';

export const NOTIFICATIONS_FEATURE_KEY = 'notifications';

export const selectNotificationsState = createFeatureSelector<NotificationsState>(NOTIFICATIONS_FEATURE_KEY);

export const selectNotifications = createSelector(
  selectNotificationsState,
  state => state.notifications
);

export const selectUnreadCount = createSelector(
  selectNotificationsState,
  state => state.unreadCount
);

export const selectNotificationsLoading = createSelector(
  selectNotificationsState,
  state => state.loading
);

export const selectNotificationsError = createSelector(
  selectNotificationsState,
  state => state.error
);

export const selectHasMoreNotifications = createSelector(
  selectNotificationsState,
  state => state.hasMore
);

export const selectCurrentPage = createSelector(
  selectNotificationsState,
  state => state.currentPage
);

export const selectTotalElements = createSelector(
  selectNotificationsState,
  state => state.totalElements
);

export const selectUnreadNotifications = createSelector(
  selectNotifications,
  notifications => notifications.filter(n => !n.read)
);

export const selectHasUnreadNotifications = createSelector(
  selectUnreadCount,
  count => count > 0
);


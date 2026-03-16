import { Injectable, inject, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, take, distinctUntilChanged } from 'rxjs';

import {
  selectNotifications,
  selectUnreadCount,
  selectNotificationsLoading,
  selectNotificationsError,
  selectHasMoreNotifications,
  selectCurrentPage,
  selectHasUnreadNotifications
} from './notifications.selectors';
import {
  loadNotifications,
  loadUnreadCount,
  markAsRead,
  markAllAsRead,
  clearNotifications,
  refreshNotifications
} from './notifications.actions';
import { selectSelectedCompanyId } from '../user/user.selectors';

@Injectable({ providedIn: 'root' })
export class NotificationsStoreService implements OnDestroy {
  private readonly store = inject(Store);
  private readonly destroy$ = new Subject<void>();
  /** Separate subject so polling can be stopped/restarted without completing destroy$ */
  private readonly pollingStop$ = new Subject<void>();
  private pollingStarted = false;

  // Observables
  readonly notifications$ = this.store.select(selectNotifications);
  readonly unreadCount$ = this.store.select(selectUnreadCount);
  readonly loading$ = this.store.select(selectNotificationsLoading);
  readonly error$ = this.store.select(selectNotificationsError);
  readonly hasMore$ = this.store.select(selectHasMoreNotifications);
  readonly currentPage$ = this.store.select(selectCurrentPage);
  readonly hasUnreadNotifications$ = this.store.select(selectHasUnreadNotifications);

  ngOnDestroy(): void {
    this.stopPolling();
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load notifications (first page)
   */
  loadNotifications(unreadOnly = false, companyId?: string): void {
    if (companyId) {
      this.store.dispatch(loadNotifications({ page: 0, unreadOnly, companyId }));
    } else {
      this.store.select(selectSelectedCompanyId).pipe(take(1)).subscribe(selectedCompanyId => {
        this.store.dispatch(loadNotifications({ page: 0, unreadOnly, companyId: selectedCompanyId ?? undefined }));
      });
    }
  }

  /**
   * Load more notifications (next page)
   */
  loadMoreNotifications(currentPage: number, unreadOnly = false, companyId?: string): void {
    if (companyId) {
      this.store.dispatch(loadNotifications({ page: currentPage + 1, unreadOnly, companyId }));
    } else {
      this.store.select(selectSelectedCompanyId).pipe(take(1)).subscribe(selectedCompanyId => {
        this.store.dispatch(loadNotifications({ page: currentPage + 1, unreadOnly, companyId: selectedCompanyId ?? undefined }));
      });
    }
  }

  /**
   * Load unread count
   */
  loadUnreadCount(companyId?: string): void {
    if (companyId) {
      this.store.dispatch(loadUnreadCount({ companyId }));
    } else {
      this.store.select(selectSelectedCompanyId).pipe(take(1)).subscribe(selectedCompanyId => {
        this.store.dispatch(loadUnreadCount({ companyId: selectedCompanyId ?? undefined }));
      });
    }
  }

  /**
   * Mark a notification as read
   */
  markAsRead(notificationId: string): void {
    this.store.dispatch(markAsRead({ notificationId }));
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(companyId?: string): void {
    if (companyId) {
      this.store.dispatch(markAllAsRead({ companyId }));
    } else {
      this.store.select(selectSelectedCompanyId).pipe(take(1)).subscribe(selectedCompanyId => {
        this.store.dispatch(markAllAsRead({ companyId: selectedCompanyId ?? undefined }));
      });
    }
  }

  /**
   * Refresh notifications (reload first page)
   */
  refreshNotifications(companyId?: string): void {
    if (companyId) {
      this.store.dispatch(refreshNotifications({ companyId }));
    } else {
      this.store.select(selectSelectedCompanyId).pipe(take(1)).subscribe(selectedCompanyId => {
        this.store.dispatch(refreshNotifications({ companyId: selectedCompanyId ?? undefined }));
      });
    }
  }

  /**
   * Clear all notifications from store
   */
  clearNotifications(): void {
    this.store.dispatch(clearNotifications());
  }

  /**
   * Start polling for unread count every 30 seconds.
   * Automatically restarts when the selected company changes.
   *
   * NOTE: polling is currently disabled — uncomment the interval() block to re-enable.
   */
  startPolling(): void {
    if (this.pollingStarted) return;
    this.pollingStarted = true;

    // React to company changes: stop the current poll cycle and start a new one
    this.store.select(selectSelectedCompanyId)
      .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(companyId => {
        // Cancel any in-flight poll cycle for the previous company
        this.pollingStop$.next();

        // Initial load for the (new) company
        this.store.dispatch(loadUnreadCount({ companyId: companyId ?? undefined }));

        // Poll every 30 seconds
        // TODO: uncomment when polling should be re-enabled
        // interval(30000)
        //   .pipe(takeUntil(this.pollingStop$), takeUntil(this.destroy$))
        //   .subscribe(() => {
        //     this.store.dispatch(loadUnreadCount({ companyId: companyId ?? undefined }));
        //   });
      });
  }

  /**
   * Stop polling (can be safely called and restarted afterwards)
   */
  stopPolling(): void {
    this.pollingStop$.next();
    this.pollingStarted = false;
  }
}

import { Component, inject, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil, take, switchMap, of, catchError } from 'rxjs';
import { Store } from '@ngrx/store';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { NotificationsStoreService } from '../../../store/notifications/notifications-store.service';
import { Notification, NotificationType, RelatedEntityType } from '../../../store/notifications/notifications.models';
import { selectJobsiteTaskById } from '../../../store/jobsite-tasks/jobsite-tasks.selectors';
import { selectSelectedCompanyId } from '../../../store/user/user.selectors';
import { JobsiteTasksApi } from '../../../store/jobsite-tasks/jobsite-tasks.api';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatMenuModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.scss']
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;

  private readonly notificationsStore = inject(NotificationsStoreService);
  private readonly router = inject(Router);
  private readonly store = inject(Store);
  private readonly tasksApi = inject(JobsiteTasksApi);
  private readonly destroy$ = new Subject<void>();

  protected notifications: Notification[] = [];
  protected unreadCount = 0;
  protected loading = false;
  protected hasMore = false;
  protected currentPage = 0;
  protected isMenuOpen = false;
  private selectedCompanyId: string | null = null;

  ngOnInit(): void {
    // Subscribe to selected company
    this.store.select(selectSelectedCompanyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(companyId => {
        this.selectedCompanyId = companyId;
      });

    // Subscribe to notifications
    this.notificationsStore.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        this.notifications = notifications;
      });

    // Subscribe to unread count
    this.notificationsStore.unreadCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.unreadCount = count;
      });

    // Subscribe to loading state
    this.notificationsStore.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.loading = loading;
      });

    // Subscribe to hasMore
    this.notificationsStore.hasMore$
      .pipe(takeUntil(this.destroy$))
      .subscribe(hasMore => {
        this.hasMore = hasMore;
      });

    // Subscribe to current page
    this.notificationsStore.currentPage$
      .pipe(takeUntil(this.destroy$))
      .subscribe(page => {
        this.currentPage = page;
      });

    // Start polling for unread count
    this.notificationsStore.startPolling();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected onMenuOpened(): void {
    this.isMenuOpen = true;
    // Load notifications when menu opens
    this.notificationsStore.loadNotifications(false, this.selectedCompanyId ?? undefined);
  }

  protected onMenuClosed(): void {
    this.isMenuOpen = false;
  }

  protected onNotificationClick(notification: Notification, event: Event): void {
    event.stopPropagation();

    // Mark as read if not already
    if (!notification.read) {
      this.notificationsStore.markAsRead(notification.id);
    }

    // Navigate based on notification type
    this.navigateToRelatedEntity(notification);

    // Close the menu
    this.menuTrigger.closeMenu();
  }

  protected onMarkAllAsRead(event: Event): void {
    event.stopPropagation();
    this.notificationsStore.markAllAsRead(this.selectedCompanyId ?? undefined);
  }

  protected onLoadMore(event: Event): void {
    event.stopPropagation();
    this.notificationsStore.loadMoreNotifications(this.currentPage, false, this.selectedCompanyId ?? undefined);
  }

  protected onViewAll(event: Event): void {
    event.stopPropagation();
    this.menuTrigger.closeMenu();
    this.router.navigate(['/notifications']);
  }

  protected getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} min ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  }

  protected getNotificationIcon(type: NotificationType): string {
    switch (type) {
      case NotificationType.TASK_APPROVED:
        return 'check_circle';
      case NotificationType.TASK_NEEDS_WORK:
        return 'error_outline';
      case NotificationType.TASK_SUBMITTED_FOR_REVIEW:
        return 'rate_review';
      case NotificationType.GENERAL:
      default:
        return 'notifications';
    }
  }

  protected getIconClass(type: NotificationType): string {
    switch (type) {
      case NotificationType.TASK_APPROVED:
        return 'icon-success';
      case NotificationType.TASK_NEEDS_WORK:
        return 'icon-warning';
      case NotificationType.TASK_SUBMITTED_FOR_REVIEW:
        return 'icon-info';
      case NotificationType.GENERAL:
      default:
        return 'icon-default';
    }
  }

  protected getBadgeValue(): string {
    if (this.unreadCount > 99) {
      return '99+';
    }
    return this.unreadCount.toString();
  }

  private navigateToRelatedEntity(notification: Notification): void {
    if (!notification.relatedEntityId) {
      return;
    }

    switch (notification.type) {
      case NotificationType.TASK_APPROVED:
      case NotificationType.TASK_NEEDS_WORK:
      case NotificationType.TASK_SUBMITTED_FOR_REVIEW:
        // Navigate to jobsite detail page with task context
        if (notification.relatedEntityType === RelatedEntityType.JOBSITE_TASK) {
          const jobsiteId = notification.metadata?.jobsiteId;

          if (jobsiteId) {
            // If jobsiteId is in metadata, navigate directly
            this.navigateToJobsiteTask(jobsiteId, notification.relatedEntityId);
          } else {
            // Try to get jobsiteId from the task in the store first
            this.store.select(selectJobsiteTaskById(notification.relatedEntityId)).pipe(
              take(1),
              switchMap(task => {
                if (task?.jobsiteId) {
                  return of(task);
                }
                // Task not in store, fetch from API
                return this.store.select(selectSelectedCompanyId).pipe(
                  take(1),
                  switchMap(companyId => {
                    if (!companyId) {
                      return of(null);
                    }
                    return this.tasksApi.getTaskById(companyId, notification.relatedEntityId!).pipe(
                      catchError(() => of(null))
                    );
                  })
                );
              })
            ).subscribe(task => {
              if (task?.jobsiteId) {
                this.navigateToJobsiteTask(task.jobsiteId, notification.relatedEntityId!);
              } else {
                // Fallback: navigate to jobsites list
                this.router.navigate(['/jobsites']);
              }
            });
          }
        }
        break;
      default:
        // For other types, no navigation
        break;
    }
  }

  private navigateToJobsiteTask(jobsiteId: string, taskId: string): void {
    this.router.navigate(['/jobsites', jobsiteId], {
      queryParams: {
        taskId: taskId,
        tab: 'tasks'
      }
    });
  }
}

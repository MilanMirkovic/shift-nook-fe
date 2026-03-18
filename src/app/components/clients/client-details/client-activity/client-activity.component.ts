import { Component, inject, Input, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { Store } from '@ngrx/store';

import { CurrencyPipe, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

import { ActivityTimelineService } from '../../../../api/activity-timeline.service';
import { Activity } from '../../../../shared/models/activity.models';
import { selectSelectedCompanyId } from '../../../../store/user/user.selectors';

@Component({
  selector: 'app-client-activity',
  standalone: true,
  templateUrl: './client-activity.component.html',
  styleUrls: ['./client-activity.component.scss'],
  imports: [
    CurrencyPipe,
    DatePipe,
    NgIf,
    NgFor,
    NgClass,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatInputModule,
  ],
})
export class ClientActivityComponent implements OnInit, OnDestroy {
  @Input({ required: true }) clientId!: string;

  private readonly store = inject(Store);
  private readonly activityService = inject(ActivityTimelineService);
  private readonly destroy$ = new Subject<void>();

  protected activities: Activity[] = [];
  protected activitiesLoading = false;
  protected activitiesError: string | null = null;
  protected currentPage = 0;
  protected totalActivities = 0;
  protected pageSize = 20;
  protected hasMoreActivities = false;
  protected loadingMore = false;

  protected startDate: Date | null = null;
  protected endDate: Date | null = null;
  protected showFilters = false;

  ngOnInit(): void {
    this.loadActivities(true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadActivities(reset: boolean = false): void {
    if (reset) {
      this.currentPage = 0;
      this.activities = [];
    }

    this.store.select(selectSelectedCompanyId)
      .pipe(
        filter((companyId): companyId is string => companyId !== null),
        take(1)
      )
      .subscribe(companyId => {
        if (reset) {
          this.activitiesLoading = true;
        } else {
          this.loadingMore = true;
        }

        const params: any = {
          page: this.currentPage,
          size: this.pageSize,
        };

        if (this.startDate) {
          params.startDate = this.startDate.toISOString();
        }
        if (this.endDate) {
          params.endDate = this.endDate.toISOString();
        }

        this.activityService.getClientActivity(companyId, this.clientId, params)
          .subscribe({
            next: (response) => {
              if (reset) {
                this.activities = response.items;
              } else {
                this.activities = [...this.activities, ...response.items];
              }
              this.totalActivities = response.total;
              this.hasMoreActivities = (this.currentPage + 1) * this.pageSize < response.total;
              this.activitiesLoading = false;
              this.loadingMore = false;
              this.activitiesError = null;
            },
            error: (error) => {
              this.activitiesError = 'Failed to load activity timeline';
              this.activitiesLoading = false;
              this.loadingMore = false;
              console.error('Activity load error:', error);
            }
          });
      });
  }

  protected loadMoreActivities(): void {
    if (this.loadingMore || !this.hasMoreActivities) return;
    this.currentPage++;
    this.loadActivities(false);
  }

  protected toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  protected applyFilters(): void {
    this.loadActivities(true);
  }

  protected clearFilters(): void {
    this.startDate = null;
    this.endDate = null;
    this.loadActivities(true);
  }

  protected getCategoryClass(category: string): string {
    switch (category) {
      case 'SUCCESS': return 'activity-item--success';
      case 'INFO':    return 'activity-item--info';
      case 'WARNING': return 'activity-item--warning';
      case 'ERROR':   return 'activity-item--danger';
      default:        return 'activity-item--info';
    }
  }

  protected getBadgeClass(category: string): string {
    switch (category) {
      case 'SUCCESS': return 'activity-badge--success';
      case 'INFO':    return 'activity-badge--info';
      case 'WARNING': return 'activity-badge--warning';
      case 'ERROR':   return 'activity-badge--danger';
      default:        return 'activity-badge--info';
    }
  }

  protected getActivityIcon(type: string): string {
    const iconMap: Record<string, string> = {
      'CLIENT_CREATED':    'person_add',
      'CLIENT_UPDATED':    'edit',
      'CLIENT_DELETED':    'delete',
      'JOBSITE_LINKED':    'location_on',
      'JOBSITE_CREATED':   'add_location',
      'JOBSITE_DELETED':   'location_off',
      'NOTE_ADDED':        'note_add',
      'DOCUMENT_UPLOADED': 'upload_file',
      'TASK_CREATED':      'task',
      'TASK_COMPLETED':    'task_alt',
      'TASK_DELETED':      'delete',
      'TIMESHEET_CREATED': 'schedule',
      'TIMESHEET_APPROVED':'check_circle',
      'TIMESHEET_REJECTED':'cancel',
      'STATUS_CHANGED':    'swap_horiz',
    };
    return iconMap[type] || 'info';
  }
}

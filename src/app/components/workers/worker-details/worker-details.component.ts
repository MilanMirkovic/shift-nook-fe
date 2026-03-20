import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { MatDialog } from '@angular/material/dialog';

import { CompanyMember } from '../../../store/company-members/company-members.models';
import {
  selectSelectedMember,
  selectSelectedMemberLoading,
  selectSelectedMemberError
} from '../../../store/company-members/company-members.selectors';
import { loadMemberById } from '../../../store/company-members/company-members.actions';
import { selectSelectedCompanyId } from '../../../store/user/user.selectors';
import { ActivityTimelineService } from '../../../api/activity-timeline.service';
import { Activity, ActivityCategory } from '../../../shared/models/activity.models';
import { TimesheetsStoreService } from '../../../store/timesheets/timesheets-store.service';
import { Timesheet } from '../../../store/timesheets/timesheets.models';
import { WorkerDetailsHelper } from './worker-details.helper';
import { InviteWorkerDialogComponent } from '../../../shared/components/invite-worker-dialog/invite-worker-dialog.component';
import { CompanyRole } from '../../../shared/models/company-role';

@Component({
  selector: 'app-worker-details',
  standalone: false,
  templateUrl: './worker-details.component.html',
  styleUrls: ['./worker-details.component.scss']
})
export class WorkerDetailsComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(Store);
  private readonly activityService = inject(ActivityTimelineService);
  private readonly timesheetsStore = inject(TimesheetsStoreService);
  private readonly dialog = inject(MatDialog);
  private readonly destroy$ = new Subject<void>();

  protected readonly worker$ = this.store.select(selectSelectedMember);
  protected readonly loading$ = this.store.select(selectSelectedMemberLoading);
  protected readonly error$ = this.store.select(selectSelectedMemberError);

  protected worker: CompanyMember | null = null;
  protected loading = true;
  protected error: string | null = null;

  // Activity timeline properties
  protected activities: Activity[] = [];
  protected activitiesLoading = false;
  protected activitiesError: string | null = null;
  protected currentPage = 0;
  protected totalActivities = 0;
  protected pageSize = 10; // Reduced from 20 to show pagination more often
  protected hasMoreActivities = false;
  protected loadingMore = false;

  // Date filter properties
  protected startDate: Date | null = null;
  protected endDate: Date | null = null;
  protected showFilters = false;

  // Timesheet date filter properties
  protected timesheetStartDate: Date | null = null;
  protected timesheetEndDate: Date | null = null;
  protected showTimesheetFilters = false;

  // Timesheet properties
  protected timesheets: Timesheet[] = [];
  protected timesheetsLoading = false;
  protected timesheetsError: string | null = null;
  protected timesheetsPage = 0;
  protected timesheetsPageSize = 5;
  protected totalTimesheets = 0;
  protected hasMoreTimesheets = false;
  protected loadingMoreTimesheets = false;

  private currentWorkerId: string | null = null;
  private currentCompanyId: string | null = null;
  private loadedTimesheets: Timesheet[] = []; // Store all loaded timesheets locally
  private currentTimesheetsPage = 0; // Track the current page locally

  ngOnInit(): void {
    // Subscribe to worker data from store
    this.worker$.pipe(takeUntil(this.destroy$)).subscribe(worker => {
      this.worker = worker;
      if (worker && this.currentCompanyId) {
        this.loadActivities(worker.userId, true);
        this.loadTimesheets(worker.userId, true);
      }
    });

    this.loading$.pipe(takeUntil(this.destroy$)).subscribe(loading => {
      this.loading = loading;
    });

    this.error$.pipe(takeUntil(this.destroy$)).subscribe(error => {
      this.error = error;
    });

    // Subscribe to timesheets from store
    this.timesheetsStore.timesheets$.pipe(takeUntil(this.destroy$)).subscribe(timesheets => {
      // Always update the timesheets array directly from store
      // The store already handles pagination correctly
      this.timesheets = timesheets;
      this.loadedTimesheets = timesheets;
    });

    this.timesheetsStore.loading$.pipe(takeUntil(this.destroy$)).subscribe(loading => {
      this.timesheetsLoading = loading;
      this.loadingMoreTimesheets = loading;
    });

    this.timesheetsStore.error$.pipe(takeUntil(this.destroy$)).subscribe(error => {
      this.timesheetsError = error;
    });

    this.timesheetsStore.total$.pipe(takeUntil(this.destroy$)).subscribe(total => {
      console.log('Timesheets total:', total);
      this.totalTimesheets = total;
      this.hasMoreTimesheets = this.timesheets.length < total;
    });

    this.timesheetsStore.page$.pipe(takeUntil(this.destroy$)).subscribe(page => {
      this.timesheetsPage = page;
      this.hasMoreTimesheets = (page + 1) * this.timesheetsPageSize < this.totalTimesheets;
    });

    // Get worker ID from route and dispatch load action
    const workerId = this.route.snapshot.paramMap.get('id');

    if (workerId) {
      this.currentWorkerId = workerId;
      this.store.select(selectSelectedCompanyId)
        .pipe(takeUntil(this.destroy$))
        .subscribe(companyId => {
          if (companyId) {
            this.currentCompanyId = companyId;
            this.store.dispatch(loadMemberById({
              companyId,
              userId: workerId
            }));
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadActivities(userId: string, reset: boolean = false): void {
    if (!this.currentCompanyId) return;

    if (reset) {
      this.currentPage = 0;
      this.activities = [];
    }

    if (reset) {
      this.activitiesLoading = true;
    } else {
      this.loadingMore = true;
    }

    const params: any = {
      page: this.currentPage,
      size: this.pageSize
    };

    // Add date filters if set
    if (this.startDate) {
      params.startDate = this.startDate.toISOString();
    }
    if (this.endDate) {
      params.endDate = this.endDate.toISOString();
    }

    this.activityService.getMemberActivity(this.currentCompanyId, userId, params)
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
  }

  private loadTimesheets(userId: string, reset: boolean = false): void {
    if (!this.currentCompanyId) return;

    // Reset the accumulated timesheets when starting fresh
    if (reset) {
      this.loadedTimesheets = [];
      this.currentTimesheetsPage = 0;
    }

    const page = this.currentTimesheetsPage;

    // Sort by check-in time descending (most recent first)
    const sort = ['checkInTime,desc'];

    // Convert dates to ISO strings if they exist
    const startDate = this.timesheetStartDate ? this.timesheetStartDate.toISOString() : undefined;
    const endDate = this.timesheetEndDate ? this.timesheetEndDate.toISOString() : undefined;

    this.timesheetsStore.loadWorkerTimesheets(
      this.currentCompanyId,
      userId,
      page,
      this.timesheetsPageSize,
      sort,
      startDate,
      endDate
    );
  }

  protected loadMoreActivities(): void {
    if (!this.currentWorkerId || this.loadingMore || !this.hasMoreActivities) return;

    this.currentPage++;
    this.loadActivities(this.currentWorkerId, false);
  }

  protected loadMoreTimesheets(): void {
    if (!this.currentWorkerId || this.loadingMoreTimesheets || !this.hasMoreTimesheets) return;

    // Increment the local page tracker
    this.currentTimesheetsPage++;
    this.loadTimesheets(this.currentWorkerId, false);
  }

  protected toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  protected toggleTimesheetFilters(): void {
    this.showTimesheetFilters = !this.showTimesheetFilters;
  }

  protected applyFilters(): void {
    if (this.currentWorkerId) {
      this.loadActivities(this.currentWorkerId, true);
    }
  }

  protected applyTimesheetFilters(): void {
    if (this.currentWorkerId) {
      this.loadTimesheets(this.currentWorkerId, true);
    }
  }

  protected clearFilters(): void {
    this.startDate = null;
    this.endDate = null;
    if (this.currentWorkerId) {
      this.loadActivities(this.currentWorkerId, true);
    }
  }

  protected clearTimesheetFilters(): void {
    this.timesheetStartDate = null;
    this.timesheetEndDate = null;
    if (this.currentWorkerId) {
      this.loadTimesheets(this.currentWorkerId, true);
    }
  }

  // Delegate to helper methods
  protected getCategoryClass(category: ActivityCategory): string {
    return WorkerDetailsHelper.getCategoryClass(category);
  }

  protected getBadgeClass(category: ActivityCategory): string {
    return WorkerDetailsHelper.getBadgeClass(category);
  }

  protected getActivityIcon(type: string): string {
    return WorkerDetailsHelper.getActivityIcon(type);
  }

  protected onBack(): void {
    this.router.navigate(['/workers']);
  }

  protected onEdit(): void {
    // TODO: Implement edit functionality
    console.log('Edit worker:', this.worker);
  }

  protected onDelete(): void {
    // TODO: Implement delete functionality
    console.log('Delete worker:', this.worker);
  }

  protected getWorkerInitials(): string {
    return WorkerDetailsHelper.getWorkerInitials(this.worker);
  }

  protected getWorkerFullName(): string {
    return WorkerDetailsHelper.getWorkerFullName(this.worker);
  }

  protected getRoleBadgeColor(): string {
    return WorkerDetailsHelper.getRoleBadgeColor(this.worker);
  }

  protected formatRole(role: string): string {
    return WorkerDetailsHelper.formatRole(role);
  }

  protected formatDuration(timesheet: Timesheet): string {
    return WorkerDetailsHelper.formatDuration(timesheet);
  }

  protected isActiveTimesheet(timesheet: Timesheet): boolean {
    return WorkerDetailsHelper.isActiveTimesheet(timesheet);
  }

  protected getTimesheetStatusClass(timesheet: Timesheet): string {
    return WorkerDetailsHelper.getTimesheetStatusClass(timesheet);
  }

  protected getTimesheetStatusLabel(timesheet: Timesheet): string {
    return WorkerDetailsHelper.getTimesheetStatusLabel(timesheet);
  }

  // Statistics calculation methods
  protected getHoursThisWeek(): number {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    return this.calculateHoursInRange(startOfWeek, now);
  }

  protected getHoursThisMonth(): number {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return this.calculateHoursInRange(startOfMonth, now);
  }

  protected getTotalHours(): number {
    return this.calculateHoursInRange(new Date(0), new Date());
  }

  private calculateHoursInRange(startDate: Date, endDate: Date): number {
    let totalHours = 0;

    for (const timesheet of this.timesheets) {
      const checkInTime = new Date(timesheet.checkInTime);

      // Skip if check-in is outside the range
      if (checkInTime < startDate || checkInTime > endDate) {
        continue;
      }

      const checkOutTime = timesheet.checkOutTime
        ? new Date(timesheet.checkOutTime)
        : new Date();

      const diffMs = checkOutTime.getTime() - checkInTime.getTime();
      const hours = diffMs / (1000 * 60 * 60);
      totalHours += hours;
    }

    return Math.round(totalHours * 10) / 10; // Round to 1 decimal place
  }

  protected getJobsiteStats(): Array<{
    jobsiteName: string;
    hours: number;
    shiftCount: number;
    percentage: number;
  }> {
    const jobsiteMap = new Map<string, { hours: number; shiftCount: number }>();
    const totalHours = this.getTotalHours();

    for (const timesheet of this.timesheets) {
      const jobsiteName = timesheet.jobsiteName || 'Unknown Jobsite';

      const checkInTime = new Date(timesheet.checkInTime);
      const checkOutTime = timesheet.checkOutTime
        ? new Date(timesheet.checkOutTime)
        : new Date();

      const diffMs = checkOutTime.getTime() - checkInTime.getTime();
      const hours = diffMs / (1000 * 60 * 60);

      const existing = jobsiteMap.get(jobsiteName) || { hours: 0, shiftCount: 0 };
      jobsiteMap.set(jobsiteName, {
        hours: existing.hours + hours,
        shiftCount: existing.shiftCount + 1
      });
    }

    const stats = Array.from(jobsiteMap.entries()).map(([jobsiteName, data]) => ({
      jobsiteName,
      hours: Math.round(data.hours * 10) / 10,
      shiftCount: data.shiftCount,
      percentage: totalHours > 0 ? Math.round((data.hours / totalHours) * 100) : 0
    }));

    // Sort by hours descending
    stats.sort((a, b) => b.hours - a.hours);

    return stats;
  }

  protected getCompletedShiftsCount(): number {
    return this.timesheets.filter(ts => ts.checkOutTime).length;
  }

  protected getActiveShiftsCount(): number {
    return this.timesheets.filter(ts => !ts.checkOutTime).length;
  }

  protected getAverageShiftLength(): number {
    if (this.timesheets.length === 0) return 0;

    const completedTimesheets = this.timesheets.filter(ts => ts.checkOutTime);
    if (completedTimesheets.length === 0) return 0;

    let totalHours = 0;
    for (const timesheet of completedTimesheets) {
      const checkInTime = new Date(timesheet.checkInTime);
      const checkOutTime = new Date(timesheet.checkOutTime!);
      const diffMs = checkOutTime.getTime() - checkInTime.getTime();
      const hours = diffMs / (1000 * 60 * 60);
      totalHours += hours;
    }

    const average = totalHours / completedTimesheets.length;
    return Math.round(average * 10) / 10;
  }

  protected openInviteDialog(): void {
    this.dialog.open(InviteWorkerDialogComponent, {
      width: '480px',
      disableClose: false,
      panelClass: 'centered-dialog',
      data: { role: CompanyRole.WORKER },
    });
  }
}

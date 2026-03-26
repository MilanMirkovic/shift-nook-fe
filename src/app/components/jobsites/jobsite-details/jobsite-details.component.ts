import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, take, shareReplay, tap, switchMap, takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { MatTabGroup } from '@angular/material/tabs';

import { Jobsite } from '../../../store/jobsites/jobsites.models';
import { Client } from '../../../store/clients/clients.models';
import { Activity } from '../../../shared/models/activity.models';
import { JobsiteTaskDialogComponent } from '../../../shared/components/jobsite-task-dialog/jobsite-task-dialog.component';
import { TaskReviewDialogComponent, TaskReviewDialogData, TaskReviewDialogResult } from '../../../shared/components/task-review-dialog/task-review-dialog.component';
import { createJobsiteTask, createJobsiteTaskSuccess, createJobsiteTaskFailure, updateJobsiteTask, updateJobsiteTaskSuccess, updateJobsiteTaskFailure, deleteJobsiteTask, deleteJobsiteTaskSuccess, deleteJobsiteTaskFailure, loadJobsiteTasks } from '../../../store/jobsite-tasks/jobsite-tasks.actions';
import { JobsiteTask } from '../../../store/jobsite-tasks/jobsite-tasks.models';
import { NotificationService } from '../../../shared/services/notification.service';
import { JobsiteDetailsStateService } from './jobsite-details-state.service';
import { selectCanManageJobsites } from '../../../store/user/user.selectors';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { JobsiteDialogComponent } from '../../../shared/components/jobsite-dialog/jobsite-dialog.component';
import { updateJobsite, updateJobsiteSuccess, updateJobsiteFailure } from '../../../store/jobsites/jobsites.actions';
import { ActivityFilters } from './tabs/jobsite-activity/jobsite-activity.component';

@Component({
  selector: 'app-jobsite-details',
  standalone: false,
  templateUrl: './jobsite-details.component.html',
  styleUrls: ['./jobsite-details.component.scss']
})
export class JobsiteDetailsComponent implements OnInit, OnDestroy {
  @ViewChild(MatTabGroup) tabGroup!: MatTabGroup;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly notificationService = inject(NotificationService);
  private readonly actions$ = inject(Actions);
  private readonly stateService = inject(JobsiteDetailsStateService);
  private readonly destroy$ = new Subject<void>();
  private readonly store = inject(Store);

  private readonly jobsiteSubject$ = new BehaviorSubject<Jobsite | null>(null);
  jobsite$: Observable<Jobsite | null> = this.jobsiteSubject$.asObservable();

  protected tasks$: Observable<JobsiteTask[]> = new Observable();
  protected tasksLoading$: Observable<boolean> = new Observable();
  protected activities$: Observable<Activity[]> = new Observable();
  protected activitiesLoading$: Observable<boolean> = new Observable();
  protected activitiesError$: Observable<string | null> = new Observable();
  protected activitiesPagination$: Observable<any> = new Observable();
  protected canManageJobsites$: Observable<boolean> = this.store.select(selectCanManageJobsites);

  protected activities: Activity[] = [];
  protected activitiesLoading = false;
  protected activitiesError: string | null = null;
  protected hasMoreActivities = false;
  protected totalActivities = 0;
  protected loadingMore = false;
  protected client: Client | null = null;
  protected filteredTaskId: string | null = null;

  private currentJobsiteId: string | null = null;
  private currentCompanyId: string | null = null;
  private activityKey = '';
  private currentPage = 0;
  private currentFilters: ActivityFilters = { startDate: null, endDate: null };

  ngOnInit(): void {
    const jobsiteId = this.route.snapshot.paramMap.get('id');
    if (!jobsiteId) return;

    this.initializeComponent(jobsiteId);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeComponent(jobsiteId: string): void {
    this.currentJobsiteId = jobsiteId;
    this.activityKey = `JOBSITE_TASK:${jobsiteId}`;

    this.setupObservables(jobsiteId);
    this.subscribeToStateChanges();
    this.loadData();
    this.handleQueryParams();
  }

  /**
   * Handle query parameters for tab navigation (e.g., from notifications)
   */
  private handleQueryParams(): void {
    this.route.queryParams.pipe(
      take(1)
    ).subscribe(params => {
      const tab = params['tab'];
      const taskId = params['taskId'];

      // Set the filtered task ID if provided
      if (taskId) {
        this.filteredTaskId = taskId;
      }

      if (tab) {
        // Wait for view to initialize, then switch to the requested tab
        setTimeout(() => {
          this.selectTabByName(tab);
        }, 100);
      }
    });
  }

  /**
   * Select a tab by its name
   */
  private selectTabByName(tabName: string): void {
    if (!this.tabGroup) return;

    const tabIndexMap: Record<string, number> = {
      'timesheets': 0,
      'tasks': 1,
      'details': 2,
      'activity': 3
    };

    const tabIndex = tabIndexMap[tabName.toLowerCase()];
    if (tabIndex !== undefined) {
      this.tabGroup.selectedIndex = tabIndex;
    }
  }

  private setupObservables(jobsiteId: string): void {
    this.tasks$ = this.stateService.getTasks$(jobsiteId);
    this.tasksLoading$ = this.stateService.getTasksLoading$();
    this.activities$ = this.stateService.getActivities$(this.activityKey);
    this.activitiesLoading$ = this.stateService.getActivitiesLoading$(this.activityKey);
    this.activitiesError$ = this.stateService.getActivitiesError$(this.activityKey);
    this.activitiesPagination$ = this.stateService.getActivitiesPagination$(this.activityKey);

    this.stateService.getJobsite$(jobsiteId).pipe(
      filter(jobsite => jobsite !== null && jobsite !== undefined),
      tap(jobsite => {
        if (jobsite) {
          this.jobsiteSubject$.next(jobsite);
          if (jobsite.clientId) {
            this.loadClient(jobsite.clientId);
          }
        }
      }),
      shareReplay({ bufferSize: 1, refCount: true }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  private subscribeToStateChanges(): void {
    this.activities$.pipe(takeUntil(this.destroy$)).subscribe(activities => {
      this.activities = activities;
    });

    this.activitiesLoading$.pipe(takeUntil(this.destroy$)).subscribe(loading => {
      this.activitiesLoading = loading;
    });

    this.activitiesError$.pipe(takeUntil(this.destroy$)).subscribe(error => {
      this.activitiesError = error;
    });

    this.activitiesPagination$.pipe(takeUntil(this.destroy$)).subscribe(pagination => {
      this.hasMoreActivities = pagination.hasMore;
      this.totalActivities = pagination.totalItems;
      this.currentPage = pagination.currentPage;
    });
  }

  private loadData(): void {
    this.stateService.getCompanyId$().subscribe(companyId => {
      this.currentCompanyId = companyId;
      this.stateService.loadJobsiteData(companyId, this.currentJobsiteId!);
    });
  }

  private loadClient(clientId: string): void {
    this.stateService.getClient$(clientId).pipe(
      filter(client => client !== null),
      take(1)
    ).subscribe(client => {
      this.client = client;
    });
  }

  protected loadMoreActivities(): void {
    if (!this.currentJobsiteId || !this.currentCompanyId || this.loadingMore || !this.hasMoreActivities) return;

    this.loadingMore = true;
    this.stateService.loadActivities({
      companyId: this.currentCompanyId,
      entityType: 'JOBSITE_TASK',
      entityId: this.currentJobsiteId,
      page: this.currentPage + 1,
      reset: false,
      startDate: this.currentFilters.startDate?.toISOString(),
      endDate: this.currentFilters.endDate?.toISOString()
    });

    setTimeout(() => this.loadingMore = false, 500);
  }

  protected onApplyFilters(filters: ActivityFilters): void {
    if (!this.currentJobsiteId || !this.currentCompanyId) return;

    this.currentFilters = filters;
    this.stateService.loadActivities({
      companyId: this.currentCompanyId,
      entityType: 'JOBSITE_TASK',
      entityId: this.currentJobsiteId,
      reset: true,
      startDate: filters.startDate?.toISOString(),
      endDate: filters.endDate?.toISOString()
    });
  }

  protected onClearFilters(): void {
    this.currentFilters = { startDate: null, endDate: null };
    this.onApplyFilters(this.currentFilters);
  }

  protected onAddTask(): void {
    this.jobsite$.pipe(
      filter(jobsite => jobsite !== null),
      take(1),
      switchMap(jobsite => {
        if (!jobsite?.id || !this.currentCompanyId) return [];

        const dialogRef = this.dialog.open(JobsiteTaskDialogComponent, {
          width: '500px',
          maxWidth: '95vw',
          maxHeight: '90vh',
          disableClose: false,
          autoFocus: true,
          panelClass: 'task-dialog-container',
          position: { top: '15%' },
          data: {
            jobsiteId: jobsite.id,
            jobsiteName: jobsite.name
          }
        });

        return dialogRef.afterClosed();
      }),
      filter(result => !!result && !!this.currentCompanyId),
      tap(result => {
        this.stateService['store'].dispatch(
          createJobsiteTask({
            companyId: this.currentCompanyId!,
            task: result
          })
        );
      }),
      switchMap(() =>
        this.actions$.pipe(
          ofType(createJobsiteTaskSuccess, createJobsiteTaskFailure),
          take(1)
        )
      )
    ).subscribe(action => {
      if (action.type === createJobsiteTaskSuccess.type) {
        this.notificationService.success('Task created successfully!');
      } else {
        this.notificationService.error('Failed to create task. Please try again.');
      }
    });
  }

  protected onCreateTimesheet(): void {
    // TODO: Implement timesheet creation dialog
  }

  protected onEditJobsite(): void {
    this.jobsite$.pipe(
      filter(jobsite => jobsite !== null),
      take(1),
      switchMap(jobsite => {
        if (!jobsite || !this.currentCompanyId) return [];

        const dialogRef = this.dialog.open(JobsiteDialogComponent, {
          width: '500px',
          maxWidth: '95vw',
          maxHeight: '90vh',
          disableClose: false,
          autoFocus: true,
          panelClass: 'jobsite-dialog-container',
          position: { top: '15%' },
          data: {
            jobsite: {
              id: jobsite.id,
              name: jobsite.name,
              address: jobsite.address,
              clientId: jobsite.clientId,
              latitude: jobsite.latitude,
              longitude: jobsite.longitude,
            },
            clientName: jobsite.clientName,
            mode: 'edit'
          }
        });

        return dialogRef.afterClosed();
      }),
      filter(result => !!result && !!this.currentCompanyId),
      tap(result => {
        this.store.dispatch(
          updateJobsite({
            companyId: this.currentCompanyId!,
            jobsiteId: result.id,
            jobsite: {
              name: result.name,
              address: result.address,
              clientId: result.clientId,
              latitude: result.latitude,
              longitude: result.longitude,
            }
          })
        );
      }),
      switchMap(() =>
        this.actions$.pipe(
          ofType(updateJobsiteSuccess, updateJobsiteFailure),
          take(1)
        )
      )
    ).subscribe(action => {
      if (action.type === updateJobsiteSuccess.type) {
        this.notificationService.success('Jobsite updated successfully!');
      } else {
        this.notificationService.error('Failed to update jobsite. Please try again.');
      }
    });
  }

  protected onViewOnMap(): void {
    this.jobsite$.pipe(take(1)).subscribe(jobsite => {
      if (!jobsite) return;

      let url: string;
      if (jobsite.latitude && jobsite.longitude) {
        url = `https://www.google.com/maps/search/?api=1&query=${jobsite.latitude},${jobsite.longitude}`;
      } else if (jobsite.address) {
        url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(jobsite.address)}`;
      } else {
        this.notificationService.warning('No location data available for this jobsite.');
        return;
      }
      window.open(url, '_blank');
    });
  }

  protected onEditTask(task: JobsiteTask): void {
    this.jobsite$.pipe(
      filter(jobsite => jobsite !== null),
      take(1),
      switchMap(jobsite => {
        if (!jobsite?.id || !this.currentCompanyId) return [];

        const dialogRef = this.dialog.open(JobsiteTaskDialogComponent, {
          width: '500px',
          maxWidth: '95vw',
          maxHeight: '90vh',
          disableClose: false,
          autoFocus: true,
          panelClass: 'task-dialog-container',
          position: { top: '15%' },
          data: {
            jobsiteId: jobsite.id,
            jobsiteName: jobsite.name,
            task: task
          }
        });

        return dialogRef.afterClosed();
      }),
      filter(result => !!result && !!this.currentCompanyId),
      tap(result => {
        this.store.dispatch(
          updateJobsiteTask({
            companyId: this.currentCompanyId!,
            jobsiteId: task.jobsiteId,
            taskId: task.id,
            updateData: result
          })
        );
      }),
      switchMap(() =>
        this.actions$.pipe(
          ofType(updateJobsiteTaskSuccess, updateJobsiteTaskFailure),
          take(1)
        )
      )
    ).subscribe(action => {
      if (action.type === updateJobsiteTaskSuccess.type) {
        this.notificationService.success('Task updated successfully!');
      } else {
        this.notificationService.error('Failed to update task. Please try again.');
      }
    });
  }

  protected onDeleteTask(task: JobsiteTask): void {
    if (!this.currentCompanyId) return;

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Task',
        message: `Are you sure you want to delete "${task.name}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger'
      },
      position: { top: '80px' }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed && this.currentCompanyId) {
        this.store.dispatch(
          deleteJobsiteTask({
            companyId: this.currentCompanyId,
            jobsiteId: task.jobsiteId,
            taskId: task.id
          })
        );

        this.actions$.pipe(
          ofType(deleteJobsiteTaskSuccess, deleteJobsiteTaskFailure),
          take(1)
        ).subscribe(action => {
          if (action.type === deleteJobsiteTaskSuccess.type) {
            this.notificationService.success('Task deleted successfully!');
          } else {
            this.notificationService.error('Failed to delete task. Please try again.');
          }
        });
      }
    });
  }

  /**
   * Clear task filter and update URL
   */
  protected onClearTaskFilter(): void {
    this.filteredTaskId = null;
    // Remove taskId from URL query params
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { taskId: null },
      queryParamsHandling: 'merge'
    });
  }

  /**
   * Handle task review action
   */
  protected onReviewTask(task: JobsiteTask): void {
    this.jobsite$.pipe(
      filter(jobsite => jobsite !== null),
      take(1)
    ).subscribe(jobsite => {
      if (!jobsite || !this.currentCompanyId) return;

      const dialogRef = this.dialog.open(TaskReviewDialogComponent, {
        width: '600px',
        maxWidth: '95vw',
        disableClose: true,
        autoFocus: true,
        panelClass: 'task-review-dialog-container',
        data: {
          companyId: this.currentCompanyId,
          jobsiteId: jobsite.id,
          jobsiteName: jobsite.name,
          task: task
        } as TaskReviewDialogData
      });

      dialogRef.afterClosed().pipe(
        take(1),
        filter(result => result !== undefined && result !== null)
      ).subscribe((result: TaskReviewDialogResult) => {
        // Refresh tasks after review
        if (result.action === 'approved' || result.action === 'rejected') {
          this.store.dispatch(loadJobsiteTasks({
            companyId: this.currentCompanyId!,
            jobsiteId: task.jobsiteId
          }));

          const message = result.action === 'approved'
            ? 'Task approved successfully!'
            : 'Task sent back for more work.';
          this.notificationService.success(message);
        }
      });
    });
  }
}

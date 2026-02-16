import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, take, distinctUntilChanged, shareReplay, tap } from 'rxjs/operators';

import { loadClientById } from '../../../store/clients/clients.actions';
import { selectClientById } from '../../../store/clients/clients.selectors';
import { selectSelectedCompanyId } from '../../../store/user/user.selectors';
import { Client } from '../../../store/clients/clients.models';
import { AsyncPipe, CurrencyPipe, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { ActivityTimelineService } from '../../../api/activity-timeline.service';
import { Activity, ActivityCategory } from '../../../shared/models/activity.models';
import { ApiService } from '../../../api/api.service';
import { Jobsite } from '../../../store/jobsites/jobsites.models';
import {JobsiteDialogComponent} from '../../../shared/components/jobsite-dialog/jobsite-dialog.component';
import {createJobsite, createJobsiteFailure, createJobsiteSuccess, deleteJobsite, deleteJobsiteSuccess, deleteJobsiteFailure, updateJobsite, updateJobsiteFailure, updateJobsiteSuccess} from '../../../store/jobsites/jobsites.actions';
import {MatDialog} from '@angular/material/dialog';
import {NotificationService} from '../../../shared/services/notification.service';
import { Actions, ofType } from '@ngrx/effects';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-client-details',
  standalone: true,
  templateUrl: './client-details.component.html',
  imports: [
    DatePipe,
    CurrencyPipe,
    AsyncPipe,
    NgIf,
    NgFor,
    NgClass,
    FormsModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatInputModule,
    RouterLink
  ],
  styleUrls: ['./client-details.component.scss']
})
export class ClientDetailsComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly activityService = inject(ActivityTimelineService);
  private readonly notificationService = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  private readonly apiService = inject(ApiService);
  private readonly destroy$ = new Subject<void>();

  // Use BehaviorSubject to cache the client and prevent it from becoming null
  private readonly clientSubject$ = new BehaviorSubject<Client | null>(null);
  client$: Observable<Client | null> = this.clientSubject$.asObservable();

  protected activities: Activity[] = [];
  protected activitiesLoading = false;
  protected activitiesError: string | null = null;
  protected currentPage = 0;
  protected totalActivities = 0;
  protected pageSize = 20;
  protected hasMoreActivities = false;
  protected loadingMore = false;

  // Date filter properties
  protected startDate: Date | null = null;
  protected endDate: Date | null = null;
  protected showFilters = false;

  // Jobsites properties
  protected jobsites: Jobsite[] = [];
  protected jobsitesLoading = false;
  protected jobsitesError: string | null = null;
  protected totalJobsites = 0;

  private currentClientId: string | null = null;
  private currentCompanyId: string | null = null;

  constructor(private actions$: Actions) {}

  ngOnInit(): void {
    const clientId = this.route.snapshot.paramMap.get('id');
    if (!clientId) return;

    this.currentClientId = clientId;

    // Use shareReplay to cache the last emitted non-null value and prevent template flickering
    this.store.select(selectClientById(clientId)).pipe(
      // Only cache non-null values
      filter(client => client !== null),
      // Use tap to update the BehaviorSubject without affecting the stream
      tap(client => this.clientSubject$.next(client)),
      shareReplay({ bufferSize: 1, refCount: true })
    ).subscribe();

    // Load client data
    this.store
      .select(selectSelectedCompanyId)
      .pipe(
        filter((id): id is string => !!id),
        take(1)
      )
      .subscribe((companyId) => {
        this.currentCompanyId = companyId;
        this.store.dispatch(
          loadClientById({ companyId, clientId })
        );

        // Load jobsites and activities after we have both companyId and clientId
        // Wait for the client to be loaded in the store
        this.client$.pipe(
          filter(client => client !== null && client?.id !== undefined),
          take(1), // Only take the first emission after the client is loaded
          distinctUntilChanged()
        ).subscribe(client => {
          if (client?.id) {
            const cid = client.id;
            // Defer initial data loading to avoid ExpressionChangedAfterItHasBeenCheckedError
            setTimeout(() => {
              this.loadActivities(cid, true);
              this.loadJobsites(cid);
            });
          }
        });
      });
  }

  onAddJobsite(): void {
    // Get the current client data to pre-select it in the dialog
    this.client$.pipe(
      filter(client => client !== null),
      take(1)
    ).subscribe(client => {
      const dialogRef = this.dialog.open(JobsiteDialogComponent, {
        width: '500px',
        maxWidth: '95vw',
        maxHeight: '90vh',
        disableClose: false,
        autoFocus: true,
        panelClass: 'jobsite-dialog-container',
        position: {
          top: '25%'
        },
        data: {
          clientId: client?.id,
          clientName: client?.name
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result && this.currentCompanyId && this.currentClientId) {
          // Dispatch create jobsite action
          this.store.dispatch(
            createJobsite({
              companyId: this.currentCompanyId,
              jobsite: result
            })
          );

          // Listen for success or failure actions
          this.actions$.pipe(
            ofType(
              createJobsiteSuccess,
              createJobsiteFailure
            ),
            take(1)
          ).subscribe(action => {
            if (action.type === createJobsiteSuccess.type) {
              this.notificationService.success('Jobsite added successfully!');
              // Reload jobsites to show the new one
              if (this.currentClientId) {
                this.loadJobsites(this.currentClientId);
              }
            } else if (action.type === createJobsiteFailure.type) {
              this.notificationService.error(
                 'Failed to create jobsite. Please try again.'
              );
            }
          });
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadActivities(clientId: string, reset: boolean = false): void {
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
          size: this.pageSize
        };

        // Add date filters if set
        if (this.startDate) {
          params.startDate = this.startDate.toISOString();
        }
        if (this.endDate) {
          params.endDate = this.endDate.toISOString();
        }

        this.activityService.getClientActivity(companyId, clientId, params)
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

  private loadJobsites(clientId: string): void {
    if (!this.currentCompanyId) return;

    this.jobsitesLoading = true;
    this.jobsitesError = null;

    this.apiService.getJobsitesByClient(this.currentCompanyId, clientId, 0, 100)
      .subscribe({
        next: (response) => {
          this.jobsites = response.content;
          this.totalJobsites = response.totalElements;
          this.jobsitesLoading = false;
        },
        error: (error) => {
          this.jobsitesError = 'Failed to load jobsites';
          this.jobsitesLoading = false;
          console.error('Jobsites load error:', error);
        }
      });
  }

  protected loadMoreActivities(): void {
    if (!this.currentClientId || this.loadingMore || !this.hasMoreActivities) return;

    this.currentPage++;
    this.loadActivities(this.currentClientId, false);
  }

  protected toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  protected applyFilters(): void {
    if (this.currentClientId) {
      this.loadActivities(this.currentClientId, true);
    }
  }

  protected clearFilters(): void {
    this.startDate = null;
    this.endDate = null;
    if (this.currentClientId) {
      this.loadActivities(this.currentClientId, true);
    }
  }

  protected onDeleteJobsite(jobsite: Jobsite): void {
    if (!this.currentCompanyId) return;

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Jobsite',
        message: `Are you sure you want to delete "${jobsite.name}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger'
      },
      position: { top: '80px' }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed && this.currentCompanyId) {
        // Dispatch delete action
        this.store.dispatch(
          deleteJobsite({
            companyId: this.currentCompanyId,
            jobsiteId: jobsite.id
          })
        );

        // Listen for success or failure
        this.actions$.pipe(
          ofType(
            deleteJobsiteSuccess,
            deleteJobsiteFailure
          ),
          take(1)
        ).subscribe(action => {
          if (action.type === deleteJobsiteSuccess.type) {
            this.notificationService.success('Jobsite deleted successfully!');
            // Reload jobsites list
            if (this.currentClientId) {
              this.loadJobsites(this.currentClientId);
            }
          } else if (action.type === deleteJobsiteFailure.type) {
            this.notificationService.error('Failed to delete jobsite. Please try again.');
          }
        });
      }
    });
  }

  protected onEditJobsite(jobsite: Jobsite): void {
    if (!this.currentCompanyId) return;

    // Get the current client data for display purposes
    this.client$.pipe(
      filter(client => client !== null),
      take(1)
    ).subscribe(client => {
      const dialogRef = this.dialog.open(JobsiteDialogComponent, {
        width: '500px',
        maxWidth: '95vw',
        maxHeight: '90vh',
        disableClose: false,
        autoFocus: true,
        panelClass: 'jobsite-dialog-container',
        position: {
          top: '15%'
        },
        data: {
          mode: 'edit',
          jobsite: {
            id: jobsite.id,
            name: jobsite.name,
            address: jobsite.address,
            clientId: jobsite.clientId,
            latitude: jobsite.latitude,
            longitude: jobsite.longitude
          },
          clientName: client?.name
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result && this.currentCompanyId) {
          // Extract the ID and update data
          const { id, ...updateData } = result;

          // Dispatch update jobsite action
          this.store.dispatch(
            updateJobsite({
              companyId: this.currentCompanyId,
              jobsiteId: id,
              jobsite: updateData
            })
          );

          // Listen for success or failure actions
          this.actions$.pipe(
            ofType(
              updateJobsiteSuccess,
              updateJobsiteFailure
            ),
            take(1)
          ).subscribe(action => {
            if (action.type === updateJobsiteSuccess.type) {
              this.notificationService.success('Jobsite updated successfully!');
              // Reload jobsites to show the updated one
              if (this.currentClientId) {
                this.loadJobsites(this.currentClientId);
              }
            } else if (action.type === updateJobsiteFailure.type) {
              this.notificationService.error('Failed to update jobsite. Please try again.');
            }
          });
        }
      });
    });
  }

  protected getCategoryClass(category: ActivityCategory): string {
    switch (category) {
      case ActivityCategory.SUCCESS:
        return 'activity-item--success';
      case ActivityCategory.INFO:
        return 'activity-item--info';
      case ActivityCategory.WARNING:
        return 'activity-item--warning';
      case ActivityCategory.ERROR:
        return 'activity-item--danger';
      default:
        return 'activity-item--info';
    }
  }

  protected getBadgeClass(category: ActivityCategory): string {
    switch (category) {
      case ActivityCategory.SUCCESS:
        return 'activity-badge--success';
      case ActivityCategory.INFO:
        return 'activity-badge--info';
      case ActivityCategory.WARNING:
        return 'activity-badge--warning';
      case ActivityCategory.ERROR:
        return 'activity-badge--danger';
      default:
        return 'activity-badge--info';
    }
  }

  protected getActivityIcon(type: string): string {
    // Map event types to Material icons
    const iconMap: Record<string, string> = {
      'CLIENT_CREATED': 'person_add',
      'CLIENT_UPDATED': 'edit',
      'CLIENT_DELETED': 'delete',
      'JOBSITE_LINKED': 'location_on',
      'JOBSITE_CREATED': 'add_location',
      'JOBSITE_DELETED': 'location_off',
      'NOTE_ADDED': 'note_add',
      'DOCUMENT_UPLOADED': 'upload_file',
      'TASK_CREATED': 'task',
      'TASK_COMPLETED': 'task_alt',
      'TASK_DELETED': 'delete',
      'TIMESHEET_CREATED': 'schedule',
      'TIMESHEET_APPROVED': 'check_circle',
      'TIMESHEET_REJECTED': 'cancel',
      'STATUS_CHANGED': 'swap_horiz',
    };
    return iconMap[type] || 'info';
  }
}

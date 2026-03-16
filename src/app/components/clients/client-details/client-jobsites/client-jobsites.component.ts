import { Component, inject, Input, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';

import { DatePipe, NgFor, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';

import { Jobsite } from '../../../../store/jobsites/jobsites.models';
import {
  createJobsite, createJobsiteFailure, createJobsiteSuccess,
  deleteJobsite, deleteJobsiteSuccess, deleteJobsiteFailure,
  updateJobsite, updateJobsiteFailure, updateJobsiteSuccess,
} from '../../../../store/jobsites/jobsites.actions';
import { ApiService } from '../../../../api/api.service';
import { JobsiteDialogComponent } from '../../../../shared/components/jobsite-dialog/jobsite-dialog.component';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-client-jobsites',
  standalone: true,
  templateUrl: './client-jobsites.component.html',
  styleUrls: ['./client-jobsites.component.scss'],
  imports: [
    DatePipe,
    NgIf,
    NgFor,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    RouterLink,
  ],
})
export class ClientJobsitesComponent implements OnInit, OnDestroy {
  @Input({ required: true }) clientId!: string;
  @Input({ required: true }) clientName!: string;
  @Input({ required: true }) companyId!: string;

  private readonly store = inject(Store);
  private readonly dialog = inject(MatDialog);
  private readonly apiService = inject(ApiService);
  private readonly notificationService = inject(NotificationService);
  private readonly actions$ = inject(Actions);
  private readonly destroy$ = new Subject<void>();

  protected jobsites: Jobsite[] = [];
  protected jobsitesLoading = false;
  protected jobsitesError: string | null = null;
  protected totalJobsites = 0;

  ngOnInit(): void {
    this.loadJobsites();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected onAddJobsite(): void {
    const dialogRef = this.dialog.open(JobsiteDialogComponent, {
      width: '500px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: false,
      autoFocus: true,
      panelClass: 'jobsite-dialog-container',
      position: { top: '25%' },
      data: { clientId: this.clientId, clientName: this.clientName },
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (!result) return;

      this.store.dispatch(createJobsite({ companyId: this.companyId, jobsite: result }));

      this.actions$.pipe(
        ofType(createJobsiteSuccess, createJobsiteFailure),
        take(1),
        takeUntil(this.destroy$),
      ).subscribe(action => {
        if (action.type === createJobsiteSuccess.type) {
          this.notificationService.success('Jobsite added successfully!');
          this.loadJobsites();
        } else {
          this.notificationService.error('Failed to create jobsite. Please try again.');
        }
      });
    });
  }

  protected onEditJobsite(jobsite: Jobsite): void {
    const dialogRef = this.dialog.open(JobsiteDialogComponent, {
      width: '500px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: false,
      autoFocus: true,
      panelClass: 'jobsite-dialog-container',
      position: { top: '15%' },
      data: {
        mode: 'edit',
        jobsite: {
          id: jobsite.id,
          name: jobsite.name,
          address: jobsite.address,
          clientId: jobsite.clientId,
          latitude: jobsite.latitude,
          longitude: jobsite.longitude,
        },
        clientName: this.clientName,
      },
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (!result) return;

      const { id, ...updateData } = result;
      this.store.dispatch(updateJobsite({ companyId: this.companyId, jobsiteId: id, jobsite: updateData }));

      this.actions$.pipe(
        ofType(updateJobsiteSuccess, updateJobsiteFailure),
        take(1),
        takeUntil(this.destroy$),
      ).subscribe(action => {
        if (action.type === updateJobsiteSuccess.type) {
          this.notificationService.success('Jobsite updated successfully!');
          this.loadJobsites();
        } else {
          this.notificationService.error('Failed to update jobsite. Please try again.');
        }
      });
    });
  }

  protected onDeleteJobsite(jobsite: Jobsite): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Jobsite',
        message: `Are you sure you want to delete "${jobsite.name}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger',
      },
      position: { top: '80px' },
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(confirmed => {
      if (!confirmed) return;

      this.store.dispatch(deleteJobsite({ companyId: this.companyId, jobsiteId: jobsite.id }));

      this.actions$.pipe(
        ofType(deleteJobsiteSuccess, deleteJobsiteFailure),
        take(1),
        takeUntil(this.destroy$),
      ).subscribe(action => {
        if (action.type === deleteJobsiteSuccess.type) {
          this.notificationService.success('Jobsite deleted successfully!');
          this.loadJobsites();
        } else {
          this.notificationService.error('Failed to delete jobsite. Please try again.');
        }
      });
    });
  }

  private loadJobsites(): void {
    this.jobsitesLoading = true;
    this.jobsitesError = null;

    this.apiService.getJobsitesByClient(this.companyId, this.clientId, 0, 100)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.jobsites = response.content;
          this.totalJobsites = response.totalElements;
          this.jobsitesLoading = false;
        },
        error: () => {
          this.jobsitesError = 'Failed to load jobsites';
          this.jobsitesLoading = false;
        },
      });
  }
}

import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, filter, distinctUntilChanged, take } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Actions, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';

import { DataTableColumn, DataTableAction } from '../../layout/data-table/data-table.component';
import {
  selectJobsites,
  selectTotal,
  selectLoading,
  selectLoaded
} from '../../store/jobsites/jobsites.selectors';
import { loadJobsites, updatePage, createJobsite, createJobsiteSuccess, deleteJobsite, updateJobsite, updateJobsiteSuccess, updateJobsiteFailure } from '../../store/jobsites/jobsites.actions';
import { Jobsite } from '../../store/jobsites/jobsites.models';
import { selectSelectedCompanyId, selectCurrentCompany } from '../../store/user/user.selectors';
import { CompanyRole } from '../../shared/models/company-role';
import { JobsiteDialogComponent } from '../../shared/components/jobsite-dialog/jobsite-dialog.component';
import { NotificationService } from '../../shared/services/notification.service';
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-jobsites',
  standalone: false,
  templateUrl: './jobsites.component.html',
  styleUrl: './jobsites.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobsitesComponent implements OnInit, OnDestroy {
  private readonly _store = inject(Store);
  private readonly actions$ = inject(Actions);
  private readonly dialog = inject(MatDialog);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  readonly selectedCompanyId$ = this._store.select(selectSelectedCompanyId);
  readonly currentCompany$ = this._store.select(selectCurrentCompany);
  readonly jobsites$ = this._store.select(selectJobsites);
  readonly total$ = this._store.select(selectTotal);
  readonly loading$ = this._store.select(selectLoading);
  readonly loaded$ = this._store.select(selectLoaded);

  private companyId: string | null = null;
  private isOwner = false;
  protected canManageJobsites = false;
  protected currentPageNumber = 0;
  protected currentPageSize = 5;
  protected searchQuery = '';

  protected readonly columns: DataTableColumn<Jobsite>[] = [
    { id: 'name', header: 'Name', field: 'name', searchable: true },
    {
      id: 'clientName',
      header: 'Client',
      field: 'clientName',
      searchable: true,
      format: (value) => (value as string) || '—'
    },
    { id: 'address', header: 'Address', field: 'address', searchable: true },
  ];

  protected readonly actions: DataTableAction<Jobsite>[] = [
    {
      icon: 'visibility',
      label: 'View',
      color: 'primary',
      handler: (jobsite) => this.onView(jobsite)
    },
    {
      icon: 'delete',
      label: 'Delete',
      color: 'warn',
      handler: (jobsite) => this.onDelete(jobsite),
      visible: () => this.isOwner
    }
  ];

  ngOnInit(): void {
    // Check if user is owner or accountant
    this.currentCompany$
      .pipe(takeUntil(this.destroy$))
      .subscribe(company => {
        this.isOwner = company?.role === CompanyRole.OWNER;
        this.canManageJobsites = company?.role === CompanyRole.OWNER || company?.role === CompanyRole.ACCOUNTANT;
      });

    // Wait for company ID, then load only if not already loaded
    this.selectedCompanyId$
      .pipe(
        filter(id => id !== null),
        distinctUntilChanged(),  // only react when company ID actually changes
        takeUntil(this.destroy$)
      )
      .subscribe(companyId => {
        this.companyId = companyId;

        this.loaded$.pipe(take(1)).subscribe(loaded => {
          if (!loaded) {
            this.loadJobsitesList();
          }
        });
      });

    // Reload jobsites after successful creation to ensure clientName is populated
    this.actions$
      .pipe(
        ofType(createJobsiteSuccess),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.loadJobsitesList();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onPageChange(page: number, size: number): void {
    if (!this.companyId) return;

    this._store.dispatch(updatePage({ page, size }));
    this._store.dispatch(
      loadJobsites({
        companyId: this.companyId,
        page,
        size
      })
    );
  }

  private onView(jobsite: Jobsite): void {
    this.router.navigate(['/jobsites', jobsite.id]);
  }

  private onEdit(jobsite: Jobsite): void {
    const dialogRef = this.dialog.open(JobsiteDialogComponent, {
      width: '500px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: false,
      autoFocus: true,
      panelClass: 'jobsite-dialog-container',
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

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.companyId) {
        this._store.dispatch(
          updateJobsite({
            companyId: this.companyId,
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

        this.actions$.pipe(
          ofType(updateJobsiteSuccess, updateJobsiteFailure),
          takeUntil(this.destroy$)
        ).subscribe(action => {
          if (action.type === updateJobsiteSuccess.type) {
            this.notificationService.success('Jobsite updated successfully!');
            this.loadJobsitesList();
          } else {
            this.notificationService.error('Failed to update jobsite. Please try again.');
          }
        });
      }
    });
  }

  private onDelete(jobsite: Jobsite): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '420px',
      maxWidth: '95vw',
      panelClass: 'confirmation-dialog-panel',
      data: {
        title: 'Delete Jobsite',
        message: `Are you sure you want to delete <strong>${jobsite.name}</strong>? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed && this.companyId) {
        this._store.dispatch(deleteJobsite({ companyId: this.companyId, jobsiteId: jobsite.id }));
        this.notificationService.success('Jobsite deleted successfully!');
      }
    });
  }

  onAddJobsite(): void {
    const dialogRef = this.dialog.open(JobsiteDialogComponent, {
      width: '500px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: false,
      autoFocus: true,
      panelClass: 'jobsite-dialog-container',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.companyId) {
        // Dispatch create jobsite action
        this._store.dispatch(
          createJobsite({
            companyId: this.companyId,
            jobsite: result
          })
        );

        // Show success notification
         this.notificationService.success('Jobsite added successfully!');
      }
    });
  }

  handlePageChange = (page: number): void => {
    this.currentPageNumber = page;
    this.loadJobsitesList();
  };

  handlePageSizeChange = (size: number): void => {
    this.currentPageSize = size;
    this.currentPageNumber = 0; // Reset to first page when page size changes
    this.loadJobsitesList();
  };

  handleSearchChange = (query: string): void => {
    this.searchQuery = query;
    this.currentPageNumber = 0; // Reset to first page when searching
    this.loadJobsitesList();
  };

  private loadJobsitesList(): void {
    if (!this.companyId) return;

    this._store.dispatch(
      loadJobsites({
        companyId: this.companyId,
        page: this.currentPageNumber,
        size: this.currentPageSize,
        search: this.searchQuery || undefined
      })
    );
  }
}

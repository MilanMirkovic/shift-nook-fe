import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, filter } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Actions, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';

import { DataTableColumn, DataTableAction } from '../../layout/data-table/data-table.component';
import {
  selectJobsites,
  selectTotal,
  selectLoading
} from '../../store/jobsites/jobsites.selectors';
import { loadJobsites, updatePage, createJobsite, createJobsiteSuccess } from '../../store/jobsites/jobsites.actions';
import { Jobsite } from '../../store/jobsites/jobsites.models';
import { selectSelectedCompanyId, selectCurrentCompany } from '../../store/user/user.selectors';
import { loadUser } from '../../store/user/user.actions';
import { CompanyRole } from '../../shared/models/company-role';
import { JobsiteDialogComponent } from '../../shared/components/jobsite-dialog/jobsite-dialog.component';
import { NotificationService } from '../../shared/services/notification.service';

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
      width: '150px',
      format: (value) => (value as string) || '(No client)'
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
      icon: 'edit',
      label: 'Edit',
      color: 'primary',
      handler: (jobsite) => this.onEdit(jobsite),
      visible: () => this.isOwner
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
    // Load user if not already loaded
    this._store.dispatch(loadUser());

    // Check if user is owner or accountant
    this.currentCompany$
      .pipe(takeUntil(this.destroy$))
      .subscribe(company => {
        this.isOwner = company?.role === CompanyRole.OWNER;
        this.canManageJobsites = company?.role === CompanyRole.OWNER || company?.role === CompanyRole.ACCOUNTANT;
      });

    // Wait for company ID to be available, then load jobsites
    this.selectedCompanyId$
      .pipe(
        filter(id => id !== null),
        takeUntil(this.destroy$)
      )
      .subscribe(companyId => {
        this.companyId = companyId;
        this.loadJobsitesList();
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
    console.log('Edit jobsite:', jobsite);
    // TODO: Implement edit functionality
  }

  private onDelete(jobsite: Jobsite): void {
    console.log('Delete jobsite:', jobsite);
    // TODO: Implement delete functionality (with confirmation dialog)
  }

  onAddJobsite(): void {
    const dialogRef = this.dialog.open(JobsiteDialogComponent, {
      width: '500px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: false,
      autoFocus: true,
      panelClass: 'jobsite-dialog-container',
      position: {
        top: '15%'
      }
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

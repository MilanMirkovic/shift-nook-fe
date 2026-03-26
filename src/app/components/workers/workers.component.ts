import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, filter } from 'rxjs';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { DataTableColumn, DataTableAction } from '../../layout/data-table/data-table.component';
import { CompanyRole } from '../../shared/models/company-role';
import { InviteWorkerDialogComponent } from '../../shared/components/invite-worker-dialog/invite-worker-dialog.component';
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { NotificationService } from '../../shared/services/notification.service';

import {
  selectMembers,
  selectTotal,
  selectLoading
} from '../../store/company-members/company-members.selectors';
import {
  loadMembers,
  updateFilters,
  updatePage,
  removeMember
} from '../../store/company-members/company-members.actions';
import { CompanyMember } from '../../store/company-members/company-members.models';
import { selectSelectedCompanyId } from '../../store/user/user.selectors';
import { loadUser } from '../../store/user/user.actions';


@Component({
  selector: 'app-workers',
  standalone: false,
  templateUrl: './workers.component.html',
  styleUrl: './workers.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkersComponent implements OnInit, OnDestroy {
  private readonly _store = inject(Store);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly notificationService = inject(NotificationService);
  private readonly destroy$ = new Subject<void>();

  readonly selectedCompanyId$ = this._store.select(selectSelectedCompanyId);
  readonly members$ = this._store.select(selectMembers);
  readonly total$ = this._store.select(selectTotal);
  readonly loading$ = this._store.select(selectLoading);

  private companyId: string | null = null;
  private currentQuery: string | null = null;

  protected readonly columns: DataTableColumn<CompanyMember>[] = [
    { id: 'firstName', header: 'First name', field: 'firstName', searchable: true },
    { id: 'lastName', header: 'Last name', field: 'lastName', searchable: true },
    { id: 'email', header: 'Email', field: 'email', searchable: true },
    { id: 'role', header: 'Role', field: 'role', searchable: true, width: '140px' }
  ];

  protected readonly actions: DataTableAction<CompanyMember>[] = [
    {
      icon: 'visibility',
      label: 'View Details',
      color: 'primary',
      handler: (worker) => this.onViewDetails(worker)
    },
    {
      icon: 'delete',
      label: 'Delete Worker',
      color: 'warn',
      handler: (worker) => this.onDeleteWorker(worker)
    }
  ];

  /** Called by the table's built-in search input (server-side search). */
  onQueryChange = (q: string) => {
    const query = q?.trim() || '';
    this.currentQuery = query ? query : null;

    this._store.dispatch(updateFilters({ role: CompanyRole.WORKER, q: this.currentQuery }));

    if (this.companyId) {
      this._store.dispatch(
        loadMembers({
          companyId: this.companyId,
          page: 0,
          size: 20,
          role: CompanyRole.WORKER,
          q: this.currentQuery
        })
      );
    }
  };

  ngOnInit(): void {
    // Load user if not already loaded
    this._store.dispatch(loadUser());

    // Wait for company ID to be available, then load members
    this.selectedCompanyId$
      .pipe(
        filter(id => id !== null),
        takeUntil(this.destroy$)
      )
      .subscribe(companyId => {
        this.companyId = companyId;

        // Initial load (always WORKER)
        this._store.dispatch(updateFilters({ role: CompanyRole.WORKER, q: null }));
        this._store.dispatch(
          loadMembers({
            companyId: companyId,
            page: 0,
            size: 20,
            role: CompanyRole.WORKER,
            q: null
          })
        );
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
      loadMembers({
        companyId: this.companyId,
        page,
        size,
        role: CompanyRole.WORKER,
        q: this.currentQuery
      })
    );
  }

  protected onViewDetails(worker: CompanyMember): void {
    this.router.navigate(['/workers', worker.userId]);
  }

  protected onDeleteWorker(worker: CompanyMember): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '420px',
      maxWidth: '95vw',
      panelClass: 'confirmation-dialog-panel',
      data: {
        title: 'Delete Worker',
        message: `Are you sure you want to remove <strong>${worker.firstName} ${worker.lastName}</strong>? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed && this.companyId) {
        this._store.dispatch(removeMember({ companyId: this.companyId, userId: worker.userId }));
        this.notificationService.success('Worker removed successfully!');
      }
    });
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

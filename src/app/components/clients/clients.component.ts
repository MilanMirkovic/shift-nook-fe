import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, filter } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { DataTableColumn, DataTableAction } from '../../layout/data-table/data-table.component';
import {
  selectClients,
  selectTotal,
  selectLoading
} from '../../store/clients/clients.selectors';
import { loadClients, updatePage, createClient } from '../../store/clients/clients.actions';
import { Client } from '../../store/clients/clients.models';
import { selectSelectedCompanyId, selectCurrentCompany } from '../../store/user/user.selectors';
import { loadUser } from '../../store/user/user.actions';
import { CompanyRole } from '../../shared/models/company-role';
import { ClientDialogComponent } from '../../shared/components/client-dialog/client-dialog.component';
import { NotificationService } from '../../shared/services/notification.service';

@Component({
  selector: 'app-clients',
  standalone: false,
  templateUrl: './clients.component.html',
  styleUrl: './clients.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClientsComponent implements OnInit, OnDestroy {
  private readonly _store = inject(Store);
  private readonly dialog = inject(MatDialog);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  readonly selectedCompanyId$ = this._store.select(selectSelectedCompanyId);
  readonly currentCompany$ = this._store.select(selectCurrentCompany);
  readonly clients$ = this._store.select(selectClients);
  readonly total$ = this._store.select(selectTotal);
  readonly loading$ = this._store.select(selectLoading);

  private companyId: string | null = null;
  private isOwner = false;

  protected readonly columns: DataTableColumn<Client>[] = [
    { id: 'name', header: 'Name', field: 'name', searchable: true },
    { id: 'email', header: 'Email', field: 'email', searchable: true },
    { id: 'phone', header: 'Phone', field: 'phone', searchable: true, width: '180px' },
    {
      id: 'createdAt',
      header: 'Created',
      field: 'createdAt' as keyof Client,
      width: '150px',
      format: (value) => this.formatDate(value as string)
    }
  ];
  protected readonly displayedColumns: string[] =
    this.columns.map(c => c.id);


  private formatDate(dateString: string): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();

    return `${month}/${day}/${year}`;
  }

  protected readonly actions: DataTableAction<Client>[] = [
    {
      icon: 'visibility',
      label: 'View Details',
      color: 'primary',
      handler: (client) => this.onClientClick(client)
    },
    {
      icon: 'edit',
      label: 'Edit',
      color: 'primary',
      handler: (client) => this.onEdit(client),
      visible: () => this.isOwner
    },
    {
      icon: 'delete',
      label: 'Delete',
      color: 'warn',
      handler: (client) => this.onDelete(client),
      visible: () => this.isOwner
    }
  ];

  ngOnInit(): void {
    // Load user if not already loaded
    this._store.dispatch(loadUser());

    // Check if user is owner
    this.currentCompany$
      .pipe(takeUntil(this.destroy$))
      .subscribe(company => {
        this.isOwner = company?.role === CompanyRole.OWNER;
      });

    // Wait for company ID to be available, then load clients
    this.selectedCompanyId$
      .pipe(
        filter(id => id !== null),
        takeUntil(this.destroy$)
      )
      .subscribe(companyId => {
        this.companyId = companyId;

        // Initial load
        this._store.dispatch(
          loadClients({
            companyId: companyId,
            page: 0,
            size: 20
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
      loadClients({
        companyId: this.companyId,
        page,
        size
      })
    );
  }

  private onEdit(client: Client): void {
    console.log('Edit client:', client);
    // TODO: Implement edit functionality
  }

  private onDelete(client: Client): void {
    console.log('Delete client:', client);
    // TODO: Implement delete functionality (with confirmation dialog)
  }

  onAddClient(): void {
    const dialogRef = this.dialog.open(ClientDialogComponent, {
      width: '500px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: false,
      autoFocus: true,
      panelClass: 'client-dialog-container',
      position: {
       top: '15%'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.companyId) {
        // Dispatch create client action
        this._store.dispatch(
          createClient({
            companyId: this.companyId,
            client: result
          })
        );

        // Show success notification
        this.notificationService.success('Client added successfully!');
      }
    });
  }

  onClientClick(client: Client): void {
    console.log('Navigate to client details:', client);
    this.router.navigate(['/clients', client.id]);
  }
}

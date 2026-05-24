import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subject, combineLatest } from 'rxjs';
import { filter, take, shareReplay, tap, map, catchError } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { loadClientById } from '../../../store/clients/clients.actions';
import { selectClientById } from '../../../store/clients/clients.selectors';
import { selectSelectedCompanyId } from '../../../store/user/user.selectors';
import { Client } from '../../../store/clients/clients.models';
import { AsyncPipe, CurrencyPipe, DatePipe, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { ClientEstimatesComponent } from './client-estimates/client-estimates.component';
import { ClientJobsitesComponent } from './client-jobsites/client-jobsites.component';
import { ClientActivityComponent } from './client-activity/client-activity.component';
import { ClientInvoicesComponent } from './client-invoices/client-invoices.component';
import { ClientDetailsInfoComponent } from './client-details-info/client-details-info.component';
import { EditClientDialogComponent, EditClientDialogData } from './edit-client-dialog/edit-client-dialog.component';
import { ClientDetailsNavigationService } from './client-details-navigation.service';
import { takeUntil } from 'rxjs/operators';
import { selectInvoicesByClientId } from '../../../store/invoices/invoices.selectors';
import { loadInvoices } from '../../../store/invoices/invoices.actions';
import { QBCustomerMappingsApiService } from '../../../store/quickbooks-customer-mappings/qb-customer-mappings.api';
import { QuickBooksCustomer, QuickBooksCustomerMapping } from '../../../store/quickbooks-customer-mappings/qb-customer-mappings.models';
import { QBSyncConfirmationDialogComponent, QBSyncConfirmationDialogData, QBSyncConfirmationDialogResult } from './qb-sync-confirmation-dialog/qb-sync-confirmation-dialog.component';
import { of } from 'rxjs';

interface ClientFinancialStats {
  outstandingBalance: number;
  overdueAmount: number;
  totalPaid: number;
}

@Component({
  selector: 'app-client-details',
  standalone: true,
  templateUrl: './client-details.component.html',
  providers: [ClientDetailsNavigationService],
  imports: [
    AsyncPipe,
    CurrencyPipe,
    DatePipe,
    NgIf,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    RouterLink,
    ClientEstimatesComponent,
    ClientJobsitesComponent,
    ClientActivityComponent,
    ClientInvoicesComponent,
    ClientDetailsInfoComponent,
  ],
  styleUrls: ['./client-details.component.scss']
})
export class ClientDetailsComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private readonly navigationService = inject(ClientDetailsNavigationService);
  private readonly qbMappingsApi = inject(QBCustomerMappingsApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroy$ = new Subject<void>();

  private readonly clientSubject$ = new BehaviorSubject<Client | null>(null);
  client$: Observable<Client | null> = this.clientSubject$.asObservable();

  protected currentClientId: string | null = null;
  protected currentCompanyId: string | null = null;
  protected selectedTabIndex = 0;
  protected financialStats$!: Observable<ClientFinancialStats>;
  protected qbMapping: QuickBooksCustomerMapping | null = null;
  protected qbMappingLoading = false;
  protected qbSyncInProgress = false;

  ngOnInit(): void {
    const clientId = this.route.snapshot.paramMap.get('id');
    if (!clientId) return;

    this.currentClientId = clientId;

    this.store.select(selectClientById(clientId)).pipe(
      filter(client => client !== null),
      tap(client => this.clientSubject$.next(client)),
      shareReplay({ bufferSize: 1, refCount: true })
    ).subscribe();

    this.store
      .select(selectSelectedCompanyId)
      .pipe(
        filter((id): id is string => !!id),
        take(1)
      )
      .subscribe((companyId) => {
        this.currentCompanyId = companyId;
        this.store.dispatch(loadClientById({ companyId, clientId }));
        this.store.dispatch(loadInvoices({ companyId, clientId, page: 0, size: 1000 }));

        // Check if client is already mapped to QuickBooks
        this.loadQuickBooksMapping(companyId, clientId);
      });

    // Calculate financial statistics from invoices
    this.financialStats$ = this.store.select(selectInvoicesByClientId(clientId)).pipe(
      map(invoices => {
        const now = new Date();
        const outstandingBalance = invoices
          .filter(inv => inv.status !== 'PAID' && inv.status !== 'VOID')
          .reduce((sum, inv) => sum + inv.remainingAmount, 0);

        const overdueAmount = invoices
          .filter(inv => (inv.status === 'ISSUED' || inv.status === 'PARTIALLY_PAID') && inv.dueAt && new Date(inv.dueAt) < now)
          .reduce((sum, inv) => sum + inv.remainingAmount, 0);

        const totalPaid = invoices
          .reduce((sum, inv) => sum + inv.paidAmount, 0);

        return {
          outstandingBalance,
          overdueAmount,
          totalPaid,
        };
      })
    );

    // Subscribe to tab navigation from child components
    this.navigationService.selectedTabIndex$
      .pipe(takeUntil(this.destroy$))
      .subscribe(index => {
        this.selectedTabIndex = index;
      });
  }

  protected onTabChange(index: number): void {
    this.navigationService.setTabIndex(index);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected getClientInitials(client: Client | null): string {
    if (!client) return 'C';
    const nameParts = client.name.trim().split(' ');
    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    }
    return client.name.substring(0, 2).toUpperCase();
  }

  protected formatPhone(phone: string | undefined): string {
    if (!phone) return 'Not provided';
    return phone;
  }

  protected formatAddress(address: string | undefined): string {
    if (!address) return 'Not provided';
    return address;
  }

  onEditClient(client: Client): void {
    if (!this.currentCompanyId) return;
    this.dialog.open(EditClientDialogComponent, {
      width: '520px',
      maxWidth: '95vw',
      data: { client, companyId: this.currentCompanyId } satisfies EditClientDialogData,
      panelClass: 'sn-dialog',
    });
  }

  private loadQuickBooksMapping(companyId: string, clientId: string): void {
    this.qbMappingLoading = true;
    this.qbMappingsApi.getMappingForClient(companyId, clientId)
      .pipe(
        catchError((error) => {
          // If no mapping exists, API returns 404 - this is expected
          console.log('No QB mapping found for client:', clientId, error.status);
          return of(null);
        })
      )
      .subscribe(mapping => {
        console.log('QB Mapping status:', mapping ? 'Mapped' : 'Not mapped');
        this.qbMapping = mapping;
        this.qbMappingLoading = false;
      });
  }

  protected onSyncToQuickBooks(client: Client): void {
    if (!this.currentCompanyId || !client.id || this.qbSyncInProgress) return;

    // First, reload the mapping status to make sure we have the latest
    this.loadQuickBooksMapping(this.currentCompanyId, client.id);

    this.qbSyncInProgress = true;

    // Load all QuickBooks customers and search for matches by name
    this.qbMappingsApi.listQuickBooksCustomers(this.currentCompanyId)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          this.snackBar.open(
            'Failed to load QuickBooks customers. Please ensure QuickBooks is connected.',
            'Close',
            { duration: 5000 }
          );
          this.qbSyncInProgress = false;
          return of([]);
        })
      )
      .subscribe((customers: QuickBooksCustomer[]) => {
        console.log('=== QB Customer Matching Debug ===');
        console.log('Loaded QB customers:', customers.length);
        console.log('All customers:', customers.map(c => ({
          id: c.Id,
          display: c.DisplayName,
          company: c.CompanyName
        })));

        // Search for customers matching the client name (case-insensitive)
        const clientName = client.name.toLowerCase().trim();
        console.log('Looking for client:', `"${clientName}"`);

        const matches = customers.filter(customer => {
          const displayName = customer.DisplayName?.toLowerCase().trim();
          const companyName = customer.CompanyName?.toLowerCase().trim();

          console.log(`Checking: Display="${displayName}", Company="${companyName}"`);

          // Only match if strings are non-empty and actually contain each other
          if (!displayName) {
            console.log('  -> Skipped (no display name)');
            return false;
          }

          // Exact match on display name (highest priority)
          if (displayName === clientName) {
            console.log('  -> MATCH (exact display name)');
            return true;
          }

          // Exact match on company name
          if (companyName && companyName === clientName) {
            console.log('  -> MATCH (exact company name)');
            return true;
          }

          // Partial matches (if search term is meaningful length)
          if (clientName.length > 3) {
            if (displayName.includes(clientName)) {
              console.log('  -> MATCH (display contains client)');
              return true;
            }
            if (companyName && companyName.includes(clientName)) {
              console.log('  -> MATCH (company contains client)');
              return true;
            }
          }

          if (displayName.length > 3 && clientName.includes(displayName)) {
            console.log('  -> MATCH (client contains display)');
            return true;
          }
          if (companyName && companyName.length > 3 && clientName.includes(companyName)) {
            console.log('  -> MATCH (client contains company)');
            return true;
          }

          console.log('  -> No match');
          return false;
        });

        console.log('=== Matching Results ===');
        console.log('Found matches:', matches.length);
        console.log('Matched customers:', matches.map(m => ({
          id: m.Id,
          display: m.DisplayName,
          company: m.CompanyName
        })));

        if (matches.length === 0) {
          this.snackBar.open(
            `No QuickBooks customer found matching "${client.name}". Please create the mapping manually in Settings.`,
            'Go to Settings',
            { duration: 8000 }
          ).onAction().subscribe(() => {
            window.location.href = '/settings/quickbooks-customer-mappings';
          });
          this.qbSyncInProgress = false;
          return;
        }

        // Show confirmation dialog with matches
        const dialogRef = this.dialog.open(QBSyncConfirmationDialogComponent, {
          width: '600px',
          maxWidth: '95vw',
          panelClass: 'centered-dialog',
          data: {
            clientName: client.name,
            matches: matches
          } satisfies QBSyncConfirmationDialogData,
        });

        dialogRef.afterClosed().subscribe((result: QBSyncConfirmationDialogResult | undefined) => {
          if (result?.confirmed && result.selectedCustomer && this.currentCompanyId && client.id) {
            // Create the mapping
            this.qbMappingsApi.createMapping(this.currentCompanyId, {
              clientId: client.id,
              quickbooksCustomerId: result.selectedCustomer.Id,
              quickbooksCustomerName: result.selectedCustomer.DisplayName,
              quickbooksDisplayName: result.selectedCustomer.DisplayName
            }).pipe(
              takeUntil(this.destroy$)
            ).subscribe({
              next: (mapping) => {
                this.qbMapping = mapping;
                this.snackBar.open(
                  `Successfully linked ${client.name} to QuickBooks customer ${result.selectedCustomer!.DisplayName}`,
                  'Close',
                  { duration: 5000 }
                );
                this.qbSyncInProgress = false;
              },
              error: (error) => {
                this.snackBar.open(
                  `Failed to create mapping: ${error.error?.message || 'Unknown error'}`,
                  'Close',
                  { duration: 5000 }
                );
                this.qbSyncInProgress = false;
              }
            });
          } else {
            this.qbSyncInProgress = false;
          }
        });
      });
  }

  protected get isQuickBooksSynced(): boolean {
    return this.qbMapping !== null;
  }
}

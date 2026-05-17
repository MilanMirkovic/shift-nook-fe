import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Router } from '@angular/router';

import { selectSelectedCompanyId, selectUserCompanies, selectCurrentCompany } from '../../store/user/user.selectors';
import { environment } from '../../../environments/environment';
import { CompanyRole } from '../../shared/models/company-role';

interface WorkSession {
  id: string;
  companyId: string;
  companyName: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  description?: string;
  invoiceId?: string;
  invoicedAt?: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName?: string;
  title: string;
  totalAmount: number;
  issuedAt: string;
  dueAt: string;
  status: string;
  invoiceType: string;
  quickbooksSyncStatus?: string;
  quickbooksDocNumber?: string;
}

interface QuickBooksSyncStatus {
  syncStatus: string;
  quickbooksDocNumber?: string;
  syncErrorMessage?: string;
  canRetry: boolean;
}

@Component({
  selector: 'app-my-billing',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatTabsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule
  ],
  templateUrl: './my-billing.component.html',
  styleUrl: './my-billing.component.scss'
})
export class MyBillingComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly store = inject(Store);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  readonly selectedCompanyId$ = this.store.select(selectSelectedCompanyId); // Company we're billing
  readonly currentCompany$ = this.store.select(selectCurrentCompany); // Full company info
  readonly userCompanies$ = this.store.select(selectUserCompanies); // All user's companies

  selectedTabIndex = 0;
  clientCompanyId: string | null = null; // The company we're billing (selected company)
  clientCompanyName: string = '';
  myAccountingFirmId: string | null = null; // Accountant's own firm
  fromDate: Date;
  toDate: Date;

  workSessions: WorkSession[] = [];
  selectedSessions: Set<string> = new Set();
  hourlyRate: number = 75.00;
  loading = false;

  invoices: Invoice[] = [];
  loadingInvoices = false;
  syncingInvoices = new Set<string>(); // Track which invoices are being synced

  constructor() {
    // Default to last 3 months
    const now = new Date();
    this.toDate = now;
    this.fromDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
  }

  ngOnInit(): void {
    // Get the selected company (the client we're billing)
    this.selectedCompanyId$.pipe(take(1)).subscribe(id => {
      this.clientCompanyId = id;
    });

    // Get selected company info for display
    this.currentCompany$.pipe(take(1)).subscribe(company => {
      if (company) {
        this.clientCompanyName = company.companyName;
      }
    });

    // Find accountant's own firm (where they are ACCOUNTING_MANAGER)
    this.userCompanies$.pipe(take(1)).subscribe(companies => {
      const accountingFirm = companies.find(c =>
        c.role === CompanyRole.ACCOUNTING_MANAGER || c.role === CompanyRole.ACCOUNTANT
      );

      if (accountingFirm) {
        this.myAccountingFirmId = accountingFirm.companyId;
      }
    });

    // Load work sessions for the selected company
    this.loadWorkSessions();

    // Load invoices
    this.loadInvoices();
  }

  onDateChange(): void {
    if (this.clientCompanyId) {
      this.loadWorkSessions();
    }
  }

  loadWorkSessions(): void {
    if (!this.clientCompanyId) {
      this.workSessions = [];
      return;
    }

    this.loading = true;

    this.http.get<WorkSession[]>(`${environment.apiBaseUrl}/company-work-sessions/for-billing`, {
      params: {
        from: this.fromDate.toISOString(),
        to: this.toDate.toISOString()
      }
    }).subscribe({
      next: (sessions) => {
        // Filter to the company we're billing (selected company)
        this.workSessions = sessions
          .filter(s => s.companyId === this.clientCompanyId)
          .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load work sessions', err);
        this.snackBar.open('Failed to load work sessions', 'Close', { duration: 5000 });
        this.loading = false;
      }
    });
  }

  loadInvoices(): void {
    if (!this.myAccountingFirmId) return;

    this.loadingInvoices = true;

    // Load invoices from work sessions for this accountant
    this.http.get<any>(`${environment.apiBaseUrl}/companies/${this.myAccountingFirmId}/invoices`, {
      params: {
        size: '100' // Get up to 100 invoices
      }
    }).subscribe({
      next: (response) => {
        // Backend returns paginated response, extract content array
        const allInvoices = response.content || [];

        // Filter to only show invoices created from work sessions
        this.invoices = allInvoices
          .filter((inv: Invoice) => inv.invoiceType === 'FROM_WORK_SESSIONS')
          .sort((a: Invoice, b: Invoice) =>
            new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
          );

        // Load sync status for each invoice
        this.invoices.forEach(invoice => this.loadSyncStatus(invoice));

        this.loadingInvoices = false;
      },
      error: (err) => {
        console.error('Failed to load invoices', err);
        // Don't show error snackbar, just log it
        this.loadingInvoices = false;
      }
    });
  }

  toggleSession(sessionId: string): void {
    if (this.selectedSessions.has(sessionId)) {
      this.selectedSessions.delete(sessionId);
    } else {
      this.selectedSessions.add(sessionId);
    }
  }

  isSelected(sessionId: string): boolean {
    return this.selectedSessions.has(sessionId);
  }

  getSelectedSessions(): string[] {
    return this.workSessions
      .filter(s => this.selectedSessions.has(s.id) && !s.invoiceId)
      .map(s => s.id);
  }

  getUnbilledSessions(): WorkSession[] {
    return this.workSessions.filter(s => !s.invoiceId);
  }

  selectAllUnbilled(): void {
    this.getUnbilledSessions().forEach(session => {
      this.selectedSessions.add(session.id);
    });
  }

  clearSelection(): void {
    this.selectedSessions.clear();
  }

  getTotalHours(): number {
    const totalMinutes = this.workSessions.reduce((sum, s) => sum + s.durationMinutes, 0);
    return totalMinutes / 60;
  }

  getUnbilledHours(): number {
    const unbilledMinutes = this.workSessions
      .filter(s => !s.invoiceId)
      .reduce((sum, s) => sum + s.durationMinutes, 0);
    return unbilledMinutes / 60;
  }

  calculateSelectedHours(): number {
    const selectedMinutes = this.workSessions
      .filter(s => this.selectedSessions.has(s.id))
      .reduce((sum, s) => sum + s.durationMinutes, 0);
    return selectedMinutes / 60;
  }

  calculateSelectedAmount(): number {
    return this.calculateSelectedHours() * this.hourlyRate;
  }

  createInvoice(): void {
    const selectedIds = this.getSelectedSessions();

    if (selectedIds.length === 0) {
      this.snackBar.open('Please select at least one work session', 'Close', { duration: 3000 });
      return;
    }

    if (!this.hourlyRate || this.hourlyRate <= 0) {
      this.snackBar.open('Please enter a valid hourly rate', 'Close', { duration: 3000 });
      return;
    }

    if (!this.myAccountingFirmId) {
      this.snackBar.open('Accounting firm not found. Please ensure you have an accounting company set up.', 'Close', { duration: 5000 });
      return;
    }

    if (!this.clientCompanyId) {
      this.snackBar.open('No company selected to bill', 'Close', { duration: 3000 });
      return;
    }

    this.loading = true;

    const request = {
      clientId: this.clientCompanyId, // The company we worked for (currently selected company)
      workSessionIds: selectedIds,
      hourlyRate: this.hourlyRate,
      title: `Accounting Services - ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
      notes: 'Thank you for your business'
    };

    // Use accountant's firm ID in the URL
    this.http.post<any>(
      `${environment.apiBaseUrl}/companies/${this.myAccountingFirmId}/invoices/from-work-sessions`,
      request
    ).subscribe({
      next: (invoice) => {
        this.snackBar.open(`Invoice #${invoice.invoiceNumber} created successfully!`, 'View', {
          duration: 7000
        }).onAction().subscribe(() => {
          // Navigate to invoice details
          this.router.navigate(['/invoices', invoice.id]);
        });

        // Clear selections
        selectedIds.forEach(id => this.selectedSessions.delete(id));

        // Reload work sessions and invoices
        this.loadWorkSessions();
        this.loadInvoices();

        // Switch to invoices tab
        this.selectedTabIndex = 1;

        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to create invoice', err);
        this.snackBar.open(
          err.error?.message || 'Failed to create invoice',
          'Close',
          { duration: 7000 }
        );
        this.loading = false;
      }
    });
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  viewInvoice(invoice: Invoice): void {
    // Navigate to the client's detail page where the invoice can be viewed
    this.router.navigate(['/clients', invoice.clientId]);
  }

  syncToQuickBooks(invoice: Invoice): void {
    if (!this.myAccountingFirmId || this.syncingInvoices.has(invoice.id)) {
      return;
    }

    this.syncingInvoices.add(invoice.id);

    this.http.post<QuickBooksSyncStatus>(
      `${environment.apiBaseUrl}/companies/${this.myAccountingFirmId}/quickbooks/invoices/${invoice.id}/sync`,
      {}
    ).subscribe({
      next: (syncStatus) => {
        this.snackBar.open(
          `Invoice #${invoice.invoiceNumber} synced to QuickBooks successfully!`,
          'Close',
          { duration: 5000 }
        );

        // Update invoice with sync status
        invoice.quickbooksSyncStatus = syncStatus.syncStatus;
        invoice.quickbooksDocNumber = syncStatus.quickbooksDocNumber;

        this.syncingInvoices.delete(invoice.id);
      },
      error: (err) => {
        console.error('Failed to sync invoice to QuickBooks', err);

        // Extract error message from various possible locations
        let message = 'Failed to sync to QuickBooks';

        if (err.error?.message) {
          // Spring Boot error response
          message = err.error.message;

          // Clean up "Failed to sync invoice to QuickBooks: " prefix if present
          if (message.startsWith('Failed to sync invoice to QuickBooks: ')) {
            message = message.substring('Failed to sync invoice to QuickBooks: '.length);
          }
        } else if (err.error?.syncErrorMessage) {
          message = err.error.syncErrorMessage;
        } else if (err.message) {
          message = err.message;
        }

        this.snackBar.open(message, 'Close', { duration: 10000 });
        this.syncingInvoices.delete(invoice.id);
      }
    });
  }

  isSyncing(invoiceId: string): boolean {
    return this.syncingInvoices.has(invoiceId);
  }

  isSynced(invoice: Invoice): boolean {
    return invoice.quickbooksSyncStatus === 'SYNCED';
  }

  canSync(invoice: Invoice): boolean {
    return !this.isSynced(invoice) && !this.isSyncing(invoice.id);
  }

  loadSyncStatus(invoice: Invoice): void {
    if (!this.myAccountingFirmId) return;

    this.http.get<QuickBooksSyncStatus>(
      `${environment.apiBaseUrl}/companies/${this.myAccountingFirmId}/quickbooks/invoices/${invoice.id}/sync-status`
    ).subscribe({
      next: (syncStatus) => {
        invoice.quickbooksSyncStatus = syncStatus.syncStatus;
        invoice.quickbooksDocNumber = syncStatus.quickbooksDocNumber;
      },
      error: () => {
        // Sync status not found - invoice not synced yet
        invoice.quickbooksSyncStatus = undefined;
      }
    });
  }
}

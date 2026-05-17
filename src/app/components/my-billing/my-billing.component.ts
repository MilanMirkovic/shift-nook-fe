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

import { selectSelectedCompanyId, selectUserCompanies } from '../../store/user/user.selectors';
import { environment } from '../../../environments/environment';

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

interface CompanyOption {
  companyId: string;
  companyName: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  title: string;
  total: number;
  issuedAt: string;
  dueAt: string;
  status: string;
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

  readonly myCompanyId$ = this.store.select(selectSelectedCompanyId);

  selectedTabIndex = 0;
  availableCompanies: CompanyOption[] = [];
  selectedCompanyId: string | null = null;
  fromDate: Date;
  toDate: Date;

  workSessions: WorkSession[] = [];
  selectedSessions: Set<string> = new Set();
  hourlyRate: number = 75.00;
  loading = false;

  invoices: Invoice[] = [];
  loadingInvoices = false;

  myCompanyId: string | null = null;

  constructor() {
    // Default to last 3 months
    const now = new Date();
    this.toDate = now;
    this.fromDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
  }

  ngOnInit(): void {
    // Get my company ID (accountant's company)
    this.myCompanyId$.pipe(take(1)).subscribe(id => {
      this.myCompanyId = id;
    });

    // Load companies I've worked for
    this.loadAvailableCompanies();

    // Load invoices
    this.loadInvoices();
  }

  loadAvailableCompanies(): void {
    // Fetch work sessions to get unique companies
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

    this.http.get<WorkSession[]>(`${environment.apiBaseUrl}/company-work-sessions/for-billing`, {
      params: {
        from: threeYearsAgo.toISOString(),
        to: new Date().toISOString()
      }
    }).subscribe({
      next: (sessions) => {
        // Get unique companies
        const companiesMap = new Map<string, string>();
        sessions.forEach(session => {
          companiesMap.set(session.companyId, session.companyName);
        });

        this.availableCompanies = Array.from(companiesMap.entries())
          .map(([companyId, companyName]) => ({ companyId, companyName }))
          .sort((a, b) => a.companyName.localeCompare(b.companyName));
      },
      error: (err) => {
        console.error('Failed to load companies', err);
        this.snackBar.open('Failed to load companies', 'Close', { duration: 5000 });
      }
    });
  }

  onCompanyChange(): void {
    this.selectedSessions.clear();
    this.loadWorkSessions();
  }

  onDateChange(): void {
    if (this.selectedCompanyId) {
      this.loadWorkSessions();
    }
  }

  loadWorkSessions(): void {
    if (!this.selectedCompanyId) {
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
        // Filter to selected company only
        this.workSessions = sessions
          .filter(s => s.companyId === this.selectedCompanyId)
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
    if (!this.myCompanyId) return;

    this.loadingInvoices = true;

    // Load invoices from work sessions for this accountant
    this.http.get<Invoice[]>(`${environment.apiBaseUrl}/companies/${this.myCompanyId}/invoices`, {
      params: {
        type: 'FROM_WORK_SESSIONS'
      }
    }).subscribe({
      next: (invoices) => {
        this.invoices = invoices.sort((a, b) =>
          new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
        );
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

    if (!this.myCompanyId) {
      this.snackBar.open('Company ID not found', 'Close', { duration: 3000 });
      return;
    }

    if (!this.selectedCompanyId) {
      this.snackBar.open('Please select a company', 'Close', { duration: 3000 });
      return;
    }

    this.loading = true;

    const request = {
      clientId: this.selectedCompanyId, // The company we worked for (client)
      workSessionIds: selectedIds,
      hourlyRate: this.hourlyRate,
      title: `Accounting Services - ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
      notes: 'Thank you for your business'
    };

    // Use MY company ID (accountant's company) in the URL
    this.http.post<any>(
      `${environment.apiBaseUrl}/companies/${this.myCompanyId}/invoices/from-work-sessions`,
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

  viewInvoice(invoiceId: string): void {
    this.router.navigate(['/invoices', invoiceId]);
  }
}

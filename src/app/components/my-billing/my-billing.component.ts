import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { selectSelectedCompanyId } from '../../store/user/user.selectors';
import { environment } from '../../../environments/environment';

interface WorkSession {
  id: string;
  companyId: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  description?: string;
  invoiceId?: string;
}

interface CompanyWorkStats {
  companyId: string;
  companyName: string;
  totalHours: number;
  unbilledHours: number;
  sessions: WorkSession[];
}

@Component({
  selector: 'app-my-billing',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
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

  readonly selectedCompanyId$ = this.store.select(selectSelectedCompanyId);

  workStats: CompanyWorkStats[] = [];
  selectedSessions: Set<string> = new Set();
  hourlyRate: number = 75.00;
  loading = false;

  displayedColumns = ['select', 'date', 'duration', 'description', 'status'];

  ngOnInit(): void {
    this.loadWorkSessions();
  }

  loadWorkSessions(): void {
    this.loading = true;
    // For now, load monthly statistics - in production this would be more sophisticated
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;

    this.http.get<any>(`${environment.apiBaseUrl}/company-work-sessions/statistics/monthly`, {
      params: { year: year.toString(), month: month.toString() }
    }).subscribe({
      next: (response) => {
        // Transform the response to group sessions by company
        this.workStats = response.companySessions || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load work sessions', err);
        this.snackBar.open('Failed to load work sessions', 'Close', { duration: 5000 });
        this.loading = false;
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

  getSelectedSessionsForCompany(companyId: string): string[] {
    const companySessions = this.workStats.find(s => s.companyId === companyId)?.sessions || [];
    return companySessions
      .filter(s => this.selectedSessions.has(s.id))
      .map(s => s.id);
  }

  createInvoice(stats: CompanyWorkStats): void {
    const selectedIds = this.getSelectedSessionsForCompany(stats.companyId);

    if (selectedIds.length === 0) {
      this.snackBar.open('Please select at least one work session', 'Close', { duration: 3000 });
      return;
    }

    if (!this.hourlyRate || this.hourlyRate <= 0) {
      this.snackBar.open('Please enter a valid hourly rate', 'Close', { duration: 3000 });
      return;
    }

    this.loading = true;

    // Get the current user's company ID (the accountant's company)
    this.selectedCompanyId$.subscribe(myCompanyId => {
      if (!myCompanyId) {
        this.snackBar.open('Please select a company', 'Close', { duration: 3000 });
        this.loading = false;
        return;
      }

      const request = {
        clientId: stats.companyId, // The company we worked for
        workSessionIds: selectedIds,
        hourlyRate: this.hourlyRate,
        title: `Accounting Services - ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
        notes: 'Thank you for your business'
      };

      this.http.post<any>(
        `${environment.apiBaseUrl}/companies/${myCompanyId}/invoices/from-work-sessions`,
        request
      ).subscribe({
        next: (invoice) => {
          this.snackBar.open(`Invoice #${invoice.invoiceNumber} created successfully!`, 'View', {
            duration: 7000
          }).onAction().subscribe(() => {
            // Navigate to invoice details or sync to QuickBooks
            this.router.navigate(['/invoices', invoice.id]);
          });

          // Clear selections for this company
          selectedIds.forEach(id => this.selectedSessions.delete(id));

          // Reload work sessions
          this.loadWorkSessions();
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
    }).unsubscribe();
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

  calculateSelectedHours(companyId: string): number {
    const sessions = this.workStats.find(s => s.companyId === companyId)?.sessions || [];
    const selectedMinutes = sessions
      .filter(s => this.selectedSessions.has(s.id))
      .reduce((sum, s) => sum + s.durationMinutes, 0);
    return selectedMinutes / 60;
  }

  calculateSelectedAmount(companyId: string): number {
    return this.calculateSelectedHours(companyId) * this.hourlyRate;
  }
}

import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Subject, combineLatest, takeUntil } from 'rxjs';
import { map } from 'rxjs/operators';
import { Store } from '@ngrx/store';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { UserStoreService } from '../../store/user/user-store.service';
import { Invoice, InvoiceStatus } from '../../store/invoices/invoices.models';
import { Estimate, EstimateStatus } from '../../store/estimates/estimates.models';
import { selectInvoices } from '../../store/invoices/invoices.selectors';
import { selectEstimates } from '../../store/estimates/estimates.selectors';
import { loadInvoices } from '../../store/invoices/invoices.actions';
import { loadEstimates } from '../../store/estimates/estimates.actions';
import { PageLayoutComponent } from '../../layout/page-layout/page-layout.component';

interface FinancialStats {
  totalRevenue: number;
  paidInvoices: number;
  unpaidInvoices: number;
  overdueInvoices: number;
  draftInvoices: number;
  voidInvoices: number;
  totalInvoicesCount: number;
  totalEstimatesCount: number;
  acceptedEstimates: number;
  pendingEstimates: number;
  totalEstimatedValue: number;
  averageInvoiceAmount: number;
  averageEstimateAmount: number;
}

@Component({
  selector: 'app-financials',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    PageLayoutComponent,
  ],
  templateUrl: './financials.component.html',
  styleUrls: ['./financials.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinancialsComponent implements OnInit, OnDestroy {
  private readonly userStore = inject(UserStoreService);
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  private currentCompanyId: string | null = null;

  protected loading$ = combineLatest([
    this.store.select(selectInvoices),
    this.store.select(selectEstimates),
  ]).pipe(
    map(([invoices, estimates]) => invoices.length === 0 && estimates.length === 0),
    takeUntil(this.destroy$)
  );

  protected stats$ = combineLatest([
    this.store.select(selectInvoices),
    this.store.select(selectEstimates),
  ]).pipe(
    map(([invoices, estimates]) => this.calculateStats(invoices, estimates)),
    takeUntil(this.destroy$)
  );

  protected recentInvoices$ = this.store.select(selectInvoices).pipe(
    map(invoices =>
      [...invoices]
        .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime())
        .slice(0, 10)
    ),
    takeUntil(this.destroy$)
  );

  protected overdueInvoices$ = this.store.select(selectInvoices).pipe(
    map(invoices => {
      const now = new Date();
      return invoices
        .filter(inv => inv.status === 'ISSUED' && inv.dueAt && new Date(inv.dueAt) < now)
        .sort((a, b) => new Date(a.dueAt || 0).getTime() - new Date(b.dueAt || 0).getTime());
    }),
    takeUntil(this.destroy$)
  );

  ngOnInit(): void {
    this.userStore.selectedCompanyId$
      .pipe(takeUntil(this.destroy$))
      .subscribe(companyId => {
        if (companyId) {
          this.currentCompanyId = companyId;
          this.loadFinancialData(companyId);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadFinancialData(companyId: string): void {
    // Load all invoices (including received invoices from subcontractors) and estimates
    this.store.dispatch(loadInvoices({ companyId, page: 0, size: 1000, includeReceived: true }));
    this.store.dispatch(loadEstimates({ companyId, page: 0, size: 1000 }));
  }

  private calculateStats(invoices: Invoice[], estimates: Estimate[]): FinancialStats {
    const now = new Date();

    // Invoice stats
    const paidInvoices = invoices.filter(inv => inv.status === 'PAID');
    const unpaidInvoices = invoices.filter(inv => inv.status === 'ISSUED' || inv.status === 'PARTIALLY_PAID');
    const overdueInvoices = invoices.filter(inv => (inv.status === 'ISSUED' || inv.status === 'PARTIALLY_PAID') && inv.dueAt && new Date(inv.dueAt) < now);
    const draftInvoices = invoices.filter(inv => inv.status === 'DRAFT');
    const voidInvoices = invoices.filter(inv => inv.status === 'VOID');

    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalOutstanding = unpaidInvoices.reduce((sum, inv) => sum + inv.remainingAmount, 0);

    // Estimate stats
    const acceptedEstimates = estimates.filter(est => est.status === 'ACCEPTED');
    const sentEstimates = estimates.filter(est => est.status === 'SENT');
    const totalEstimatedValue = acceptedEstimates.reduce((sum, est) => sum + est.total, 0);

    // Average amounts
    const averageInvoiceAmount = invoices.length > 0
      ? invoices.reduce((sum, inv) => sum + inv.totalAmount, 0) / invoices.length
      : 0;
    const averageEstimateAmount = estimates.length > 0
      ? estimates.reduce((sum, est) => sum + est.total, 0) / estimates.length
      : 0;

    return {
      totalRevenue,
      paidInvoices: paidInvoices.length,
      unpaidInvoices: unpaidInvoices.length,
      overdueInvoices: overdueInvoices.length,
      draftInvoices: draftInvoices.length,
      voidInvoices: voidInvoices.length,
      totalInvoicesCount: invoices.length,
      totalEstimatesCount: estimates.length,
      acceptedEstimates: acceptedEstimates.length,
      pendingEstimates: sentEstimates.length,
      totalEstimatedValue,
      averageInvoiceAmount,
      averageEstimateAmount,
    };
  }

  protected getInvoiceStatusClass(status: InvoiceStatus): string {
    switch (status) {
      case 'PAID':           return 'status-badge--paid';
      case 'PARTIALLY_PAID': return 'status-badge--partially-paid';
      case 'ISSUED':         return 'status-badge--issued';
      case 'DRAFT':          return 'status-badge--draft';
      case 'VOID':           return 'status-badge--void';
      default:               return 'status-badge--draft';
    }
  }

  protected trackById(_index: number, item: Invoice): string {
    return item.id;
  }

  protected navigateToInvoice(invoice: Invoice): void {
    // Navigate to client details with invoice tab
    if (invoice.clientId) {
      this.router.navigate(['/clients', invoice.clientId]);
    }
  }

  protected isReceivedInvoice(invoice: Invoice): boolean {
    // Invoice is received if the current company is the client (recipient)
    return this.currentCompanyId !== null && invoice.clientId === this.currentCompanyId;
  }
}

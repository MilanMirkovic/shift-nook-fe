import { Component, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil, filter, distinctUntilChanged, take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Actions, ofType } from '@ngrx/effects';

import { Jobsite } from '../../../../../store/jobsites/jobsites.models';
import { Invoice } from '../../../../../store/invoices/invoices.models';
import { loadInvoices, sendInvoice, createPassThroughInvoiceSuccess, createPassThroughInvoiceFailure } from '../../../../../store/invoices/invoices.actions';
import { selectInvoices, selectInvoicesLoading } from '../../../../../store/invoices/invoices.selectors';
import { selectSelectedCompanyId } from '../../../../../store/user/user.selectors';
import { PassThroughInvoiceDialogComponent } from '../../../../../shared/components/pass-through-invoice-dialog/pass-through-invoice-dialog.component';
import { ConfirmationDialogComponent } from '../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { InvoicesApiService } from '../../../../../store/invoices/invoices.api';

@Component({
  selector: 'app-jobsite-invoices',
  standalone: false,
  templateUrl: './jobsite-invoices.component.html',
  styleUrls: ['./jobsite-invoices.component.scss']
})
export class JobsiteInvoicesComponent implements OnInit, OnDestroy {
  @Input() jobsite!: Jobsite;

  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly actions$ = inject(Actions);
  private readonly invoicesApi = inject(InvoicesApiService);
  private readonly destroy$ = new Subject<void>();

  invoices: Invoice[] = [];
  loading = false;
  currentCompanyId: string | null = null;
  pdfDownloading = new Set<string>();

  ngOnInit(): void {
    this.store.select(selectInvoicesLoading).pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loading = loading);

    this.store.select(selectInvoices).pipe(takeUntil(this.destroy$))
      .subscribe(invoices => {
        // Filter to only this jobsite's invoices (both sent and received)
        this.invoices = invoices.filter(inv => inv.jobsiteId === this.jobsite.id);
      });

    this.store.select(selectSelectedCompanyId).pipe(
      filter((id): id is string => id !== null),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(companyId => {
      this.currentCompanyId = companyId;
      // Load invoices for this jobsite - include both sent (to client) and received (from subcontractors)
      this.store.dispatch(loadInvoices({
        companyId,
        jobsiteId: this.jobsite.id,
        page: 0,
        size: 100,
        includeReceived: true
      }));
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PAID': return 'status--paid';
      case 'PARTIALLY_PAID': return 'status--partially-paid';
      case 'ISSUED': return 'status--issued';
      case 'DRAFT': return 'status--draft';
      case 'VOID': return 'status--void';
      default: return '';
    }
  }

  isSentInvoice(invoice: Invoice): boolean {
    // Invoice is sent if current company issued it
    return this.currentCompanyId !== null && invoice.companyId === this.currentCompanyId;
  }

  isReceivedInvoice(invoice: Invoice): boolean {
    // Invoice is received if current company is the recipient (from subcontractor)
    // Check recipientCompanyId which tracks the actual company being billed
    return this.currentCompanyId !== null &&
           invoice.recipientCompanyId === this.currentCompanyId;
  }

  navigateToClient(invoice: Invoice): void {
    // Navigate to the appropriate client details
    if (this.isSentInvoice(invoice)) {
      // For sent invoices, navigate to the client (recipient)
      this.router.navigate(['/clients', invoice.clientId]);
    } else {
      // For received invoices from subcontractors
      // The backend auto-creates them as clients when they send invoices
      // We need to find their client record by company ID
      // For now, show a message - we'll need to add client lookup by linkedCompanyId
      this.snackBar.open('Subcontractor client view coming soon', 'Close', { duration: 3000 });
    }
  }

  trackById(_index: number, item: Invoice): string {
    return item.id;
  }

  isOverdue(invoice: Invoice): boolean {
    if (!invoice.dueAt) return false;
    if (invoice.status === 'PAID' || invoice.status === 'VOID') return false;

    const now = new Date();
    const dueDate = new Date(invoice.dueAt);
    return dueDate < now;
  }

  sendInvoice(invoice: Invoice): void {
    if (!this.currentCompanyId) return;

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Send Invoice',
        message: `Are you sure you want to send invoice #${invoice.invoiceNumber}? This will transition it from DRAFT to ISSUED status and make it visible to the client.`,
        confirmText: 'Send',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed && this.currentCompanyId) {
        this.store.dispatch(sendInvoice({
          companyId: this.currentCompanyId,
          invoiceId: invoice.id
        }));

        this.snackBar.open('Invoice sent successfully', 'Close', { duration: 3000 });
      }
    });
  }

  createPassThroughInvoice(invoice: Invoice): void {
    if (!this.currentCompanyId) return;

    const dialogRef = this.dialog.open(PassThroughInvoiceDialogComponent, {
      width: '600px',
      data: {
        companyId: this.currentCompanyId,
        sourceInvoice: invoice
      }
    });

    dialogRef.afterClosed().subscribe(success => {
      if (success) {
        // Reload invoices to show the new pass-through invoice
        this.store.dispatch(loadInvoices({
          companyId: this.currentCompanyId!,
          jobsiteId: this.jobsite.id,
          page: 0,
          size: 100,
          includeReceived: true
        }));

        this.snackBar.open('Pass-through invoice created successfully', 'Close', { duration: 3000 });
      }
    });
  }

  onDownloadInvoicePdf(invoice: Invoice): void {
    if (!this.currentCompanyId || this.pdfDownloading.has(invoice.id)) return;
    this.pdfDownloading.add(invoice.id);

    this.invoicesApi.downloadPdf(this.currentCompanyId, invoice.id).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `invoice-${invoice.invoiceNumber}.pdf`;
        anchor.click();
        URL.revokeObjectURL(url);
        this.pdfDownloading.delete(invoice.id);
      },
      error: () => {
        this.snackBar.open('Failed to download PDF. Please try again.', 'Close', { duration: 3000 });
        this.pdfDownloading.delete(invoice.id);
      }
    });
  }
}

import { Component, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil, filter, distinctUntilChanged, take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Actions, ofType } from '@ngrx/effects';

import { Jobsite } from '../../../../../store/jobsites/jobsites.models';
import { Invoice, CombineInvoicesPreviewResponse, CreateInvoiceInput } from '../../../../../store/invoices/invoices.models';
import { loadInvoices, sendInvoice, createInvoice, createInvoiceSuccess, createInvoiceFailure, createPassThroughInvoiceSuccess, createPassThroughInvoiceFailure, deleteInvoice, deleteInvoiceSuccess, deleteInvoiceFailure } from '../../../../../store/invoices/invoices.actions';
import { selectInvoices, selectInvoicesLoading } from '../../../../../store/invoices/invoices.selectors';
import { selectSelectedCompanyId, selectCurrentUserRole } from '../../../../../store/user/user.selectors';
import { PassThroughInvoiceDialogComponent } from '../../../../../shared/components/pass-through-invoice-dialog/pass-through-invoice-dialog.component';
import { ConfirmationDialogComponent } from '../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { InvoicesApiService } from '../../../../../store/invoices/invoices.api';
import { InvoiceDialogComponent, InvoiceDialogResult } from '../../../../../shared/components/invoice-dialog/invoice-dialog.component';

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

  /** Set of invoice IDs the user has selected for combining. */
  selectedInvoiceIds = new Set<string>();
  /** True while the combine-preview API call is in flight. */
  combining = false;
  /** Whether the current user can issue invoices (Owner/Accountant). */
  canCombine = false;

  ngOnInit(): void {
    this.store.select(selectInvoicesLoading).pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loading = loading);

    this.store.select(selectInvoices).pipe(takeUntil(this.destroy$))
      .subscribe(invoices => {
        // Filter to only this jobsite's invoices (both sent and received)
        this.invoices = invoices.filter(inv => inv.jobsiteId === this.jobsite.id);
        // Drop any selected ids that are no longer in the visible list.
        const visible = new Set(this.invoices.map(i => i.id));
        for (const id of [...this.selectedInvoiceIds]) {
          if (!visible.has(id)) this.selectedInvoiceIds.delete(id);
        }
      });

    this.store.select(selectCurrentUserRole).pipe(takeUntil(this.destroy$))
      .subscribe(role => {
        this.canCombine = role === 'OWNER' || role === 'ACCOUNTANT';
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

  // ───────────────────────── Combine flow ─────────────────────────

  /** Whether the current user can delete this invoice. We only allow deleting
   *  DRAFT invoices issued by the current company (the "Created" badge state). */
  canDelete(invoice: Invoice): boolean {
    if (!this.canCombine) return false; // OWNER/ACCOUNTANT only
    if (invoice.status !== 'DRAFT') return false;
    return this.isSentInvoice(invoice);
  }

  deleteInvoice(invoice: Invoice): void {
    if (!this.currentCompanyId || !this.canDelete(invoice)) return;

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '420px',
      data: {
        title: 'Delete Invoice',
        message: `Permanently delete invoice #${invoice.invoiceNumber} (${invoice.title})? This cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(confirmed => {
      if (!confirmed || !this.currentCompanyId) return;

      this.store.dispatch(deleteInvoice({
        companyId: this.currentCompanyId,
        invoiceId: invoice.id,
      }));

      this.actions$.pipe(
        ofType(deleteInvoiceSuccess, deleteInvoiceFailure),
        take(1),
        takeUntil(this.destroy$),
      ).subscribe(action => {
        if (action.type === deleteInvoiceSuccess.type) {
          this.snackBar.open('Invoice deleted.', 'Close', { duration: 3000 });
          this.selectedInvoiceIds.delete(invoice.id);
        } else {
          this.snackBar.open('Failed to delete invoice. Please try again.', 'Close', { duration: 4000 });
        }
      });
    });
  }


  /** Selectable for combining: either a sent invoice we issued, or a received
   *  invoice from a subcontractor (multiple subcontractor invoices on the same
   *  jobsite can be rolled up into one combined invoice for the end client).
   *  Combined and VOID invoices are excluded. Mixing sent + received in one
   *  batch is prevented in {@link toggleSelected}. */
  isCombinable(invoice: Invoice): boolean {
    if (!this.canCombine) return false;
    if (invoice.status === 'VOID') return false;
    if (invoice.invoiceType === 'COMBINED') return false;

    const isSent = this.isSentInvoice(invoice);
    const isReceived = this.isReceivedInvoice(invoice);
    if (!isSent && !isReceived) return false;

    // Sent invoices need a clientId (target client). Received invoices use the
    // jobsite's end client which is resolved by the backend.
    if (isSent && !invoice.clientId) return false;
    return true;
  }

  isSelected(invoice: Invoice): boolean {
    return this.selectedInvoiceIds.has(invoice.id);
  }

  toggleSelected(invoice: Invoice, checked: boolean): void {
    if (!this.isCombinable(invoice)) return;

    if (checked) {
      const firstId = this.selectedInvoiceIds.values().next().value as string | undefined;
      if (firstId) {
        const first = this.invoices.find(i => i.id === firstId);
        if (first) {
          const firstIsSent = this.isSentInvoice(first);
          const newIsSent = this.isSentInvoice(invoice);

          // Don't mix sent and received in the same combine batch — the
          // backend rejects this and the resulting invoice would be ambiguous.
          if (firstIsSent !== newIsSent) {
            this.snackBar.open(
              'Cannot combine sent and received invoices in the same batch.',
              'Close',
              { duration: 4000 }
            );
            return;
          }

          // For sent batches: enforce same target client. Received batches
          // intentionally allow different source subcontractors.
          if (firstIsSent && first.clientId !== invoice.clientId) {
            this.snackBar.open(
              'All combined invoices must belong to the same client.',
              'Close',
              { duration: 4000 }
            );
            return;
          }
        }
      }
      this.selectedInvoiceIds.add(invoice.id);
    } else {
      this.selectedInvoiceIds.delete(invoice.id);
    }
  }

  clearSelection(): void {
    this.selectedInvoiceIds.clear();
  }

  combineSelected(): void {
    if (!this.currentCompanyId) return;
    if (this.selectedInvoiceIds.size < 2) {
      this.snackBar.open('Select at least two invoices to combine.', 'Close', { duration: 3000 });
      return;
    }
    if (this.combining) return;

    const ids = [...this.selectedInvoiceIds];
    this.combining = true;

    this.invoicesApi.previewCombineInvoices(this.currentCompanyId, {
      invoiceIds: ids,
      jobsiteId: this.jobsite.id,
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (preview) => {
        this.combining = false;
        this.openCombinePreviewDialog(preview);
      },
      error: (err) => {
        this.combining = false;
        const message = err?.error?.message || 'Failed to combine invoices. They must share the same client and currency.';
        this.snackBar.open(message, 'Close', { duration: 5000 });
      },
    });
  }

  /** Opens the standard invoice editor pre-filled with the server-computed
   *  preview. On save the result is persisted via createInvoice with
   *  combinedFromInvoiceIds set so the BE marks it as type=COMBINED. */
  private openCombinePreviewDialog(preview: CombineInvoicesPreviewResponse): void {
    if (!this.currentCompanyId) return;

    // Build a synthetic Invoice the existing dialog can render in "edit" mode.
    const syntheticInvoice = {
      id: '',
      companyId: this.currentCompanyId,
      clientId: preview.clientId,
      estimateId: null,
      jobsiteId: preview.jobsiteId ?? undefined,
      invoiceNumber: '',
      title: preview.title,
      status: 'DRAFT',
      invoiceType: 'COMBINED',
      currency: preview.currency,
      subtotalAmount: preview.subtotalAmount,
      taxAmount: preview.taxAmount,
      totalAmount: preview.totalAmount,
      paidAmount: 0,
      remainingAmount: preview.totalAmount,
      paymentPercentage: 0,
      notes: preview.notes,
      issuedAt: preview.issuedAt,
      dueAt: preview.dueAt,
      items: preview.items.map((it, i) => ({
        id: `preview-${i}`,
        sortOrder: it.sortOrder,
        service: it.service,
        description: it.description,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        lineTotal: it.lineTotal,
      })),
      payments: [],
      createdAt: preview.issuedAt,
      updatedAt: preview.issuedAt,
      pdfFileId: null,
      sourceInvoiceId: null,
      recipientCompanyId: null,
    } as unknown as Invoice;

    // Resolve client name for the dialog header — best-effort from the source
    // invoices the user just selected.
    const firstSource = this.invoices.find(i => i.clientId === preview.clientId);
    const clientName = firstSource ? `Client ${firstSource.clientId.slice(0, 8)}` : 'Client';

    const dialogRef = this.dialog.open(InvoiceDialogComponent, {
      width: '780px',
      maxWidth: '96vw',
      maxHeight: '92vh',
      disableClose: false,
      autoFocus: true,
      panelClass: 'invoice-dialog-container',
      data: {
        companyId: this.currentCompanyId,
        clientId: preview.clientId,
        clientName,
        invoice: syntheticInvoice,
      },
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result: InvoiceDialogResult | undefined) => {
      if (!result || !this.currentCompanyId) return;
      // Dialog opens in "edit" mode for a synthetic invoice, so result.mode
      // will be 'edit' but we treat the payload as a CREATE (id is empty).
      const editPayload: any = result.payload;
      const payload: CreateInvoiceInput = {
        clientId: preview.clientId,
        jobsiteId: editPayload.jobsiteId,
        title: editPayload.title,
        notes: editPayload.notes,
        issuedAt: editPayload.issuedAt,
        dueAt: editPayload.dueAt,
        items: editPayload.items,
        combinedFromInvoiceIds: preview.sourceInvoiceIds,
        taxAmount: preview.taxAmount,
      };

      this.store.dispatch(createInvoice({ companyId: this.currentCompanyId, invoice: payload }));

      this.actions$.pipe(
        ofType(createInvoiceSuccess, createInvoiceFailure),
        take(1),
        takeUntil(this.destroy$),
      ).subscribe(action => {
        if (action.type === createInvoiceSuccess.type) {
          this.snackBar.open(
            `Combined invoice draft created for ${preview.sourceInvoiceIds.length} invoices.`,
            'View',
            { duration: 5000 }
          ).onAction().subscribe(() => {
            // Navigate to client invoices for the newly created draft.
            this.router.navigate(['/clients', preview.clientId], {
              queryParams: { tab: 'invoices' },
            });
          });
          this.clearSelection();
          this.store.dispatch(loadInvoices({
            companyId: this.currentCompanyId!,
            jobsiteId: this.jobsite.id,
            page: 0,
            size: 100,
            includeReceived: true,
          }));
        } else {
          this.snackBar.open('Failed to create combined invoice. Please try again.', 'Close', { duration: 4000 });
        }
      });
    });
  }
}

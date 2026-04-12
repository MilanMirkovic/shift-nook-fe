import { Component, inject, Input, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { Actions, ofType } from '@ngrx/effects';

import { AsyncPipe, CurrencyPipe, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';

import { Invoice, InvoiceStatus } from '../../../../store/invoices/invoices.models';
import {
  loadInvoices,
  createInvoice, createInvoiceSuccess, createInvoiceFailure,
  updateInvoice, updateInvoiceSuccess, updateInvoiceFailure,
  updateInvoiceStatus, updateInvoiceStatusSuccess, updateInvoiceStatusFailure,
  deleteInvoice, deleteInvoiceSuccess, deleteInvoiceFailure,
} from '../../../../store/invoices/invoices.actions';
import {
  InvoiceDialogComponent,
  InvoiceDialogResult,
} from '../../../../shared/components/invoice-dialog/invoice-dialog.component';
import {
  selectInvoicesByClientId,
  selectInvoicesLoading,
  selectInvoicesError,
} from '../../../../store/invoices/invoices.selectors';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { NotificationService } from '../../../../shared/services/notification.service';
import { InvoicesApiService } from '../../../../store/invoices/invoices.api';
import {
  DocumentUploadDialogComponent,
  DocumentUploadDialogResult,
} from '../../../../shared/components/document-upload-dialog/document-upload-dialog.component';

@Component({
  selector: 'app-client-invoices',
  standalone: true,
  templateUrl: './client-invoices.component.html',
  styleUrls: ['./client-invoices.component.scss'],
  imports: [
    AsyncPipe,
    CurrencyPipe,
    DatePipe,
    NgIf,
    NgFor,
    NgClass,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    InvoiceDialogComponent,
  ],
})
export class ClientInvoicesComponent implements OnInit, OnDestroy {
  @Input({ required: true }) clientId!: string;
  @Input({ required: true }) clientName!: string;
  @Input({ required: true }) companyId!: string;

  private readonly store = inject(Store);
  private readonly dialog = inject(MatDialog);
  private readonly notificationService = inject(NotificationService);
  private readonly invoicesApi = inject(InvoicesApiService);
  private readonly actions$ = inject(Actions);
  private readonly destroy$ = new Subject<void>();

  protected invoices$!: Observable<Invoice[]>;
  protected invoicesLoading$!: Observable<boolean>;
  protected invoicesError$!: Observable<string | null>;

  protected pdfDownloading = new Set<string>();

  ngOnInit(): void {
    this.invoices$ = this.store.select(selectInvoicesByClientId(this.clientId));
    this.invoicesLoading$ = this.store.select(selectInvoicesLoading);
    this.invoicesError$ = this.store.select(selectInvoicesError);

    this.store.dispatch(loadInvoices({
      companyId: this.companyId,
      clientId: this.clientId,
      page: 0,
      size: 100,
    }));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected onAddInvoice(): void {
    const dialogRef = this.dialog.open(InvoiceDialogComponent, {
      width: '700px',
      maxWidth: '95vw',
      maxHeight: '92vh',
      disableClose: false,
      autoFocus: true,
      panelClass: 'invoice-dialog-container',
      data: { clientId: this.clientId, clientName: this.clientName },
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result: InvoiceDialogResult | undefined) => {
      if (!result || result.mode !== 'create') return;
      this.store.dispatch(createInvoice({ companyId: this.companyId, invoice: result.payload }));
      this.actions$.pipe(
        ofType(createInvoiceSuccess, createInvoiceFailure),
        take(1),
        takeUntil(this.destroy$),
      ).subscribe(action => {
        if (action.type === createInvoiceSuccess.type) {
          this.notificationService.success('Invoice created successfully!');
          this.store.dispatch(loadInvoices({ companyId: this.companyId, clientId: this.clientId, page: 0, size: 100 }));
        } else {
          this.notificationService.error('Failed to create invoice. Please try again.');
        }
      });
    });
  }

  protected onUploadDocument(): void {
    const dialogRef = this.dialog.open(DocumentUploadDialogComponent, {
      width: '720px',
      maxWidth: '96vw',
      maxHeight: '94vh',
      disableClose: false,
      autoFocus: false,
      panelClass: 'document-upload-dialog-container',
      backdropClass: 'document-upload-dialog-backdrop',
      data: {
        companyId: this.companyId,
        clientId: this.clientId,
        clientName: this.clientName,
        documentType: 'INVOICE' as const,
      },
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result: DocumentUploadDialogResult | undefined) => {
      if (!result) return;
      // Invoice creation from upload — handled when backend support is added
      this.notificationService.info('Invoice upload coming soon!');
    });
  }

  protected onEditInvoice(invoice: Invoice): void {
    const dialogRef = this.dialog.open(InvoiceDialogComponent, {
      width: '700px',
      maxWidth: '95vw',
      maxHeight: '92vh',
      disableClose: false,
      autoFocus: true,
      panelClass: 'invoice-dialog-container',
      data: { clientId: this.clientId, clientName: this.clientName, invoice },
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result: InvoiceDialogResult | undefined) => {
      if (!result || result.mode !== 'edit') return;
      this.store.dispatch(updateInvoice({ companyId: this.companyId, invoiceId: invoice.id, invoice: result.payload }));
      this.actions$.pipe(
        ofType(updateInvoiceSuccess, updateInvoiceFailure),
        take(1),
        takeUntil(this.destroy$),
      ).subscribe(action => {
        if (action.type === updateInvoiceSuccess.type) {
          this.notificationService.success('Invoice updated successfully!');
        } else {
          this.notificationService.error('Failed to update invoice. Please try again.');
        }
      });
    });
  }

  protected onDeleteInvoice(invoice: Invoice): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Invoice',
        message: `Are you sure you want to delete invoice "${invoice.title}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger',
      },
      position: { top: '80px' },
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(confirmed => {
      if (!confirmed) return;

      this.store.dispatch(deleteInvoice({ companyId: this.companyId, invoiceId: invoice.id }));

      this.actions$.pipe(
        ofType(deleteInvoiceSuccess, deleteInvoiceFailure),
        take(1),
        takeUntil(this.destroy$),
      ).subscribe(action => {
        if (action.type === deleteInvoiceSuccess.type) {
          this.notificationService.success('Invoice deleted successfully!');
        } else {
          this.notificationService.error('Failed to delete invoice. Please try again.');
        }
      });
    });
  }

  protected onUpdateInvoiceStatus(invoice: Invoice, status: InvoiceStatus): void {
    this.store.dispatch(updateInvoiceStatus({
      companyId: this.companyId,
      invoiceId: invoice.id,
      statusUpdate: { status },
    }));

    this.actions$.pipe(
      ofType(updateInvoiceStatusSuccess, updateInvoiceStatusFailure),
      take(1),
      takeUntil(this.destroy$),
    ).subscribe(result => {
      if (result.type === updateInvoiceStatusSuccess.type) {
        this.notificationService.success(`Invoice marked as ${status.toLowerCase()}.`);
      } else {
        this.notificationService.error('Failed to update invoice status.');
      }
    });
  }

  protected onDownloadInvoicePdf(invoice: Invoice): void {
    if (this.pdfDownloading.has(invoice.id)) return;
    this.pdfDownloading.add(invoice.id);

    this.invoicesApi.downloadPdf(this.companyId, invoice.id).pipe(
      takeUntil(this.destroy$),
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
        this.notificationService.error('Failed to download PDF. Please try again.');
        this.pdfDownloading.delete(invoice.id);
      },
    });
  }

  protected getInvoiceStatusClass(status: InvoiceStatus): string {
    switch (status) {
      case 'PAID':    return 'invoice-status--paid';
      case 'SENT':    return 'invoice-status--sent';
      case 'DRAFT':   return 'invoice-status--draft';
      case 'OVERDUE': return 'invoice-status--overdue';
      case 'VOID':    return 'invoice-status--void';
      default:        return 'invoice-status--draft';
    }
  }

  protected trackById(index: number, item: Invoice): string {
    return item.id;
  }
}

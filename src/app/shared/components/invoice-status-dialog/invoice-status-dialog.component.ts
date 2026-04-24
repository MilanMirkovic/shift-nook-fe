import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { InvoiceStatus } from '../../../store/invoices/invoices.models';

export interface InvoiceStatusDialogData {
  invoiceTitle: string;
  invoiceNumber: string;
  currentStatus: InvoiceStatus;
}

interface StatusOption {
  value: InvoiceStatus;
  label: string;
  icon: string;
  colorClass: string;
  description: string;
}

@Component({
  selector: 'app-invoice-status-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './invoice-status-dialog.component.html',
  styleUrls: ['./invoice-status-dialog.component.scss'],
})
export class InvoiceStatusDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<InvoiceStatusDialogComponent>);

  selectedStatus: InvoiceStatus;

  readonly statusOptions: StatusOption[] = [
    { value: 'DRAFT',  label: 'Draft',  icon: 'edit_note',    colorClass: 'status--draft',  description: 'Work in progress, not yet issued' },
    { value: 'ISSUED', label: 'Issued', icon: 'send',         colorClass: 'status--issued', description: 'Issued to the client for payment' },
    { value: 'PAID',   label: 'Paid',   icon: 'check_circle', colorClass: 'status--paid',   description: 'Payment has been received' },
    { value: 'VOID',   label: 'Void',   icon: 'block',        colorClass: 'status--void',   description: 'Invoice is no longer valid' },
  ];

  constructor(@Inject(MAT_DIALOG_DATA) public data: InvoiceStatusDialogData) {
    this.selectedStatus = data.currentStatus;
  }

  selectStatus(status: InvoiceStatus): void {
    this.selectedStatus = status;
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onConfirm(): void {
    if (this.selectedStatus === this.data.currentStatus) {
      this.dialogRef.close(null);
      return;
    }
    this.dialogRef.close(this.selectedStatus);
  }

  get hasChanged(): boolean {
    return this.selectedStatus !== this.data.currentStatus;
  }
}


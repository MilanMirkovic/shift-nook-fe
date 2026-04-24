import { Component, inject, Inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Payment } from '../../../store/invoices/invoices.models';

export interface PaymentHistoryDialogData {
  invoiceNumber: string;
  invoiceTitle: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  payments: Payment[];
}

export interface PaymentHistoryDialogResult {
  action: 'delete';
  paymentId: string;
}

@Component({
  selector: 'app-payment-history-dialog',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatTableModule,
    MatTooltipModule,
  ],
  templateUrl: './payment-history-dialog.component.html',
  styleUrls: ['./payment-history-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentHistoryDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<PaymentHistoryDialogComponent>);

  protected readonly displayedColumns = ['date', 'amount', 'method', 'reference', 'actions'];

  constructor(@Inject(MAT_DIALOG_DATA) public data: PaymentHistoryDialogData) {}

  protected getPaymentMethodLabel(method: string): string {
    return method.replace(/_/g, ' ');
  }

  protected onDeletePayment(payment: Payment): void {
    if (confirm(`Are you sure you want to delete this payment of ${this.formatCurrency(payment.amount)}?`)) {
      this.dialogRef.close({ action: 'delete', paymentId: payment.id } as PaymentHistoryDialogResult);
    }
  }

  protected onClose(): void {
    this.dialogRef.close();
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }
}

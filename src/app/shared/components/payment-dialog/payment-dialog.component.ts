import { Component, inject, Inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { CreatePaymentInput, PaymentMethod } from '../../../store/invoices/invoices.models';

export interface PaymentDialogData {
  invoiceNumber: string;
  invoiceTitle: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
}

export interface PaymentDialogResult {
  payment: CreatePaymentInput;
}

@Component({
  selector: 'app-payment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './payment-dialog.component.html',
  styleUrls: ['./payment-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<PaymentDialogComponent>);

  protected readonly form: FormGroup;
  protected readonly paymentMethods: PaymentMethod[] = [
    'CASH',
    'CHECK',
    'CREDIT_CARD',
    'DEBIT_CARD',
    'BANK_TRANSFER',
    'ACH',
    'WIRE_TRANSFER',
    'PAYPAL',
    'VENMO',
    'ZELLE',
    'OTHER',
  ];

  constructor(@Inject(MAT_DIALOG_DATA) public data: PaymentDialogData) {
    this.form = this.fb.group({
      amount: [
        data.remainingAmount,
        [
          Validators.required,
          Validators.min(0.01),
          Validators.max(data.remainingAmount),
          // Custom validator to ensure amount is a valid number
          (control) => {
            const value = control.value;
            if (value === null || value === undefined || value === '') {
              return { required: true };
            }
            const num = typeof value === 'number' ? value : parseFloat(value);
            if (isNaN(num)) {
              return { invalidNumber: true };
            }
            return null;
          }
        ],
      ],
      paymentDate: [new Date(), Validators.required],
      paymentMethod: ['', Validators.required],
      referenceNumber: ['', Validators.maxLength(255)],
      notes: ['', Validators.maxLength(2000)],
    });
  }

  ngOnInit(): void {}

  protected getPaymentMethodLabel(method: PaymentMethod): string {
    return method.replace(/_/g, ' ');
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      console.error('Payment form is invalid:', this.form.errors, this.form.value);
      return;
    }

    const raw = this.form.getRawValue();

    // Format date as YYYY-MM-DD
    const paymentDate = raw.paymentDate instanceof Date
      ? raw.paymentDate.toISOString().split('T')[0]
      : raw.paymentDate;

    // Ensure amount is a number
    const amount = typeof raw.amount === 'number' ? raw.amount : parseFloat(raw.amount);

    if (isNaN(amount) || amount <= 0) {
      console.error('Invalid payment amount:', raw.amount);
      return;
    }

    const payment: CreatePaymentInput = {
      amount,
      paymentDate,
      paymentMethod: raw.paymentMethod,
      referenceNumber: raw.referenceNumber?.trim() || undefined,
      notes: raw.notes?.trim() || undefined,
    };

    console.log('Submitting payment:', payment);
    this.dialogRef.close({ payment } as PaymentDialogResult);
  }

  protected onCancel(): void {
    this.dialogRef.close();
  }

  protected get maxAmount(): number {
    return this.data.remainingAmount;
  }
}

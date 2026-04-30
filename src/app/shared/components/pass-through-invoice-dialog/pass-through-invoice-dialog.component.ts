import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Invoice } from '../../../store/invoices/invoices.models';
import { createPassThroughInvoice } from '../../../store/invoices/invoices.actions';
import { selectInvoicesLoading } from '../../../store/invoices/invoices.selectors';
import { Observable } from 'rxjs';

export interface PassThroughInvoiceDialogData {
  companyId: string;
  sourceInvoice: Invoice;
}

@Component({
  selector: 'app-pass-through-invoice-dialog',
  standalone: false,
  templateUrl: './pass-through-invoice-dialog.component.html',
  styleUrls: ['./pass-through-invoice-dialog.component.scss']
})
export class PassThroughInvoiceDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly dialogRef = inject(MatDialogRef<PassThroughInvoiceDialogComponent>);

  form!: FormGroup;
  loading$: Observable<boolean>;

  constructor(@Inject(MAT_DIALOG_DATA) public data: PassThroughInvoiceDialogData) {
    this.loading$ = this.store.select(selectInvoicesLoading);
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      markupPercentage: [20, [Validators.required, Validators.min(0), Validators.max(1000)]]
    });
  }

  get previewTotal(): number {
    const markup = this.form.get('markupPercentage')?.value || 0;
    const multiplier = 1 + (markup / 100);
    return this.data.sourceInvoice.totalAmount * multiplier;
  }

  get markupAmount(): number {
    return this.previewTotal - this.data.sourceInvoice.totalAmount;
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.store.dispatch(createPassThroughInvoice({
        companyId: this.data.companyId,
        request: {
          sourceInvoiceId: this.data.sourceInvoice.id,
          markupPercentage: this.form.value.markupPercentage
        }
      }));

      // Close dialog on success (handled by effect)
      this.dialogRef.close(true);
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}

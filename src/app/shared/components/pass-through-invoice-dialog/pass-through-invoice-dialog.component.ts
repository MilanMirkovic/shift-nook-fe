import { Component, Inject, OnInit, OnDestroy, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { Invoice } from '../../../store/invoices/invoices.models';
import { createPassThroughInvoice, createPassThroughInvoiceSuccess, createPassThroughInvoiceFailure } from '../../../store/invoices/invoices.actions';
import { selectInvoicesLoading } from '../../../store/invoices/invoices.selectors';
import { Observable, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

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
export class PassThroughInvoiceDialogComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly actions$ = inject(Actions);
  private readonly dialogRef = inject(MatDialogRef<PassThroughInvoiceDialogComponent>);
  private readonly destroy$ = new Subject<void>();

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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

      // Wait for success or failure before closing
      this.actions$.pipe(
        ofType(createPassThroughInvoiceSuccess, createPassThroughInvoiceFailure),
        take(1),
        takeUntil(this.destroy$)
      ).subscribe(action => {
        if (action.type === createPassThroughInvoiceSuccess.type) {
          this.dialogRef.close(true);
        }
        // On failure, keep dialog open (error will be shown)
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}

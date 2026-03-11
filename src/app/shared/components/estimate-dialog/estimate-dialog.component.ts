import { Component, inject, OnInit, OnDestroy, Inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject } from 'rxjs';
import { CreateEstimateInput } from '../../../store/estimates/estimates.models';

export interface EstimateDialogData {
  clientId: string;
  clientName: string;
}

export interface EstimateDialogResult extends CreateEstimateInput {}

@Component({
  selector: 'app-estimate-dialog',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    ReactiveFormsModule,
    TextFieldModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './estimate-dialog.component.html',
  styleUrls: ['./estimate-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EstimateDialogComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<EstimateDialogComponent>);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  protected submitting = false;
  protected readonly form: FormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) public data: EstimateDialogData) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(255)]],
      estimateDate: [new Date(), Validators.required],
      notes: ['', Validators.maxLength(2000)],
      lineItems: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.addLineItem();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get lineItems(): FormArray {
    return this.form.get('lineItems') as FormArray;
  }

  get total(): number {
    return this.lineItems.controls.reduce((sum, ctrl) => {
      const qty = parseFloat(ctrl.get('quantity')?.value) || 0;
      const rate = parseFloat(ctrl.get('rate')?.value) || 0;
      return sum + qty * rate;
    }, 0);
  }

  addLineItem(): void {
    const item = this.fb.group({
      sortOrder: [this.lineItems.length],
      description: ['', [Validators.required, Validators.maxLength(1000)]],
      quantity: [1, [Validators.required, Validators.min(0.01)]],
      rate: [0, [Validators.required, Validators.min(0)]]
    });
    this.lineItems.push(item);
    this.cdr.markForCheck();
  }

  removeLineItem(index: number): void {
    this.lineItems.removeAt(index);
    // Update sort orders
    this.lineItems.controls.forEach((ctrl, i) => ctrl.get('sortOrder')?.setValue(i));
    this.cdr.markForCheck();
  }

  getLineItemAmount(ctrl: AbstractControl): number {
    const qty = parseFloat(ctrl.get('quantity')?.value) || 0;
    const rate = parseFloat(ctrl.get('rate')?.value) || 0;
    return qty * rate;
  }

  getErrorMessage(controlPath: string | (string | number)[]): string {
    const ctrl = Array.isArray(controlPath)
      ? this.form.get(controlPath)
      : this.form.get(controlPath);
    if (!ctrl || !ctrl.errors || !ctrl.touched) return '';
    if (ctrl.errors['required']) return 'This field is required';
    if (ctrl.errors['maxlength']) return `Max ${ctrl.errors['maxlength'].requiredLength} characters`;
    if (ctrl.errors['min']) return `Must be at least ${ctrl.errors['min'].min}`;
    return 'Invalid value';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.cdr.markForCheck();
      return;
    }

    const raw = this.form.getRawValue();
    const estimateDate = raw.estimateDate instanceof Date
      ? raw.estimateDate.toISOString().split('T')[0]
      : raw.estimateDate;

    const result: EstimateDialogResult = {
      clientId: this.data.clientId,
      title: raw.title.trim(),
      notes: raw.notes?.trim() || undefined,
      estimateDate,
      lineItems: raw.lineItems.map((item: any, i: number) => ({
        sortOrder: i,
        description: item.description.trim(),
        quantity: parseFloat(item.quantity),
        rate: parseFloat(item.rate)
      }))
    };

    this.dialogRef.close(result);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

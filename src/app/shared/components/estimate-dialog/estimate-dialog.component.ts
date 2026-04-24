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
import { MatSelectModule } from '@angular/material/select';
import { Subject, takeUntil, map } from 'rxjs';
import { CreateEstimateInput, Estimate, UpdateEstimateInput } from '../../../store/estimates/estimates.models';
import { JobsitesStoreService } from '../../../store/jobsites/jobsites-store.service';
import { Jobsite } from '../../../store/jobsites/jobsites.models';

export interface EstimateDialogData {
  companyId: string;
  clientId: string;
  clientName: string;
  /** When provided, the dialog operates in "edit" mode. */
  estimate?: Estimate;
}

export type EstimateDialogResult =
  | { mode: 'create'; payload: CreateEstimateInput }
  | { mode: 'edit';   payload: UpdateEstimateInput }

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
    MatTooltipModule,
    MatSelectModule
  ],
  templateUrl: './estimate-dialog.component.html',
  styleUrls: ['./estimate-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EstimateDialogComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<EstimateDialogComponent>);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly jobsitesStore = inject(JobsitesStoreService);
  private readonly destroy$ = new Subject<void>();

  protected submitting = false;
  protected readonly form: FormGroup;
  protected readonly isEditMode: boolean;
  protected jobsites$ = this.jobsitesStore.jobsites$.pipe(
    map(jobsites => jobsites.filter(j => j.clientId === this.data.clientId || j.clientId === null))
  );

  constructor(@Inject(MAT_DIALOG_DATA) public data: EstimateDialogData) {
    this.isEditMode = !!data.estimate;

    this.form = this.fb.group({
      title: [data.estimate?.title ?? '', [Validators.required, Validators.maxLength(255)]],
      jobsiteId: [data.estimate?.jobsiteId ?? ''],
      estimateDate: [data.estimate ? new Date(data.estimate.estimateDate) : new Date(), Validators.required],
      notes: [data.estimate?.notes ?? '', Validators.maxLength(2000)],
      lineItems: this.fb.array([])
    });
  }

  ngOnInit(): void {
    // Load jobsites for the dropdown
    this.jobsitesStore.loadJobsites(this.data.companyId, 0, 100);

    if (this.data.estimate && this.data.estimate.lineItems.length > 0) {
      for (const li of this.data.estimate.lineItems) {
        const item = this.fb.group({
          sortOrder: [this.lineItems.length],
          service: [li.service ?? '', Validators.maxLength(500)],
          description: [li.description, [Validators.required, Validators.maxLength(1000)]],
          quantity: [li.quantity, [Validators.required, Validators.min(0.01)]],
          rate: [li.rate, [Validators.required, Validators.min(0)]]
        });
        this.lineItems.push(item);
      }
    } else {
      this.addLineItem();
    }
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
      service: ['', Validators.maxLength(500)],
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

    // Validate that there is at least one line item
    if (this.lineItems.length === 0) {
      alert('Please add at least one line item before creating the estimate.');
      return;
    }

    // Validate that at least one line item has valid data
    const hasValidLineItem = this.lineItems.controls.some(ctrl => {
      const description = ctrl.get('description')?.value?.trim();
      const quantity = parseFloat(ctrl.get('quantity')?.value);
      const rate = parseFloat(ctrl.get('rate')?.value);
      return description && quantity > 0 && rate >= 0;
    });

    if (!hasValidLineItem) {
      alert('Please fill in at least one complete line item with a description, quantity, and rate.');
      return;
    }

    // Validate that total is greater than 0
    if (this.total <= 0) {
      alert('Estimate total must be greater than $0. Please add items with valid quantities and rates.');
      return;
    }

    const raw = this.form.getRawValue();
    const estimateDate = raw.estimateDate instanceof Date
      ? raw.estimateDate.toISOString().split('T')[0]
      : raw.estimateDate;

    const lineItems = raw.lineItems.map((item: any, i: number) => ({
      sortOrder: i,
      service: item.service?.trim() || undefined,
      description: item.description.trim(),
      quantity: parseFloat(item.quantity),
      rate: parseFloat(item.rate)
    }));

    if (this.isEditMode) {
      const result: EstimateDialogResult = {
        mode: 'edit',
        payload: {
          jobsiteId: raw.jobsiteId || undefined,
          title: raw.title.trim(),
          notes: raw.notes?.trim() || undefined,
          estimateDate,
          lineItems,
        }
      };
      this.dialogRef.close(result);
    } else {
      const result: EstimateDialogResult = {
        mode: 'create',
        payload: {
          clientId: this.data.clientId,
          jobsiteId: raw.jobsiteId || undefined,
          title: raw.title.trim(),
          notes: raw.notes?.trim() || undefined,
          estimateDate,
          lineItems,
        }
      };
      this.dialogRef.close(result);
    }
  }

  onRateFocus(index: number): void {
    const ctrl = this.lineItems.at(index)?.get('rate');
    if (ctrl && (ctrl.value === 0 || ctrl.value === '0')) {
      ctrl.setValue(null, { emitEvent: false });
    }
  }

  onRateBlur(index: number): void {
    const ctrl = this.lineItems.at(index)?.get('rate');
    if (ctrl && (ctrl.value === null || ctrl.value === '' || ctrl.value === undefined)) {
      ctrl.setValue(0, { emitEvent: false });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

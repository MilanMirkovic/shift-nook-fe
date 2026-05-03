import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  Inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  FormsModule,
} from '@angular/forms';
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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Subject, takeUntil, map } from 'rxjs';
import { CreateInvoiceInput, Invoice, UpdateInvoiceInput } from '../../../store/invoices/invoices.models';
import { JobsitesStoreService } from '../../../store/jobsites/jobsites-store.service';
import { Jobsite } from '../../../store/jobsites/jobsites.models';

export interface InvoiceDialogData {
  companyId: string;
  clientId: string;
  clientName: string;
  /** When provided, the dialog operates in "edit" mode. */
  invoice?: Invoice;
}

export type InvoiceDialogResult =
  | { mode: 'create'; payload: CreateInvoiceInput }
  | { mode: 'edit'; payload: UpdateInvoiceInput };

@Component({
  selector: 'app-invoice-dialog',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    ReactiveFormsModule,
    FormsModule,
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
    MatSelectModule,
    MatCheckboxModule,
  ],
  templateUrl: './invoice-dialog.component.html',
  styleUrls: ['./invoice-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceDialogComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<InvoiceDialogComponent>);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly jobsitesStore = inject(JobsitesStoreService);
  private readonly destroy$ = new Subject<void>();

  protected submitting = false;
  protected readonly form: FormGroup;
  protected readonly isEditMode: boolean;
  /** When true, a checkbox is shown next to each line item so the user can
   *  pick which lines to apply a markup to. */
  protected markupMode = false;
  /** The percentage value bound to the markup input while {@link markupMode}
   *  is active. */
  protected markupPercentInput: number | null = 10;
  protected jobsites$ = this.jobsitesStore.jobsites$.pipe(
    map(jobsites => jobsites.filter(j => j.clientId === this.data.clientId || j.clientId === null))
  );

  constructor(@Inject(MAT_DIALOG_DATA) public data: InvoiceDialogData) {
    this.isEditMode = !!data.invoice;

    // Calculate default due date (30 days from today for new invoices)
    const defaultDueDate = !data.invoice ? this.addDays(new Date(), 30) : null;

    this.form = this.fb.group({
      title: [
        data.invoice?.title ?? '',
        [Validators.required, Validators.maxLength(255)],
      ],
      jobsiteId: [data.invoice?.jobsiteId ?? ''],
      issuedAt: [
        data.invoice ? new Date(data.invoice.issuedAt) : new Date(),
        Validators.required,
      ],
      dueAt: [data.invoice?.dueAt ? new Date(data.invoice.dueAt) : defaultDueDate],
      notes: [data.invoice?.notes ?? '', Validators.maxLength(2000)],
      lineItems: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    // Load jobsites for the dropdown
    this.jobsitesStore.loadJobsites(this.data.companyId, 0, 100);

    // Auto-update due date when issue date changes (only for new invoices)
    if (!this.isEditMode) {
      this.form.get('issuedAt')?.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe(issuedDate => {
          if (issuedDate && !this.form.get('dueAt')?.touched) {
            const newDueDate = this.addDays(new Date(issuedDate), 30);
            this.form.get('dueAt')?.setValue(newDueDate, { emitEvent: false });
          }
        });
    }

    if (this.data.invoice && this.data.invoice.items.length > 0) {
      for (const item of this.data.invoice.items) {
        const group = this.fb.group({
          sortOrder: [this.lineItems.length],
          service: [item.service ?? '', Validators.maxLength(500)],
          description: [
            item.description,
            [Validators.required, Validators.maxLength(1000)],
          ],
          quantity: [item.quantity, [Validators.required, Validators.min(0.01)]],
          unitPrice: [item.unitPrice, [Validators.required, Validators.min(0)]],
          // Markup metadata: keep the pre-markup price so re-applying markup
          // doesn't compound. Default originalUnitPrice = unitPrice.
          markupPercentage: [item.markupPercentage ?? 0],
          originalUnitPrice: [item.originalUnitPrice ?? item.unitPrice],
          // Selection state for the markup tool (UI-only).
          markupSelected: [false],
        });
        this.lineItems.push(group);
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
      const price = parseFloat(ctrl.get('unitPrice')?.value) || 0;
      return sum + qty * price;
    }, 0);
  }

  addLineItem(): void {
    const item = this.fb.group({
      sortOrder: [this.lineItems.length],
      service: ['', Validators.maxLength(500)],
      description: ['', [Validators.required, Validators.maxLength(1000)]],
      quantity: [1, [Validators.required, Validators.min(0.01)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      markupPercentage: [0],
      originalUnitPrice: [0],
      markupSelected: [false],
    });
    this.lineItems.push(item);
    this.cdr.markForCheck();
  }

  removeLineItem(index: number): void {
    this.lineItems.removeAt(index);
    this.lineItems.controls.forEach((ctrl, i) =>
      ctrl.get('sortOrder')?.setValue(i)
    );
    this.cdr.markForCheck();
  }

  getLineItemAmount(ctrl: AbstractControl): number {
    const qty = parseFloat(ctrl.get('quantity')?.value) || 0;
    const price = parseFloat(ctrl.get('unitPrice')?.value) || 0;
    return qty * price;
  }

  // ───────────────── Markup tool ─────────────────

  toggleMarkupMode(): void {
    this.markupMode = !this.markupMode;
    if (!this.markupMode) {
      // Clear selection state when leaving markup mode.
      this.lineItems.controls.forEach(c => c.get('markupSelected')?.setValue(false));
    }
    this.cdr.markForCheck();
  }

  toggleAllMarkupSelected(checked: boolean): void {
    this.lineItems.controls.forEach(c => c.get('markupSelected')?.setValue(checked));
    this.cdr.markForCheck();
  }

  get allMarkupSelected(): boolean {
    return this.lineItems.length > 0
      && this.lineItems.controls.every(c => !!c.get('markupSelected')?.value);
  }

  get markupSelectionCount(): number {
    return this.lineItems.controls.filter(c => !!c.get('markupSelected')?.value).length;
  }

  /** Applies the entered percentage to every selected line item. The unit
   *  price is recomputed from the stored {@link originalUnitPrice} so the
   *  markup never compounds on repeated applications. */
  applyMarkup(): void {
    const pct = Number(this.markupPercentInput);
    if (!isFinite(pct)) return;

    let touched = 0;
    for (const ctrl of this.lineItems.controls) {
      if (!ctrl.get('markupSelected')?.value) continue;

      // Capture original price the first time we mark up this row.
      let original = parseFloat(ctrl.get('originalUnitPrice')?.value);
      const currentMarkup = parseFloat(ctrl.get('markupPercentage')?.value) || 0;
      if (!original || currentMarkup === 0) {
        original = parseFloat(ctrl.get('unitPrice')?.value) || 0;
        ctrl.get('originalUnitPrice')?.setValue(original);
      }

      const newPrice = +(original * (1 + pct / 100)).toFixed(2);
      ctrl.get('unitPrice')?.setValue(newPrice);
      ctrl.get('markupPercentage')?.setValue(pct);
      touched++;
    }

    if (touched > 0) {
      // Visual feedback only — exit markup mode after applying.
      this.markupMode = false;
      this.lineItems.controls.forEach(c => c.get('markupSelected')?.setValue(false));
    }
    this.cdr.markForCheck();
  }

  /** Removes any previously-applied markup from a single row, restoring its
   *  original unit price. Exposed in the row for quick undo. */
  clearLineItemMarkup(index: number): void {
    const ctrl = this.lineItems.at(index);
    const original = parseFloat(ctrl.get('originalUnitPrice')?.value);
    if (isFinite(original)) {
      ctrl.get('unitPrice')?.setValue(original);
    }
    ctrl.get('markupPercentage')?.setValue(0);
    this.cdr.markForCheck();
  }

  getLineItemMarkup(ctrl: AbstractControl): number {
    return parseFloat(ctrl.get('markupPercentage')?.value) || 0;
  }

  getErrorMessage(controlName: string): string {
    const ctrl = this.form.get(controlName);
    if (!ctrl || !ctrl.errors || !ctrl.touched) return '';
    if (ctrl.errors['required']) return 'This field is required';
    if (ctrl.errors['maxlength'])
      return `Max ${ctrl.errors['maxlength'].requiredLength} characters`;
    if (ctrl.errors['min']) return `Must be at least ${ctrl.errors['min'].min}`;
    return 'Invalid value';
  }

  getLineItemError(index: number, field: string): string {
    const ctrl = this.lineItems.at(index)?.get(field);
    if (!ctrl || !ctrl.errors || !ctrl.touched) return '';
    if (ctrl.errors['required']) return 'Required';
    if (ctrl.errors['min']) return `Min ${ctrl.errors['min'].min}`;
    if (ctrl.errors['maxlength'])
      return `Max ${ctrl.errors['maxlength'].requiredLength} chars`;
    return 'Invalid';
  }

  private formatDate(value: Date | string | null): string | undefined {
    if (!value) return undefined;
    const d = value instanceof Date ? value : new Date(value);
    return d.toISOString().split('T')[0];
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.cdr.markForCheck();
      return;
    }

    // Validate that there is at least one line item
    if (this.lineItems.length === 0) {
      alert('Please add at least one line item before creating the invoice.');
      return;
    }

    // Validate that at least one line item has valid data
    const hasValidLineItem = this.lineItems.controls.some(ctrl => {
      const description = ctrl.get('description')?.value?.trim();
      const quantity = parseFloat(ctrl.get('quantity')?.value);
      const unitPrice = parseFloat(ctrl.get('unitPrice')?.value);
      return description && quantity > 0 && unitPrice >= 0;
    });

    if (!hasValidLineItem) {
      alert('Please fill in at least one complete line item with a description, quantity, and price.');
      return;
    }

    const raw = this.form.getRawValue();

    // Validate due date is not before issue date
    if (raw.issuedAt && raw.dueAt) {
      const issuedDate = raw.issuedAt instanceof Date ? raw.issuedAt : new Date(raw.issuedAt);
      const dueDate = raw.dueAt instanceof Date ? raw.dueAt : new Date(raw.dueAt);

      if (dueDate < issuedDate) {
        alert('Due date cannot be before the issue date.');
        return;
      }
    }

    // Validate that total is greater than 0
    if (this.total <= 0) {
      alert('Invoice total must be greater than $0. Please add items with valid quantities and prices.');
      return;
    }

    const items = raw.lineItems.map((item: any, i: number) => {
      const markupPercentage = parseFloat(item.markupPercentage) || 0;
      const originalUnitPrice = parseFloat(item.originalUnitPrice);
      return {
        sortOrder: i,
        service: item.service?.trim() || undefined,
        description: item.description.trim(),
        quantity: parseFloat(item.quantity),
        unitPrice: parseFloat(item.unitPrice),
        ...(markupPercentage > 0 ? { markupPercentage } : {}),
        ...(markupPercentage > 0 && isFinite(originalUnitPrice)
          ? { originalUnitPrice }
          : {}),
      };
    });

    if (this.isEditMode) {
      const result: InvoiceDialogResult = {
        mode: 'edit',
        payload: {
          jobsiteId: raw.jobsiteId || undefined,
          title: raw.title.trim(),
          notes: raw.notes?.trim() || undefined,
          issuedAt: this.formatDate(raw.issuedAt),
          dueAt: this.formatDate(raw.dueAt),
          items,
        },
      };
      this.dialogRef.close(result);
    } else {
      const result: InvoiceDialogResult = {
        mode: 'create',
        payload: {
          clientId: this.data.clientId,
          jobsiteId: raw.jobsiteId || undefined,
          title: raw.title.trim(),
          notes: raw.notes?.trim() || undefined,
          issuedAt: this.formatDate(raw.issuedAt),
          dueAt: this.formatDate(raw.dueAt),
          items,
        },
      };
      this.dialogRef.close(result);
    }
  }

  onUnitPriceFocus(index: number): void {
    const ctrl = this.lineItems.at(index)?.get('unitPrice');
    if (ctrl && (ctrl.value === 0 || ctrl.value === '0')) {
      ctrl.setValue(null, { emitEvent: false });
    }
  }

  onUnitPriceBlur(index: number): void {
    const ctrl = this.lineItems.at(index)?.get('unitPrice');
    if (ctrl && (ctrl.value === null || ctrl.value === '' || ctrl.value === undefined)) {
      ctrl.setValue(0, { emitEvent: false });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
}


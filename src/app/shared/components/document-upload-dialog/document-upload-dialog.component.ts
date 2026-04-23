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
  FormsModule,
  Validators,
} from '@angular/forms';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRadioModule } from '@angular/material/radio';
import { Subject, takeUntil } from 'rxjs';
import { DocumentUploadService } from '../../services/document-upload.service';
import {
  DocumentType,
  ParsedDocumentData,
} from '../../models/document-upload.models';
import { CreateEstimateInput } from '../../../store/estimates/estimates.models';
import { CreateInvoiceInput } from '../../../store/invoices/invoices.models';
import { NotificationService } from '../../services/notification.service';

export interface DocumentUploadDialogData {
  companyId: string;
  clientId: string;
  clientName: string;
  /** When provided, pre-selects the type and hides the type-selector radio group */
  documentType?: DocumentType;
}

export type DocumentUploadDialogResult =
  | { mode: 'estimate'; payload: CreateEstimateInput }
  | { mode: 'invoice'; payload: CreateInvoiceInput };

@Component({
  selector: 'app-document-upload-dialog',
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
    MatRadioModule,
  ],
  templateUrl: './document-upload-dialog.component.html',
  styleUrls: ['./document-upload-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentUploadDialogComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(
    MatDialogRef<DocumentUploadDialogComponent>
  );
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly uploadService = inject(DocumentUploadService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroy$ = new Subject<void>();

  protected uploading = false;
  protected parsedData: ParsedDocumentData | null = null;
  protected selectedFile: File | null = null;
  protected documentType: DocumentType = 'ESTIMATE';
  /** True when the caller pre-selected the type — hides the radio selector */
  protected lockDocumentType = false;
  protected form: FormGroup | null = null;

  constructor(@Inject(MAT_DIALOG_DATA) public data: DocumentUploadDialogData) {}

  ngOnInit(): void {
    if (this.data.documentType) {
      this.documentType = this.data.documentType;
      this.lockDocumentType = true;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.type !== 'application/pdf') {
        this.notificationService.error('Please select a PDF file');
        return;
      }
      this.selectedFile = file;
      this.uploadDocument();
    }
  }

  uploadDocument(): void {
    if (!this.selectedFile) return;

    this.uploading = true;
    this.cdr.markForCheck();

    this.uploadService
      .uploadDocument(this.data.companyId, this.selectedFile, this.documentType)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.parsedData = data;
          this.initializeForm(data);
          this.uploading = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Upload failed:', error);
          this.notificationService.error(
            'Failed to parse document. Please try again.'
          );
          this.uploading = false;
          this.cdr.markForCheck();
        },
      });
  }

  private parseSafeDate(value: string | null): Date {
    if (!value) return new Date();
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date() : d;
  }

  private initializeForm(data: ParsedDocumentData): void {
    this.form = this.fb.group({
      title: [
        data.documentNumber
          ? `${data.documentType} ${data.documentNumber}`
          : data.documentType,
        [Validators.required, Validators.maxLength(255)],
      ],
      documentDate: [
        this.parseSafeDate(data.documentDate),
        Validators.required,
      ],
      dueDate: [data.dueDate ? this.parseSafeDate(data.dueDate) : null],
      notes: [data.notes ?? '', Validators.maxLength(2000)],
      lineItems: this.fb.array([]),
    });

    if (data.lineItems && data.lineItems.length > 0) {
      for (const li of data.lineItems) {
        const item = this.fb.group({
          sortOrder: [this.lineItems.length],
          service: [li.service ?? '', Validators.maxLength(500)],
          description: [li.description ?? '', Validators.maxLength(1000)],
          quantity: [li.quantity != null && li.quantity > 0 ? li.quantity : 1, [Validators.required, Validators.min(0.01)]],
          rate: [li.rate ?? 0, [Validators.required, Validators.min(0)]],
        });
        this.lineItems.push(item);
      }
    } else {
      this.addLineItem();
    }
  }

  get lineItems(): FormArray {
    return this.form?.get('lineItems') as FormArray;
  }

  get total(): number {
    if (!this.form) return 0;
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
      description: ['', Validators.maxLength(1000)],
      quantity: [1, [Validators.required, Validators.min(0.01)]],
      rate: [0, [Validators.required, Validators.min(0)]],
    });
    this.lineItems.push(item);
    this.cdr.markForCheck();
  }

  removeLineItem(index: number): void {
    this.lineItems.removeAt(index);
    this.lineItems.controls.forEach((ctrl, i) => {
      ctrl.get('sortOrder')?.setValue(i);
    });
    this.cdr.markForCheck();
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (!this.form) return;

    // Validate that there is at least one line item
    if (this.lineItems.length === 0) {
      alert(`Please add at least one line item before creating the ${this.documentType.toLowerCase()}.`);
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

    const v = this.form.getRawValue();

    // Validate due date is not before document date
    if (v.documentDate && v.dueDate) {
      const docDate = v.documentDate instanceof Date ? v.documentDate : new Date(v.documentDate);
      const dueDate = v.dueDate instanceof Date ? v.dueDate : new Date(v.dueDate);

      if (dueDate < docDate) {
        alert('Due date cannot be before the document date.');
        return;
      }
    }

    // Validate that total is greater than 0
    if (this.total <= 0) {
      alert(`${this.documentType} total must be greater than $0. Please add items with valid quantities and rates.`);
      return;
    }

    const docDate: Date = v.documentDate instanceof Date ? v.documentDate : new Date();

    if (this.documentType === 'ESTIMATE') {
      const payload: CreateEstimateInput = {
        clientId: this.data.clientId,
        title: (v.title ?? this.documentType).trim().substring(0, 255) || this.documentType,
        estimateDate: this.formatDate(docDate),
        notes: v.notes?.trim().substring(0, 2000) || null,
        lineItems: (v.lineItems ?? []).map((item: any, index: number) => ({
          sortOrder: index,
          service: item.service?.trim().substring(0, 500) || undefined,
          description: (item.description ?? '').trim().substring(0, 1000),
          quantity: parseFloat(item.quantity) || 1,
          rate: parseFloat(item.rate) || 0,
        })),
      };
      this.dialogRef.close({ mode: 'estimate', payload });
    } else {
      const payload: CreateInvoiceInput = {
        clientId: this.data.clientId,
        title: (v.title ?? this.documentType).trim().substring(0, 255) || this.documentType,
        notes: v.notes?.trim().substring(0, 2000) || undefined,
        items: (v.lineItems ?? []).map((item: any, index: number) => ({
          sortOrder: index,
          service: item.service?.trim().substring(0, 500) || undefined,
          description: (item.description ?? '').trim().substring(0, 1000),
          quantity: parseFloat(item.quantity) || 1,
          unitPrice: parseFloat(item.rate) || 0,
        })),
      };
      this.dialogRef.close({ mode: 'invoice', payload });
    }
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getErrorMessage(controlName: string, index?: number): string {
    const control =
      index !== undefined
        ? this.lineItems.at(index).get(controlName)
        : this.form?.get(controlName);

    if (!control || !control.errors) return '';

    if (control.errors['required']) return 'This field is required';
    if (control.errors['maxLength'])
      return `Maximum ${control.errors['maxLength'].requiredLength} characters`;
    if (control.errors['min'])
      return `Minimum value is ${control.errors['min'].min}`;

    return '';
  }
}

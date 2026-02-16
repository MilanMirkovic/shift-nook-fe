import { Component, inject, ChangeDetectionStrategy, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';

import { selectClients } from '../../../store/clients/clients.selectors';
import { loadClients } from '../../../store/clients/clients.actions';
import { selectSelectedCompanyId } from '../../../store/user/user.selectors';

export interface JobsiteDialogData {
  jobsite?: {
    id: string;
    name: string;
    address: string;
    clientId: string;
    latitude: number;
    longitude: number;
  };
  clientId?: string;
  clientName?: string;
  mode?: 'create' | 'edit';
}

@Component({
  selector: 'app-jobsite-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './jobsite-dialog.component.html',
  styleUrls: ['./jobsite-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobsiteDialogComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<JobsiteDialogComponent>);
  private readonly store = inject(Store);
  private readonly destroy$ = new Subject<void>();

  protected readonly jobsiteForm: FormGroup;
  protected submitting = false;
  protected readonly clients$ = this.store.select(selectClients);
  protected readonly isClientPreSelected: boolean;
  protected readonly isEditMode: boolean;

  constructor(@Inject(MAT_DIALOG_DATA) public data: JobsiteDialogData | null) {
    this.isEditMode = data?.mode === 'edit' || !!data?.jobsite;
    this.isClientPreSelected = !!data?.clientId || this.isEditMode;

    this.jobsiteForm = this.fb.group({
      name: [data?.jobsite?.name || '', [Validators.required, Validators.minLength(2)]],
      address: [data?.jobsite?.address || '', [Validators.required, Validators.minLength(5)]],
      clientId: [
        {
          value: data?.jobsite?.clientId || data?.clientId || '',
          disabled: this.isClientPreSelected
        },
        Validators.required
      ],
      latitude: [data?.jobsite?.latitude || 0],
      longitude: [data?.jobsite?.longitude || 0]
    });
  }

  ngOnInit(): void {
    // Load clients for the dropdown (only if client is not pre-selected)
    if (!this.isClientPreSelected) {
      this.store.select(selectSelectedCompanyId)
        .pipe(takeUntil(this.destroy$))
        .subscribe(companyId => {
          if (companyId) {
            this.store.dispatch(loadClients({ companyId, page: 0, size: 100 }));
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.jobsiteForm.valid) {
      // Get raw value to include disabled fields
      const formValue = this.jobsiteForm.getRawValue();

      if (this.isEditMode && this.data?.jobsite) {
        // Return both the jobsite ID and the updated data
        this.dialogRef.close({
          id: this.data.jobsite.id,
          ...formValue
        });
      } else {
        // Create mode - ensure lat/long are set
        this.dialogRef.close({
          ...formValue,
          latitude: formValue.latitude || 0,
          longitude: formValue.longitude || 0
        });
      }
    } else {
      this.jobsiteForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getErrorMessage(fieldName: string): string {
    const control = this.jobsiteForm.get(fieldName);
    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) return `${this.getFieldLabel(fieldName)} is required`;
    if (control.errors['minLength']) return `${this.getFieldLabel(fieldName)} must be at least ${control.errors['minLength'].requiredLength} characters`;
    if (control.errors['min']) return `Must be at least ${control.errors['min'].min}`;
    if (control.errors['max']) return `Must be at most ${control.errors['max'].max}`;

    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Name',
      address: 'Address',
      clientId: 'Client'
    };
    return labels[fieldName] || fieldName;
  }
}

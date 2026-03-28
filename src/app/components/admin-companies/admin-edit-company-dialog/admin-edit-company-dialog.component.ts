import { Component, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { take } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

import {
  updateAdminCompany,
  updateAdminCompanySuccess,
  updateAdminCompanyFailure,
} from '../../../store/admin-companies/admin-companies.actions';
import { AdminCompany } from '../../../store/admin-companies/admin-companies.models';

export interface EditCompanyDialogData {
  company: AdminCompany;
}

@Component({
  selector: 'app-admin-edit-company-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './admin-edit-company-dialog.component.html',
  styleUrls: ['./admin-edit-company-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminEditCompanyDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<AdminEditCompanyDialogComponent>);
  private readonly data = inject<EditCompanyDialogData>(MAT_DIALOG_DATA);
  private readonly store = inject(Store);
  private readonly actions$ = inject(Actions);
  private readonly cdr = inject(ChangeDetectorRef);

  protected submitting = false;
  protected serverError: string | null = null;

  protected readonly form: FormGroup = this.fb.group({
    name:    [this.data.company.name,    [Validators.required, Validators.minLength(2)]],
    email:   [this.data.company.email   ?? '', [Validators.email]],
    phone:   [this.data.company.phone   ?? ''],
    address: [this.data.company.address ?? ''],
    website: [this.data.company.website ?? ''],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.serverError = null;

    const { name, email, phone, address, website } = this.form.value;

    this.store.dispatch(updateAdminCompany({
      companyId: this.data.company.id,
      request: {
        name,
        email:   email   || null,
        phone:   phone   || null,
        address: address || null,
        website: website || null,
      },
    }));

    this.actions$.pipe(ofType(updateAdminCompanySuccess), take(1)).subscribe(() => {
      this.submitting = false;
      this.dialogRef.close(true);
    });

    this.actions$.pipe(ofType(updateAdminCompanyFailure), take(1)).subscribe(({ error }) => {
      this.submitting = false;
      this.serverError = error;
      this.cdr.markForCheck();
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}


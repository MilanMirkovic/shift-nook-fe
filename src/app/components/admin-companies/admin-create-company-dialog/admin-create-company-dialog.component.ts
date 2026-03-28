import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { take } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

import {
  createAdminCompany,
  createAdminCompanySuccess,
  createAdminCompanyFailure,
} from '../../../store/admin-companies/admin-companies.actions';

@Component({
  selector: 'app-admin-create-company-dialog',
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
  templateUrl: './admin-create-company-dialog.component.html',
  styleUrls: ['./admin-create-company-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCreateCompanyDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<AdminCreateCompanyDialogComponent>);
  private readonly store = inject(Store);
  private readonly actions$ = inject(Actions);

  protected submitting = false;
  protected serverError: string | null = null;

  protected readonly form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(1)]],
    email: ['', [Validators.email]],
    phone: [''],
    address: [''],
    website: [''],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.serverError = null;

    const value = this.form.value;
    this.store.dispatch(createAdminCompany({
      request: {
        name: value.name,
        email: value.email || undefined,
        phone: value.phone || undefined,
        address: value.address || undefined,
        website: value.website || undefined,
      },
    }));

    this.actions$.pipe(ofType(createAdminCompanySuccess), take(1)).subscribe(() => {
      this.submitting = false;
      this.dialogRef.close(true);
    });

    this.actions$.pipe(ofType(createAdminCompanyFailure), take(1)).subscribe(({ error }) => {
      this.submitting = false;
      this.serverError = error;
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getErrorMessage(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (!control || !control.errors || !control.touched) return '';
    if (control.errors['required']) return `${this.fieldLabel(fieldName)} is required`;
    if (control.errors['email']) return 'Please enter a valid email address';
    if (control.errors['minlength']) return `${this.fieldLabel(fieldName)} is too short`;
    return '';
  }

  private fieldLabel(name: string): string {
    const labels: Record<string, string> = {
      name: 'Company name',
      email: 'Email',
      phone: 'Phone',
      address: 'Address',
      website: 'Website',
    };
    return labels[name] || name;
  }
}


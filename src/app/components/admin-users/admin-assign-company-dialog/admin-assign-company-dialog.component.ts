import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { take } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

import { CompanyRole } from '../../../shared/models/company-role';
import {
  assignAdminUserCompany,
  assignAdminUserCompanySuccess,
  assignAdminUserCompanyFailure,
} from '../../../store/admin-users/admin-users.actions';

export interface AssignCompanyDialogData {
  userId: string;
}

const COMPANY_ROLES: CompanyRole[] = [
  CompanyRole.OWNER,
  CompanyRole.ADMIN,
  CompanyRole.ACCOUNTANT,
  CompanyRole.WORKER,
  CompanyRole.SUBCONTRACTOR,
];

@Component({
  selector: 'app-admin-assign-company-dialog',
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
    MatIconModule,
  ],
  templateUrl: './admin-assign-company-dialog.component.html',
  styleUrls: ['./admin-assign-company-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAssignCompanyDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<AdminAssignCompanyDialogComponent>);
  private readonly data: AssignCompanyDialogData = inject(MAT_DIALOG_DATA);
  private readonly store = inject(Store);
  private readonly actions$ = inject(Actions);

  readonly companyRoles = COMPANY_ROLES;
  protected submitting = false;
  protected serverError: string | null = null;

  protected readonly form: FormGroup = this.fb.group({
    companyId: ['', [Validators.required]],
    role: [CompanyRole.WORKER, [Validators.required]],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.serverError = null;

    const { companyId, role } = this.form.value;
    this.store.dispatch(
      assignAdminUserCompany({
        userId: this.data.userId,
        request: { companyId, role },
      })
    );

    this.actions$.pipe(ofType(assignAdminUserCompanySuccess), take(1)).subscribe(() => {
      this.submitting = false;
      this.dialogRef.close(true);
    });

    this.actions$.pipe(ofType(assignAdminUserCompanyFailure), take(1)).subscribe(({ error }) => {
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
    if (control.errors['required']) return `${fieldName === 'companyId' ? 'Company ID' : 'Role'} is required`;
    return '';
  }
}


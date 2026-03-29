import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { take } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

import { USER_ROLES } from '../../../shared/models/user-role';
import { createAdminUser, createAdminUserSuccess, createAdminUserFailure } from '../../../store/admin-users/admin-users.actions';

@Component({
  selector: 'app-admin-create-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './admin-create-user-dialog.component.html',
  styleUrls: ['./admin-create-user-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCreateUserDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<AdminCreateUserDialogComponent>);
  private readonly store = inject(Store);
  private readonly actions$ = inject(Actions);

  readonly roles = USER_ROLES;
  protected submitting = false;
  protected serverError: string | null = null;

  protected readonly form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    firstName: ['', [Validators.required, Validators.minLength(1)]],
    lastName: ['', [Validators.required, Validators.minLength(1)]],
    role: ['WORKER', [Validators.required]],
    canCreateCompany: [false],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.serverError = null;

    this.store.dispatch(createAdminUser({ request: this.form.value }));

    // Listen for success or failure
    this.actions$.pipe(ofType(createAdminUserSuccess), take(1)).subscribe(() => {
      this.submitting = false;
      this.dialogRef.close(true);
    });

    this.actions$.pipe(ofType(createAdminUserFailure), take(1)).subscribe(({ error }) => {
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
      email: 'Email',
      firstName: 'First name',
      lastName: 'Last name',
      role: 'Role',
      canCreateCompany: 'Can create company',
    };
    return labels[name] || name;
  }
}

import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { take } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

import { UserRole, USER_ROLES } from '../../../shared/models/user-role';
import {
  updateAdminUserRole,
  updateAdminUserRoleSuccess,
  updateAdminUserRoleFailure,
} from '../../../store/admin-users/admin-users.actions';

export interface ChangeRoleDialogData {
  userId: string;
  currentRole: UserRole;
}

@Component({
  selector: 'app-admin-change-role-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './admin-change-role-dialog.component.html',
  styleUrls: ['./admin-change-role-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminChangeRoleDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<AdminChangeRoleDialogComponent>);
  private readonly data: ChangeRoleDialogData = inject(MAT_DIALOG_DATA);
  private readonly store = inject(Store);
  private readonly actions$ = inject(Actions);

  readonly roles = USER_ROLES;
  readonly currentRole = this.data.currentRole;
  protected submitting = false;
  protected serverError: string | null = null;

  protected readonly form: FormGroup = this.fb.group({
    role: [this.data.currentRole, [Validators.required]],
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    const newRole = this.form.value.role as UserRole;
    if (newRole === this.data.currentRole) {
      this.dialogRef.close();
      return;
    }

    this.submitting = true;
    this.serverError = null;

    this.store.dispatch(updateAdminUserRole({ userId: this.data.userId, role: newRole }));

    this.actions$.pipe(ofType(updateAdminUserRoleSuccess), take(1)).subscribe(() => {
      this.submitting = false;
      this.dialogRef.close(true);
    });

    this.actions$.pipe(ofType(updateAdminUserRoleFailure), take(1)).subscribe(({ error }) => {
      this.submitting = false;
      this.serverError = error;
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}


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

import { Client } from '../../../../store/clients/clients.models';
import {
  updateClient,
  updateClientSuccess,
  updateClientFailure,
} from '../../../../store/clients/clients.actions';

export interface EditClientDialogData {
  client: Client;
  companyId: string;
}

@Component({
  selector: 'app-edit-client-dialog',
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
  templateUrl: './edit-client-dialog.component.html',
  styleUrls: ['./edit-client-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditClientDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<EditClientDialogComponent>);
  private readonly data = inject<EditClientDialogData>(MAT_DIALOG_DATA);
  private readonly store = inject(Store);
  private readonly actions$ = inject(Actions);
  private readonly cdr = inject(ChangeDetectorRef);

  protected submitting = false;
  protected serverError: string | null = null;

  protected readonly form: FormGroup = this.fb.group({
    name:    [this.data.client.name,    [Validators.required, Validators.minLength(2)]],
    email:   [this.data.client.email ?? '', [Validators.required, Validators.email]],
    phone:   [this.data.client.phone   ?? ''],
    address: [this.data.client.address ?? ''],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.serverError = null;

    const { name, email, phone, address } = this.form.value;

    this.store.dispatch(updateClient({
      companyId: this.data.companyId,
      clientId: this.data.client.id!,
      client: {
        name,
        email,
        phone:   phone   || undefined,
        address: address || undefined,
      },
    }));

    this.actions$.pipe(ofType(updateClientSuccess), take(1)).subscribe(() => {
      this.submitting = false;
      this.dialogRef.close(true);
    });

    this.actions$.pipe(ofType(updateClientFailure), take(1)).subscribe(({ error }) => {
      this.submitting = false;
      this.serverError = error;
      this.cdr.markForCheck();
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}


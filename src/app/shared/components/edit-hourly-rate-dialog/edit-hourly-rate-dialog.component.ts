import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { CompanyMember } from '../../../store/company-members/company-members.models';

export interface EditHourlyRateDialogData {
  member: CompanyMember;
}

@Component({
  selector: 'app-edit-hourly-rate-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  template: `
    <div style="padding: 8px 0">
      <h2 mat-dialog-title style="display:flex;align-items:center;gap:8px">
        <mat-icon>payments</mat-icon>
        Edit Hourly Rate
      </h2>

      <mat-dialog-content>
        <p style="color: var(--mat-sys-on-surface-variant); margin-bottom: 16px;">
          Set the hourly billing rate for
          <strong>{{ data.member.firstName }} {{ data.member.lastName }}</strong>.
        </p>

        <form [formGroup]="form">
          <mat-form-field appearance="outline" style="width:100%">
            <mat-label>Hourly Rate</mat-label>
            <mat-icon matPrefix>attach_money</mat-icon>
            <input matInput type="number" min="0" step="0.01" formControlName="hourlyRate"
                   placeholder="e.g. 25.00" />
            @if (form.get('hourlyRate')?.hasError('required') && form.get('hourlyRate')?.touched) {
              <mat-error>Hourly rate is required</mat-error>
            }
            @if (form.get('hourlyRate')?.hasError('min') && form.get('hourlyRate')?.touched) {
              <mat-error>Hourly rate must be 0 or greater</mat-error>
            }
          </mat-form-field>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-stroked-button (click)="onCancel()">Cancel</button>
        <button mat-flat-button color="primary" (click)="onSave()" [disabled]="form.invalid">
          Save Rate
        </button>
      </mat-dialog-actions>
    </div>
  `,
})
export class EditHourlyRateDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<EditHourlyRateDialogComponent>);
  readonly data = inject<EditHourlyRateDialogData>(MAT_DIALOG_DATA);

  readonly form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      hourlyRate: [this.data.member.hourlyRate ?? 0, [Validators.required, Validators.min(0)]]
    });
  }

  onSave(): void {
    if (this.form.valid) {
      this.dialogRef.close(Number(this.form.value.hourlyRate));
    } else {
      this.form.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}


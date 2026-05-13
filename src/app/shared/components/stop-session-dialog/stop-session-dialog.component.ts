import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

export interface StopSessionDialogData {
  currentCompanyName?: string;
  newCompanyName?: string;
  actionType?: 'switch-company' | 'sign-out';
}

export interface StopSessionDialogResult {
  confirmed: boolean;
  description?: string;
}

@Component({
  selector: 'app-stop-session-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './stop-session-dialog.component.html',
  styleUrls: ['./stop-session-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StopSessionDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<StopSessionDialogComponent>);
  protected readonly data = inject<StopSessionDialogData>(MAT_DIALOG_DATA);

  protected readonly form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      description: ['']
    });
  }

  get isSignOut(): boolean {
    return this.data.actionType === 'sign-out';
  }

  get dialogIcon(): string {
    return this.isSignOut ? 'logout' : 'swap_horiz';
  }

  get dialogTitle(): string {
    return this.isSignOut ? 'Sign Out' : 'Switch Client';
  }

  get dialogMessage(): string {
    const companyName = this.data.currentCompanyName
      ? ` with <strong>${this.data.currentCompanyName}</strong>`
      : '';

    if (this.isSignOut) {
      return `Are you sure you want to sign out? Your current session${companyName} will be stopped.`;
    }
    return `Are you sure you want to switch clients? Your current session${companyName} will be stopped.`;
  }

  get confirmButtonText(): string {
    return this.isSignOut ? 'Sign Out' : 'Switch Client';
  }

  onConfirm(): void {
    const result: StopSessionDialogResult = {
      confirmed: true,
      description: this.form.get('description')?.value || undefined
    };
    this.dialogRef.close(result);
  }

  onCancel(): void {
    const result: StopSessionDialogResult = {
      confirmed: false
    };
    this.dialogRef.close(result);
  }
}


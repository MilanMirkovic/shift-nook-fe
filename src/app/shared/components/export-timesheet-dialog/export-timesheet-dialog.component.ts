import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface ExportTimesheetDialogResult {
  from: Date;
  to: Date;
}

@Component({
  selector: 'app-export-timesheet-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './export-timesheet-dialog.component.html',
  styleUrls: ['./export-timesheet-dialog.component.scss'],
})
export class ExportTimesheetDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ExportTimesheetDialogComponent>);

  fromDate: Date | null = null;
  toDate: Date | null = null;

  get isValid(): boolean {
    return !!this.fromDate && !!this.toDate && this.toDate >= this.fromDate;
  }

  onExport(): void {
    if (!this.isValid) return;
    this.dialogRef.close({ from: this.fromDate!, to: this.toDate! } as ExportTimesheetDialogResult);
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}


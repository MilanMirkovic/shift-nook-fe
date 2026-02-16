import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { JobsiteTask } from '../../../store/jobsite-tasks/jobsite-tasks.models';

export interface JobsiteTaskDialogData {
  jobsiteId: string;
  jobsiteName?: string;
  task?: JobsiteTask;
}

@Component({
  selector: 'app-jobsite-task-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './jobsite-task-dialog.component.html',
  styleUrls: ['./jobsite-task-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobsiteTaskDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<JobsiteTaskDialogComponent>);
  protected readonly data = inject<JobsiteTaskDialogData>(MAT_DIALOG_DATA);

  protected readonly taskForm: FormGroup;
  protected submitting = false;
  protected isEditMode: boolean;

  constructor() {
    this.isEditMode = !!this.data.task;

    this.taskForm = this.fb.group({
      jobsiteId: [this.data.jobsiteId, [Validators.required]],
      name: [this.data.task?.name || '', [Validators.required, Validators.minLength(3)]],
      description: [this.data.task?.description || '']
    });
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      this.dialogRef.close(this.taskForm.value);
    } else {
      this.taskForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getErrorMessage(fieldName: string): string {
    const control = this.taskForm.get(fieldName);
    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) return `${this.getFieldLabel(fieldName)} is required`;
    if (control.errors['minLength']) return `${this.getFieldLabel(fieldName)} must be at least 3 characters`;

    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Task Name',
      description: 'Description'
    };
    return labels[fieldName] || fieldName;
  }
}

import { Component, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { JobsiteTask, TaskTimesheet, TaskReviewDetails } from '../../../store/jobsite-tasks/jobsite-tasks.models';
import { JobsiteTasksApi } from '../../../store/jobsite-tasks/jobsite-tasks.api';
import { finalize } from 'rxjs/operators';

export interface TaskReviewDialogData {
  companyId: string;
  jobsiteId: string;
  jobsiteName: string;
  task: JobsiteTask;
}

export interface TaskReviewDialogResult {
  action: 'approved' | 'rejected';
  task: JobsiteTask;
}

@Component({
  selector: 'app-task-review-dialog',
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
    MatDividerModule,
    MatExpansionModule,
    MatTooltipModule,
    MatChipsModule,
    MatCheckboxModule
  ],
  templateUrl: './task-review-dialog.component.html',
  styleUrls: ['./task-review-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskReviewDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<TaskReviewDialogComponent>);
  private readonly jobsiteTasksApi = inject(JobsiteTasksApi);
  protected readonly data = inject<TaskReviewDialogData>(MAT_DIALOG_DATA);

  // State signals
  protected loading = signal(true);
  protected submitting = signal(false);
  protected error = signal<string | null>(null);
  protected showRejectForm = signal(false);
  protected markAsCompleted = signal(true); // Default to marking as completed

  // Data
  protected timesheets = signal<TaskTimesheet[]>([]);
  protected totalDuration = signal(0);

  // Form for rejection reason
  protected rejectForm: FormGroup;

  constructor() {
    this.rejectForm = this.fb.group({
      rejectionReason: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.loadTaskDetails();
  }

  private loadTaskDetails(): void {
    this.loading.set(true);
    this.error.set(null);

    this.jobsiteTasksApi.getTaskReviewDetails(
      this.data.companyId,
      this.data.jobsiteId,
      this.data.task.id
    ).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: (details: TaskReviewDetails) => {
        this.timesheets.set(details.timesheets || []);
        this.totalDuration.set(details.totalDurationMinutes || 0);
      },
      error: (err) => {
        console.error('Error loading task review details:', err);
        // If the API doesn't exist yet, we'll work with task data only
        this.error.set(null); // Don't show error, just work with available data
        this.timesheets.set([]);
        this.totalDuration.set(0);
      }
    });
  }

  protected onApprove(): void {
    this.submitting.set(true);
    this.error.set(null);

    this.jobsiteTasksApi.approveTask(
      this.data.companyId,
      this.data.jobsiteId,
      this.data.task.id,
      {
        markAsCompleted: this.markAsCompleted()
      }
    ).pipe(
      finalize(() => this.submitting.set(false))
    ).subscribe({
      next: (updatedTask) => {
        this.dialogRef.close({
          action: 'approved',
          task: updatedTask
        } as TaskReviewDialogResult);
      },
      error: (err) => {
        console.error('Error approving task:', err);
        this.error.set('Failed to approve task. Please try again.');
      }
    });
  }

  protected onShowRejectForm(): void {
    this.showRejectForm.set(true);
  }

  protected onCancelReject(): void {
    this.showRejectForm.set(false);
    this.rejectForm.reset();
  }

  protected onReject(): void {
    if (this.rejectForm.invalid) {
      this.rejectForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    this.jobsiteTasksApi.requestMoreWork(
      this.data.companyId,
      this.data.jobsiteId,
      this.data.task.id,
      { rejectionReason: this.rejectForm.get('rejectionReason')?.value }
    ).pipe(
      finalize(() => this.submitting.set(false))
    ).subscribe({
      next: (updatedTask) => {
        this.dialogRef.close({
          action: 'rejected',
          task: updatedTask
        } as TaskReviewDialogResult);
      },
      error: (err) => {
        console.error('Error requesting more work:', err);
        this.error.set('Failed to send feedback. Please try again.');
      }
    });
  }

  protected onCancel(): void {
    this.dialogRef.close();
  }

  protected formatDuration(minutes: number): string {
    if (!minutes || minutes <= 0) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  }

  protected formatDateTime(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  protected formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  protected getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING_REVIEW':
        return 'status-pending';
      case 'IN_PROGRESS':
        return 'status-progress';
      case 'COMPLETED':
        return 'status-completed';
      case 'CANCELLED':
        return 'status-cancelled';
      default:
        return 'status-open';
    }
  }

  protected getStatusLabel(status: string): string {
    switch (status) {
      case 'PENDING_REVIEW':
        return 'Pending Review';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'COMPLETED':
        return 'Completed';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return 'Open';
    }
  }

  protected onMarkAsCompletedChange(checked: boolean): void {
    this.markAsCompleted.set(checked);
  }
}

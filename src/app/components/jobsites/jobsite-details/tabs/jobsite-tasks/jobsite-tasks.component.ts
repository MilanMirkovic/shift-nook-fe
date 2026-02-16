import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Jobsite } from '../../../../../store/jobsites/jobsites.models';
import { JobsiteTask } from '../../../../../store/jobsite-tasks/jobsite-tasks.models';
import { JobsiteDetailsHelpers } from '../../jobsite-details.helpers';

@Component({
  selector: 'app-jobsite-tasks',
  standalone: false,
  templateUrl: './jobsite-tasks.component.html',
  styleUrls: ['./jobsite-tasks.component.scss']
})
export class JobsiteTasksComponent {
  @Input() jobsite!: Jobsite;
  @Input() tasks$!: Observable<JobsiteTask[]>;
  @Input() tasksLoading$!: Observable<boolean>;
  @Input() canManageJobsites$!: Observable<boolean>;
  @Input() filteredTaskId: string | null = null;

  @Output() addTask = new EventEmitter<void>();
  @Output() editTask = new EventEmitter<JobsiteTask>();
  @Output() deleteTask = new EventEmitter<JobsiteTask>();
  @Output() reviewTask = new EventEmitter<JobsiteTask>();
  @Output() clearFilter = new EventEmitter<void>();

  /**
   * Returns filtered tasks based on filteredTaskId
   */
  get filteredTasks$(): Observable<JobsiteTask[]> {
    if (!this.filteredTaskId) {
      return this.tasks$;
    }
    return this.tasks$.pipe(
      map(tasks => tasks.filter(task => task.id === this.filteredTaskId))
    );
  }

  getTaskCategoryClass(status: string): string {
    return JobsiteDetailsHelpers.getTaskCategoryClass(status);
  }

  getTaskBadgeClass(status: string): string {
    return JobsiteDetailsHelpers.getTaskBadgeClass(status);
  }

  getTaskIcon(status: string): string {
    return JobsiteDetailsHelpers.getTaskIcon(status);
  }

  getStatusLabel(status: string): string {
    return JobsiteDetailsHelpers.getStatusLabel(status);
  }

  isPendingReview(task: JobsiteTask): boolean {
    return task.status === 'PENDING_REVIEW';
  }

  onAddTask(): void {
    this.addTask.emit();
  }

  onEditTask(task: JobsiteTask): void {
    this.editTask.emit(task);
  }

  onDeleteTask(task: JobsiteTask): void {
    this.deleteTask.emit(task);
  }

  onReviewTask(task: JobsiteTask): void {
    this.reviewTask.emit(task);
  }

  onClearFilter(): void {
    this.clearFilter.emit();
  }
}

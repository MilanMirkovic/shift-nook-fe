import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import {
  selectJobsiteTasks,
  selectSelectedTask,
  selectJobsiteTasksLoading,
  selectJobsiteTaskLoadingById,
  selectJobsiteTaskCreating,
  selectJobsiteTaskUpdating,
  selectJobsiteTasksError,
  selectJobsiteTasksTotal,
  selectJobsiteTasksPage,
  selectJobsiteTasksSize,
  selectJobsiteTaskById,
  selectTasksByJobsiteId
} from './jobsite-tasks.selectors';
import {
  loadJobsiteTasks,
  loadJobsiteTaskById,
  createJobsiteTask,
  updateJobsiteTask,
  deleteJobsiteTask,
  updatePage,
  clearJobsiteTasks
} from './jobsite-tasks.actions';
import { JobsiteTask, CreateJobsiteTaskRequest, UpdateJobsiteTaskRequest } from './jobsite-tasks.models';

@Injectable({ providedIn: 'root' })
export class JobsiteTasksStoreService {
  private readonly store = inject(Store);

  // Observables
  readonly tasks$ = this.store.select(selectJobsiteTasks);
  readonly selectedTask$ = this.store.select(selectSelectedTask);
  readonly loading$ = this.store.select(selectJobsiteTasksLoading);
  readonly loadingById$ = this.store.select(selectJobsiteTaskLoadingById);
  readonly creating$ = this.store.select(selectJobsiteTaskCreating);
  readonly updating$ = this.store.select(selectJobsiteTaskUpdating);
  readonly error$ = this.store.select(selectJobsiteTasksError);
  readonly total$ = this.store.select(selectJobsiteTasksTotal);
  readonly page$ = this.store.select(selectJobsiteTasksPage);
  readonly size$ = this.store.select(selectJobsiteTasksSize);

  /**
   * Load tasks for a specific jobsite
   */
  loadJobsiteTasks(companyId: string, jobsiteId: string): void {
    this.store.dispatch(loadJobsiteTasks({ companyId, jobsiteId }));
  }

  /**
   * Load a single task by ID
   */
  loadJobsiteTaskById(companyId: string, jobsiteId: string, taskId: string): void {
    this.store.dispatch(loadJobsiteTaskById({ companyId, jobsiteId, taskId }));
  }

  /**
   * Create a new jobsite task
   */
  createJobsiteTask(companyId: string, task: CreateJobsiteTaskRequest): void {
    this.store.dispatch(createJobsiteTask({ companyId, task }));
  }

  /**
   * Update a jobsite task
   */
  updateJobsiteTask(companyId: string, jobsiteId: string, taskId: string, updateData: UpdateJobsiteTaskRequest): void {
    this.store.dispatch(updateJobsiteTask({ companyId, jobsiteId, taskId, updateData }));
  }

  /**
   * Delete a jobsite task
   */
  deleteJobsiteTask(companyId: string, jobsiteId: string, taskId: string): void {
    this.store.dispatch(deleteJobsiteTask({ companyId, jobsiteId, taskId }));
  }

  /**
   * Update pagination
   */
  updatePage(page: number, size: number): void {
    this.store.dispatch(updatePage({ page, size }));
  }

  /**
   * Clear tasks from state
   */
  clearJobsiteTasks(): void {
    this.store.dispatch(clearJobsiteTasks());
  }

  /**
   * Get a specific task by ID (returns Observable)
   */
  getJobsiteTaskById(id: string): Observable<JobsiteTask | undefined> {
    return this.store.select(selectJobsiteTaskById(id));
  }

  /**
   * Get all tasks
   */
  getTasks(): Observable<JobsiteTask[]> {
    return this.tasks$;
  }

  /**
   * Get tasks for a specific jobsite
   */
  getTasksByJobsiteId(jobsiteId: string): Observable<JobsiteTask[]> {
    return this.store.select(selectTasksByJobsiteId(jobsiteId));
  }

  /**
   * Get the currently selected task
   */
  getSelectedTask(): Observable<JobsiteTask | null> {
    return this.selectedTask$;
  }
}


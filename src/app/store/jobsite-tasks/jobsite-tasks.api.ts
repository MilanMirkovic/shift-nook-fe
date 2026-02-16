import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { JobsiteTask, CreateJobsiteTaskRequest, UpdateJobsiteTaskRequest, TaskTimesheet, TaskReviewDetails, ApproveTaskRequest, RejectTaskRequest } from './jobsite-tasks.models';

@Injectable({ providedIn: 'root' })
export class JobsiteTasksApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/companies`;

  /**
   * Get tasks for a specific jobsite
   */
  getJobsiteTasks(companyId: string, jobsiteId: string): Observable<{ items: JobsiteTask[]; total: number }> {
    return this.http.get<JobsiteTask[]>(
      `${this.baseUrl}/${companyId}/jobsites/${jobsiteId}/tasks`
    ).pipe(
      map(tasks => ({
        items: tasks || [],
        total: tasks?.length || 0
      }))
    );
  }

  /**
   * Get a single task by ID
   */
  getJobsiteTaskById(companyId: string, jobsiteId: string, taskId: string): Observable<JobsiteTask> {
    return this.http.get<JobsiteTask>(
      `${this.baseUrl}/${companyId}/jobsites/${jobsiteId}/tasks/${taskId}`
    );
  }

  /**
   * Create a new jobsite task
   */
  createJobsiteTask(companyId: string, task: CreateJobsiteTaskRequest): Observable<JobsiteTask> {
    return this.http.post<JobsiteTask>(
      `${this.baseUrl}/${companyId}/jobsites/${task.jobsiteId}/tasks`,
      task
    );
  }

  /**
   * Update a jobsite task
   */
  updateJobsiteTask(
    companyId: string,
    jobsiteId: string,
    taskId: string,
    updateData: UpdateJobsiteTaskRequest
  ): Observable<JobsiteTask> {
    return this.http.put<JobsiteTask>(
      `${this.baseUrl}/${companyId}/jobsites/${jobsiteId}/tasks/${taskId}`,
      updateData
    );
  }

  /**
   * Delete a jobsite task
   */
  deleteJobsiteTask(companyId: string, jobsiteId: string, taskId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/${companyId}/jobsites/${jobsiteId}/tasks/${taskId}`
    );
  }

  /**
   * Get task review details including timesheets
   */
  getTaskReviewDetails(companyId: string, jobsiteId: string, taskId: string): Observable<TaskReviewDetails> {
    return this.http.get<TaskReviewDetails>(
      `${this.baseUrl}/${companyId}/jobsites/${jobsiteId}/tasks/${taskId}/review`
    );
  }

  /**
   * Get timesheets for a specific task
   */
  getTaskTimesheets(companyId: string, jobsiteId: string, taskId: string): Observable<TaskTimesheet[]> {
    return this.http.get<TaskTimesheet[]>(
      `${this.baseUrl}/${companyId}/jobsites/${jobsiteId}/tasks/${taskId}/timesheets`
    );
  }

  /**
   * Review a task - approve or reject with notes
   */
  reviewTask(companyId: string, jobsiteId: string, taskId: string, approved: boolean, notes?: string, markAsCompleted?: boolean): Observable<JobsiteTask> {
    return this.http.post<JobsiteTask>(
      `${this.baseUrl}/${companyId}/jobsites/${jobsiteId}/tasks/${taskId}/review`,
      { approved, notes, markAsCompleted }
    );
  }

  /**
   * Approve a task - marks task as approved (COMPLETED or OPEN based on markAsCompleted)
   */
  approveTask(companyId: string, jobsiteId: string, taskId: string, request?: ApproveTaskRequest): Observable<JobsiteTask> {
    return this.reviewTask(companyId, jobsiteId, taskId, true, request?.approvalNotes, request?.markAsCompleted);
  }

  /**
   * Request more work on a task - rejects and sends back to worker with notes
   */
  requestMoreWork(companyId: string, jobsiteId: string, taskId: string, request: RejectTaskRequest): Observable<JobsiteTask> {
    return this.reviewTask(companyId, jobsiteId, taskId, false, request.rejectionReason);
  }

  /**
   * Get a task by ID only (for notification navigation)
   * This endpoint should return the task with its jobsiteId
   */
  getTaskById(companyId: string, taskId: string): Observable<JobsiteTask> {
    return this.http.get<JobsiteTask>(
      `${this.baseUrl}/${companyId}/tasks/${taskId}`
    );
  }
}

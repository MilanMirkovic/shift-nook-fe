import { createAction, props } from '@ngrx/store';
import { JobsiteTask, CreateJobsiteTaskRequest, UpdateJobsiteTaskRequest } from './jobsite-tasks.models';

/**
 * Load jobsite tasks for a specific jobsite
 */
export const loadJobsiteTasks = createAction(
  '[Jobsite Tasks] Load',
  props<{ companyId: string; jobsiteId: string }>()
);

export const loadJobsiteTasksSuccess = createAction(
  '[Jobsite Tasks] Load Success',
  props<{ tasks: JobsiteTask[]; total: number }>()
);

export const loadJobsiteTasksFailure = createAction(
  '[Jobsite Tasks] Load Failure',
  props<{ error: string }>()
);

/**
 * Load a single jobsite task by ID
 */
export const loadJobsiteTaskById = createAction(
  '[Jobsite Tasks] Load Task By ID',
  props<{ companyId: string; jobsiteId: string; taskId: string }>()
);

export const loadJobsiteTaskByIdSuccess = createAction(
  '[Jobsite Tasks] Load Task By ID Success',
  props<{ task: JobsiteTask }>()
);

export const loadJobsiteTaskByIdFailure = createAction(
  '[Jobsite Tasks] Load Task By ID Failure',
  props<{ error: string }>()
);

/**
 * Create a new jobsite task
 */
export const createJobsiteTask = createAction(
  '[Jobsite Tasks] Create',
  props<{ companyId: string; task: CreateJobsiteTaskRequest }>()
);

export const createJobsiteTaskSuccess = createAction(
  '[Jobsite Tasks] Create Success',
  props<{ task: JobsiteTask }>()
);

export const createJobsiteTaskFailure = createAction(
  '[Jobsite Tasks] Create Failure',
  props<{ error: string }>()
);

/**
 * Update a jobsite task
 */
export const updateJobsiteTask = createAction(
  '[Jobsite Tasks] Update',
  props<{ companyId: string; jobsiteId: string; taskId: string; updateData: UpdateJobsiteTaskRequest }>()
);

export const updateJobsiteTaskSuccess = createAction(
  '[Jobsite Tasks] Update Success',
  props<{ task: JobsiteTask }>()
);

export const updateJobsiteTaskFailure = createAction(
  '[Jobsite Tasks] Update Failure',
  props<{ error: string }>()
);

/**
 * Delete a jobsite task
 */
export const deleteJobsiteTask = createAction(
  '[Jobsite Tasks] Delete',
  props<{ companyId: string; jobsiteId: string; taskId: string }>()
);

export const deleteJobsiteTaskSuccess = createAction(
  '[Jobsite Tasks] Delete Success',
  props<{ taskId: string }>()
);

export const deleteJobsiteTaskFailure = createAction(
  '[Jobsite Tasks] Delete Failure',
  props<{ error: string }>()
);

/**
 * Update pagination
 */
export const updatePage = createAction(
  '[Jobsite Tasks] Update Page',
  props<{ page: number; size: number }>()
);

/**
 * Clear jobsite tasks
 */
export const clearJobsiteTasks = createAction('[Jobsite Tasks] Clear');


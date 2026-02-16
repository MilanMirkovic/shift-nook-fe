import { createFeatureSelector, createSelector } from '@ngrx/store';
import { JobsiteTasksState } from './jobsite-tasks.models';

export const JOBSITE_TASKS_FEATURE_KEY = 'jobsiteTasks';

export const selectJobsiteTasksState = createFeatureSelector<JobsiteTasksState>(JOBSITE_TASKS_FEATURE_KEY);

export const selectJobsiteTasks = createSelector(
  selectJobsiteTasksState,
  state => state.tasks
);

export const selectSelectedTask = createSelector(
  selectJobsiteTasksState,
  state => state.selectedTask
);

export const selectJobsiteTasksLoading = createSelector(
  selectJobsiteTasksState,
  state => state.loading
);

export const selectJobsiteTaskLoadingById = createSelector(
  selectJobsiteTasksState,
  state => state.loadingById
);

export const selectJobsiteTaskCreating = createSelector(
  selectJobsiteTasksState,
  state => state.creating
);

export const selectJobsiteTaskUpdating = createSelector(
  selectJobsiteTasksState,
  state => state.updating
);

export const selectJobsiteTasksError = createSelector(
  selectJobsiteTasksState,
  state => state.error
);

export const selectJobsiteTasksTotal = createSelector(
  selectJobsiteTasksState,
  state => state.total
);

export const selectJobsiteTasksPage = createSelector(
  selectJobsiteTasksState,
  state => state.page
);

export const selectJobsiteTasksSize = createSelector(
  selectJobsiteTasksState,
  state => state.size
);

export const selectJobsiteTaskById = (id: string) => createSelector(
  selectJobsiteTasks,
  tasks => tasks.find(task => task.id === id)
);

/**
 * Get tasks for a specific jobsite
 */
export const selectTasksByJobsiteId = (jobsiteId: string) => createSelector(
  selectJobsiteTasks,
  tasks => tasks.filter(t => t.jobsiteId === jobsiteId)
);


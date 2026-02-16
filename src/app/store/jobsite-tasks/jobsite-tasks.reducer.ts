import { createReducer, on } from '@ngrx/store';
import { JobsiteTasksState } from './jobsite-tasks.models';
import {
  loadJobsiteTasks,
  loadJobsiteTasksSuccess,
  loadJobsiteTasksFailure,
  loadJobsiteTaskById,
  loadJobsiteTaskByIdSuccess,
  loadJobsiteTaskByIdFailure,
  createJobsiteTask,
  createJobsiteTaskSuccess,
  createJobsiteTaskFailure,
  updateJobsiteTask,
  updateJobsiteTaskSuccess,
  updateJobsiteTaskFailure,
  deleteJobsiteTask,
  deleteJobsiteTaskSuccess,
  deleteJobsiteTaskFailure,
  updatePage,
  clearJobsiteTasks
} from './jobsite-tasks.actions';

export const initialState: JobsiteTasksState = {
  tasks: [],
  selectedTask: null,
  loading: false,
  loadingById: false,
  creating: false,
  updating: false,
  error: null,
  total: 0,
  page: 0,
  size: 20
};

export const reducer = createReducer(
  initialState,

  on(loadJobsiteTasks, state => ({
    ...state,
    loading: true,
    error: null
  })),

  on(loadJobsiteTasksSuccess, (state, { tasks, total }) => ({
    ...state,
    tasks,
    total,
    loading: false,
    error: null
  })),

  on(loadJobsiteTasksFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(loadJobsiteTaskById, state => ({
    ...state,
    loadingById: true,
    error: null
  })),

  on(loadJobsiteTaskByIdSuccess, (state, { task }) => {
    const existingIndex = state.tasks.findIndex(t => t.id === task.id);
    const updatedTasks = existingIndex >= 0
      ? state.tasks.map((t, i) => i === existingIndex ? task : t)
      : [...state.tasks, task];

    return {
      ...state,
      tasks: updatedTasks,
      selectedTask: task,
      loadingById: false,
      error: null
    };
  }),

  on(loadJobsiteTaskByIdFailure, (state, { error }) => ({
    ...state,
    loadingById: false,
    error
  })),

  on(createJobsiteTask, state => ({
    ...state,
    creating: true,
    error: null
  })),

  on(createJobsiteTaskSuccess, (state, { task }) => ({
    ...state,
    tasks: [task, ...state.tasks],
    selectedTask: task,
    total: state.total + 1,
    creating: false,
    error: null
  })),

  on(createJobsiteTaskFailure, (state, { error }) => ({
    ...state,
    creating: false,
    error
  })),

  on(updateJobsiteTask, state => ({
    ...state,
    updating: true,
    error: null
  })),

  on(updateJobsiteTaskSuccess, (state, { task }) => {
    const updatedTasks = state.tasks.map(t => t.id === task.id ? task : t);

    return {
      ...state,
      tasks: updatedTasks,
      selectedTask: state.selectedTask?.id === task.id ? task : state.selectedTask,
      updating: false,
      error: null
    };
  }),

  on(updateJobsiteTaskFailure, (state, { error }) => ({
    ...state,
    updating: false,
    error
  })),

  on(deleteJobsiteTask, state => ({
    ...state,
    loading: true,
    error: null
  })),

  on(deleteJobsiteTaskSuccess, (state, { taskId }) => ({
    ...state,
    tasks: state.tasks.filter(t => t.id !== taskId),
    selectedTask: state.selectedTask?.id === taskId ? null : state.selectedTask,
    total: state.total - 1,
    loading: false,
    error: null
  })),

  on(deleteJobsiteTaskFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(updatePage, (state, { page, size }) => ({
    ...state,
    page,
    size
  })),

  on(clearJobsiteTasks, () => initialState)
);


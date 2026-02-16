import { createReducer, on } from '@ngrx/store';
import { TimesheetState } from './timesheets.models';
import {
  loadTimesheets,
  loadTimesheetsSuccess,
  loadTimesheetsFailure,
  loadWorkerTimesheets,
  loadWorkerTimesheetsSuccess,
  loadWorkerTimesheetsFailure,
  loadTimesheetById,
  loadTimesheetByIdSuccess,
  loadTimesheetByIdFailure,
  createTimesheet,
  createTimesheetSuccess,
  createTimesheetFailure,
  updateTimesheet,
  updateTimesheetSuccess,
  updateTimesheetFailure,
  updatePage,
  clearTimesheets
} from './timesheets.actions';

export const initialState: TimesheetState = {
  timesheets: [],
  selectedTimesheet: null,
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

  on(loadTimesheets, state => ({
    ...state,
    loading: true,
    error: null
  })),

  on(loadTimesheetsSuccess, (state, { timesheets, total }) => ({
    ...state,
    timesheets,
    total,
    loading: false,
    error: null
  })),

  on(loadTimesheetsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(loadWorkerTimesheets, state => ({
    ...state,
    loading: true,
    error: null
  })),

  on(loadWorkerTimesheetsSuccess, (state, { timesheets, total, page, size }) => ({
    ...state,
    timesheets,
    total,
    page,
    size,
    loading: false,
    error: null
  })),

  on(loadWorkerTimesheetsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(loadTimesheetById, state => ({
    ...state,
    loadingById: true,
    error: null
  })),

  on(loadTimesheetByIdSuccess, (state, { timesheet }) => {
    // Update the timesheet in the list if it exists, otherwise add it
    const existingIndex = state.timesheets.findIndex(t => t.id === timesheet.id);
    const updatedTimesheets = existingIndex >= 0
      ? state.timesheets.map((t, i) => i === existingIndex ? timesheet : t)
      : [...state.timesheets, timesheet];

    return {
      ...state,
      timesheets: updatedTimesheets,
      selectedTimesheet: timesheet,
      loadingById: false,
      error: null
    };
  }),

  on(loadTimesheetByIdFailure, (state, { error }) => ({
    ...state,
    loadingById: false,
    error
  })),

  on(createTimesheet, state => ({
    ...state,
    creating: true,
    error: null
  })),

  on(createTimesheetSuccess, (state, { timesheet }) => ({
    ...state,
    timesheets: [timesheet, ...state.timesheets], // Add new timesheet to the beginning of the list
    selectedTimesheet: timesheet,
    total: state.total + 1,
    creating: false,
    error: null
  })),

  on(createTimesheetFailure, (state, { error }) => ({
    ...state,
    creating: false,
    error
  })),

  on(updateTimesheet, state => ({
    ...state,
    updating: true,
    error: null
  })),

  on(updateTimesheetSuccess, (state, { timesheet }) => {
    // Update the timesheet in the list
    const updatedTimesheets = state.timesheets.map(t =>
      t.id === timesheet.id ? timesheet : t
    );

    return {
      ...state,
      timesheets: updatedTimesheets,
      selectedTimesheet: state.selectedTimesheet?.id === timesheet.id ? timesheet : state.selectedTimesheet,
      updating: false,
      error: null
    };
  }),

  on(updateTimesheetFailure, (state, { error }) => ({
    ...state,
    updating: false,
    error
  })),

  on(updatePage, (state, { page, size }) => ({
    ...state,
    page,
    size
  })),

  on(clearTimesheets, () => initialState)
);

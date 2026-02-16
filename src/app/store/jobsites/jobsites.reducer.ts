import { createReducer, on } from '@ngrx/store';
import { JobsitesState } from './jobsites.models';
import * as JobsitesActions from './jobsites.actions';

export const initialState: JobsitesState = {
  jobsites: [],
  total: 0,
  loading: false,
  error: null,
  filters: {
    page: 0,
    size: 20
  }
};

export const reducer = createReducer(
  initialState,
  on(JobsitesActions.loadJobsites, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(JobsitesActions.loadJobsitesSuccess, (state, { jobsites, total }) => ({
    ...state,
    jobsites,
    total,
    loading: false,
    error: null
  })),
  on(JobsitesActions.loadJobsitesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(JobsitesActions.createJobsite, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(JobsitesActions.createJobsiteSuccess, (state, { jobsite }) => ({
    ...state,
    jobsites: [jobsite, ...state.jobsites],
    total: state.total + 1,
    loading: false,
    error: null
  })),
  on(JobsitesActions.createJobsiteFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(JobsitesActions.loadJobsiteById, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(JobsitesActions.loadJobsiteByIdSuccess, (state, { jobsite }) => ({
    ...state,
    jobsites: state.jobsites.some(j => j.id === jobsite.id)
      ? state.jobsites.map(j => (j.id === jobsite.id ? jobsite : j))
      : [...state.jobsites, jobsite],
    loading: false,
    error: null
  })),
  on(JobsitesActions.loadJobsiteByIdFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(JobsitesActions.deleteJobsite, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(JobsitesActions.deleteJobsiteSuccess, (state, { jobsiteId }) => ({
    ...state,
    jobsites: state.jobsites.filter(j => j.id !== jobsiteId),
    total: state.total - 1,
    loading: false,
    error: null
  })),
  on(JobsitesActions.deleteJobsiteFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(JobsitesActions.updateJobsite, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(JobsitesActions.updateJobsiteSuccess, (state, { jobsite }) => ({
    ...state,
    jobsites: state.jobsites.map(j => j.id === jobsite.id ? jobsite : j),
    loading: false,
    error: null
  })),
  on(JobsitesActions.updateJobsiteFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(JobsitesActions.updatePage, (state, { page, size }) => ({
    ...state,
    filters: { ...state.filters, page, size }
  })),
  on(JobsitesActions.clearJobsites, () => initialState)
);

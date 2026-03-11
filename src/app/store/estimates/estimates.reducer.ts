import { createReducer, on } from '@ngrx/store';
import { EstimatesState } from './estimates.models';
import * as EstimatesActions from './estimates.actions';

export const initialState: EstimatesState = {
  estimates: [],
  total: 0,
  loading: false,
  error: null,
  filters: {
    page: 0,
    size: 20
  }
};

export const estimatesReducer = createReducer(
  initialState,

  // Load list
  on(EstimatesActions.loadEstimates, (state) => ({
    ...state, loading: true, error: null
  })),
  on(EstimatesActions.loadEstimatesSuccess, (state, { estimates, total }) => ({
    ...state, estimates, total, loading: false, error: null
  })),
  on(EstimatesActions.loadEstimatesFailure, (state, { error }) => ({
    ...state, loading: false, error
  })),

  // Load by ID
  on(EstimatesActions.loadEstimateById, (state) => ({
    ...state, loading: true, error: null
  })),
  on(EstimatesActions.loadEstimateByIdSuccess, (state, { estimate }) => ({
    ...state,
    estimates: state.estimates.some(e => e.id === estimate.id)
      ? state.estimates.map(e => e.id === estimate.id ? estimate : e)
      : [...state.estimates, estimate],
    loading: false,
    error: null
  })),
  on(EstimatesActions.loadEstimateByIdFailure, (state, { error }) => ({
    ...state, loading: false, error
  })),

  // Create
  on(EstimatesActions.createEstimate, (state) => ({
    ...state, loading: true, error: null
  })),
  on(EstimatesActions.createEstimateSuccess, (state, { estimate }) => ({
    ...state,
    estimates: [estimate, ...state.estimates],
    total: state.total + 1,
    loading: false,
    error: null
  })),
  on(EstimatesActions.createEstimateFailure, (state, { error }) => ({
    ...state, loading: false, error
  })),

  // Update
  on(EstimatesActions.updateEstimate, (state) => ({
    ...state, loading: true, error: null
  })),
  on(EstimatesActions.updateEstimateSuccess, (state, { estimate }) => ({
    ...state,
    estimates: state.estimates.map(e => e.id === estimate.id ? estimate : e),
    loading: false,
    error: null
  })),
  on(EstimatesActions.updateEstimateFailure, (state, { error }) => ({
    ...state, loading: false, error
  })),

  // Update status
  on(EstimatesActions.updateEstimateStatus, (state) => ({
    ...state, loading: true, error: null
  })),
  on(EstimatesActions.updateEstimateStatusSuccess, (state, { estimate }) => ({
    ...state,
    estimates: state.estimates.map(e => e.id === estimate.id ? estimate : e),
    loading: false,
    error: null
  })),
  on(EstimatesActions.updateEstimateStatusFailure, (state, { error }) => ({
    ...state, loading: false, error
  })),

  // Delete
  on(EstimatesActions.deleteEstimate, (state) => ({
    ...state, loading: true, error: null
  })),
  on(EstimatesActions.deleteEstimateSuccess, (state, { estimateId }) => ({
    ...state,
    estimates: state.estimates.filter(e => e.id !== estimateId),
    total: state.total - 1,
    loading: false,
    error: null
  })),
  on(EstimatesActions.deleteEstimateFailure, (state, { error }) => ({
    ...state, loading: false, error
  })),

  // Pagination
  on(EstimatesActions.updateEstimatesPage, (state, { page, size }) => ({
    ...state,
    filters: { ...state.filters, page, size }
  })),

  on(EstimatesActions.clearEstimates, () => initialState)
);


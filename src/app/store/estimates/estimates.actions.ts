import { createAction, props } from '@ngrx/store';
import { Estimate, CreateEstimateInput, UpdateEstimateInput, UpdateEstimateStatusInput } from './estimates.models';

// Load all estimates (optionally filtered by clientId)
export const loadEstimates = createAction(
  '[Estimates] Load Estimates',
  props<{ companyId: string; clientId?: string; page?: number; size?: number; sort?: string }>()
);

export const loadEstimatesSuccess = createAction(
  '[Estimates] Load Estimates Success',
  props<{ estimates: Estimate[]; total: number }>()
);

export const loadEstimatesFailure = createAction(
  '[Estimates] Load Estimates Failure',
  props<{ error: string }>()
);

// Load single estimate
export const loadEstimateById = createAction(
  '[Estimates] Load Estimate By ID',
  props<{ companyId: string; estimateId: string }>()
);

export const loadEstimateByIdSuccess = createAction(
  '[Estimates] Load Estimate By ID Success',
  props<{ estimate: Estimate }>()
);

export const loadEstimateByIdFailure = createAction(
  '[Estimates] Load Estimate By ID Failure',
  props<{ error: string }>()
);

// Create
export const createEstimate = createAction(
  '[Estimates] Create Estimate',
  props<{ companyId: string; estimate: CreateEstimateInput }>()
);

export const createEstimateSuccess = createAction(
  '[Estimates] Create Estimate Success',
  props<{ estimate: Estimate }>()
);

export const createEstimateFailure = createAction(
  '[Estimates] Create Estimate Failure',
  props<{ error: string }>()
);

// Update
export const updateEstimate = createAction(
  '[Estimates] Update Estimate',
  props<{ companyId: string; estimateId: string; estimate: UpdateEstimateInput }>()
);

export const updateEstimateSuccess = createAction(
  '[Estimates] Update Estimate Success',
  props<{ estimate: Estimate }>()
);

export const updateEstimateFailure = createAction(
  '[Estimates] Update Estimate Failure',
  props<{ error: string }>()
);

// Update status
export const updateEstimateStatus = createAction(
  '[Estimates] Update Estimate Status',
  props<{ companyId: string; estimateId: string; statusUpdate: UpdateEstimateStatusInput }>()
);

export const updateEstimateStatusSuccess = createAction(
  '[Estimates] Update Estimate Status Success',
  props<{ estimate: Estimate }>()
);

export const updateEstimateStatusFailure = createAction(
  '[Estimates] Update Estimate Status Failure',
  props<{ error: string }>()
);

// Delete
export const deleteEstimate = createAction(
  '[Estimates] Delete Estimate',
  props<{ companyId: string; estimateId: string }>()
);

export const deleteEstimateSuccess = createAction(
  '[Estimates] Delete Estimate Success',
  props<{ estimateId: string; companyId: string }>()
);

export const deleteEstimateFailure = createAction(
  '[Estimates] Delete Estimate Failure',
  props<{ error: string }>()
);

// Pagination
export const updateEstimatesPage = createAction(
  '[Estimates] Update Page',
  props<{ page: number; size: number }>()
);

export const clearEstimates = createAction('[Estimates] Clear Estimates');


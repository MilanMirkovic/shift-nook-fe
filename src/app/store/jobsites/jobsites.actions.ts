import { createAction, props } from '@ngrx/store';
import { Jobsite, CreateJobsiteInput, UpdateJobsiteInput } from './jobsites.models';

export const loadJobsites = createAction(
  '[Jobsites] Load Jobsites',
  props<{
    companyId: string;
    page?: number;
    size?: number;
    sort?: string;
    search?: string;
  }>()
);

export const loadJobsitesSuccess = createAction(
  '[Jobsites] Load Jobsites Success',
  props<{ jobsites: Jobsite[]; total: number }>()
);

export const loadJobsitesFailure = createAction(
  '[Jobsites] Load Jobsites Failure',
  props<{ error: string }>()
);

export const loadJobsiteById = createAction(
  '[Jobsites] Load Jobsite By ID',
  props<{ companyId: string; jobsiteId: string }>()
);

export const loadJobsiteByIdSuccess = createAction(
  '[Jobsites] Load Jobsite By ID Success',
  props<{ jobsite: Jobsite }>()
);

export const loadJobsiteByIdFailure = createAction(
  '[Jobsites] Load Jobsite By ID Failure',
  props<{ error: string }>()
);

export const createJobsite = createAction(
  '[Jobsites] Create Jobsite',
  props<{ companyId: string; jobsite: CreateJobsiteInput }>()
);

export const createJobsiteSuccess = createAction(
  '[Jobsites] Create Jobsite Success',
  props<{ jobsite: Jobsite }>()
);

export const createJobsiteFailure = createAction(
  '[Jobsites] Create Jobsite Failure',
  props<{ error: string }>()
);

export const deleteJobsite = createAction(
  '[Jobsites] Delete Jobsite',
  props<{ companyId: string; jobsiteId: string }>()
);

export const deleteJobsiteSuccess = createAction(
  '[Jobsites] Delete Jobsite Success',
  props<{ jobsiteId: string; companyId: string }>()
);

export const deleteJobsiteFailure = createAction(
  '[Jobsites] Delete Jobsite Failure',
  props<{ error: string }>()
);

export const updateJobsite = createAction(
  '[Jobsites] Update Jobsite',
  props<{ companyId: string; jobsiteId: string; jobsite: UpdateJobsiteInput }>()
);

export const updateJobsiteSuccess = createAction(
  '[Jobsites] Update Jobsite Success',
  props<{ jobsite: Jobsite }>()
);

export const updateJobsiteFailure = createAction(
  '[Jobsites] Update Jobsite Failure',
  props<{ error: string }>()
);

export const updatePage = createAction(
  '[Jobsites] Update Page',
  props<{ page: number; size: number }>()
);

export const clearJobsites = createAction('[Jobsites] Clear Jobsites');

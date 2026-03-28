import { createAction, props } from '@ngrx/store';
import { AdminCompany, CreateCompanyRequest } from './admin-companies.models';

// ── List companies ──────────────────────────────────────────────────────────
export const loadAdminCompanies = createAction(
  '[Admin Companies] Load',
  props<{ page: number; size: number; q?: string }>()
);

export const loadAdminCompaniesSuccess = createAction(
  '[Admin Companies] Load Success',
  props<{ companies: AdminCompany[]; total: number; page: number; size: number }>()
);

export const loadAdminCompaniesFailure = createAction(
  '[Admin Companies] Load Failure',
  props<{ error: string }>()
);

// ── Get single company ──────────────────────────────────────────────────────
export const loadAdminCompany = createAction(
  '[Admin Companies] Load One',
  props<{ companyId: string }>()
);

export const loadAdminCompanySuccess = createAction(
  '[Admin Companies] Load One Success',
  props<{ company: AdminCompany }>()
);

export const loadAdminCompanyFailure = createAction(
  '[Admin Companies] Load One Failure',
  props<{ error: string }>()
);

// ── Create company ──────────────────────────────────────────────────────────
export const createAdminCompany = createAction(
  '[Admin Companies] Create',
  props<{ request: CreateCompanyRequest }>()
);

export const createAdminCompanySuccess = createAction(
  '[Admin Companies] Create Success',
  props<{ company: AdminCompany }>()
);

export const createAdminCompanyFailure = createAction(
  '[Admin Companies] Create Failure',
  props<{ error: string }>()
);

// ── Clear detail ────────────────────────────────────────────────────────────
export const clearAdminCompanyDetail = createAction(
  '[Admin Companies] Clear Detail'
);


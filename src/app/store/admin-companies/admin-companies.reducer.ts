import { createReducer, on } from '@ngrx/store';
import { AdminCompaniesState } from './admin-companies.models';
import * as Actions from './admin-companies.actions';

export const ADMIN_COMPANIES_FEATURE_KEY = 'adminCompanies';

export const initialState: AdminCompaniesState = {
  items: [],
  total: 0,
  page: 0,
  size: 50,
  loading: false,
  error: null,

  selectedCompany: null,
  selectedCompanyLoading: false,
  selectedCompanyError: null,

  submitting: false,
  submitError: null,
};

export const adminCompaniesReducer = createReducer(
  initialState,

  // ── List ────────────────────────────────────────────────────────────────
  on(Actions.loadAdminCompanies, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(Actions.loadAdminCompaniesSuccess, (state, { companies, total, page, size }) => ({
    ...state,
    items: companies,
    total,
    page,
    size,
    loading: false,
  })),
  on(Actions.loadAdminCompaniesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // ── Single company ──────────────────────────────────────────────────────
  on(Actions.loadAdminCompany, (state) => ({
    ...state,
    selectedCompanyLoading: true,
    selectedCompanyError: null,
  })),
  on(Actions.loadAdminCompanySuccess, (state, { company }) => ({
    ...state,
    selectedCompany: company,
    selectedCompanyLoading: false,
  })),
  on(Actions.loadAdminCompanyFailure, (state, { error }) => ({
    ...state,
    selectedCompanyLoading: false,
    selectedCompanyError: error,
  })),

  // ── Create ──────────────────────────────────────────────────────────────
  on(Actions.createAdminCompany, (state) => ({
    ...state,
    submitting: true,
    submitError: null,
  })),
  on(Actions.createAdminCompanySuccess, (state, { company }) => ({
    ...state,
    items: [company, ...state.items],
    total: state.total + 1,
    submitting: false,
  })),
  on(Actions.createAdminCompanyFailure, (state, { error }) => ({
    ...state,
    submitting: false,
    submitError: error,
  })),

  // ── Clear detail ────────────────────────────────────────────────────────
  on(Actions.clearAdminCompanyDetail, (state) => ({
    ...state,
    selectedCompany: null,
    selectedCompanyLoading: false,
    selectedCompanyError: null,
  })),
);


import { createReducer, on } from '@ngrx/store';
import { QuickBooksCustomerMappingsState } from './qb-customer-mappings.models';
import * as QBCustomerMappingsActions from './qb-customer-mappings.actions';

export const initialState: QuickBooksCustomerMappingsState = {
  quickbooksCustomers: [],
  quickbooksCustomersLoading: false,
  quickbooksCustomersLoaded: false,

  mappings: [],
  mappingsLoading: false,
  mappingsLoaded: false,

  creatingMapping: false,
  deletingMapping: false,

  error: null
};

export const qbCustomerMappingsReducer = createReducer(
  initialState,

  // Load QuickBooks customers
  on(QBCustomerMappingsActions.loadQuickBooksCustomers, (state) => ({
    ...state,
    quickbooksCustomersLoading: true,
    error: null
  })),

  on(QBCustomerMappingsActions.loadQuickBooksCustomersSuccess, (state, { customers }) => ({
    ...state,
    quickbooksCustomers: customers,
    quickbooksCustomersLoading: false,
    quickbooksCustomersLoaded: true,
    error: null
  })),

  on(QBCustomerMappingsActions.loadQuickBooksCustomersFailure, (state, { error }) => ({
    ...state,
    quickbooksCustomersLoading: false,
    error
  })),

  // Load mappings
  on(QBCustomerMappingsActions.loadMappings, (state) => ({
    ...state,
    mappingsLoading: true,
    error: null
  })),

  on(QBCustomerMappingsActions.loadMappingsSuccess, (state, { mappings }) => ({
    ...state,
    mappings,
    mappingsLoading: false,
    mappingsLoaded: true,
    error: null
  })),

  on(QBCustomerMappingsActions.loadMappingsFailure, (state, { error }) => ({
    ...state,
    mappingsLoading: false,
    error
  })),

  // Create mapping
  on(QBCustomerMappingsActions.createMapping, (state) => ({
    ...state,
    creatingMapping: true,
    error: null
  })),

  on(QBCustomerMappingsActions.createMappingSuccess, (state, { mapping }) => ({
    ...state,
    mappings: [...state.mappings, mapping],
    creatingMapping: false,
    error: null
  })),

  on(QBCustomerMappingsActions.createMappingFailure, (state, { error }) => ({
    ...state,
    creatingMapping: false,
    error
  })),

  // Delete mapping
  on(QBCustomerMappingsActions.deleteMapping, (state) => ({
    ...state,
    deletingMapping: true,
    error: null
  })),

  on(QBCustomerMappingsActions.deleteMappingSuccess, (state, { mappingId }) => ({
    ...state,
    mappings: state.mappings.filter((m) => m.id !== mappingId),
    deletingMapping: false,
    error: null
  })),

  on(QBCustomerMappingsActions.deleteMappingFailure, (state, { error }) => ({
    ...state,
    deletingMapping: false,
    error
  })),

  // Clear error
  on(QBCustomerMappingsActions.clearError, (state) => ({
    ...state,
    error: null
  }))
);

import { createAction, props } from '@ngrx/store';
import {
  QuickBooksCustomer,
  QuickBooksCustomerMapping,
  CreateMappingRequest
} from './qb-customer-mappings.models';

// Load QuickBooks customers
export const loadQuickBooksCustomers = createAction(
  '[QB Customer Mappings] Load QuickBooks Customers',
  props<{ companyId: string }>()
);

export const loadQuickBooksCustomersSuccess = createAction(
  '[QB Customer Mappings] Load QuickBooks Customers Success',
  props<{ customers: QuickBooksCustomer[] }>()
);

export const loadQuickBooksCustomersFailure = createAction(
  '[QB Customer Mappings] Load QuickBooks Customers Failure',
  props<{ error: string }>()
);

// Load mappings
export const loadMappings = createAction(
  '[QB Customer Mappings] Load Mappings',
  props<{ companyId: string }>()
);

export const loadMappingsSuccess = createAction(
  '[QB Customer Mappings] Load Mappings Success',
  props<{ mappings: QuickBooksCustomerMapping[] }>()
);

export const loadMappingsFailure = createAction(
  '[QB Customer Mappings] Load Mappings Failure',
  props<{ error: string }>()
);

// Create mapping
export const createMapping = createAction(
  '[QB Customer Mappings] Create Mapping',
  props<{
    companyId: string;
    request: CreateMappingRequest;
  }>()
);

export const createMappingSuccess = createAction(
  '[QB Customer Mappings] Create Mapping Success',
  props<{ mapping: QuickBooksCustomerMapping }>()
);

export const createMappingFailure = createAction(
  '[QB Customer Mappings] Create Mapping Failure',
  props<{ error: string }>()
);

// Delete mapping
export const deleteMapping = createAction(
  '[QB Customer Mappings] Delete Mapping',
  props<{
    companyId: string;
    mappingId: string;
  }>()
);

export const deleteMappingSuccess = createAction(
  '[QB Customer Mappings] Delete Mapping Success',
  props<{ mappingId: string }>()
);

export const deleteMappingFailure = createAction(
  '[QB Customer Mappings] Delete Mapping Failure',
  props<{ error: string }>()
);

// Clear error
export const clearError = createAction(
  '[QB Customer Mappings] Clear Error'
);

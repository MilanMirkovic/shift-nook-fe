import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QuickBooksCustomerMappingsState } from './qb-customer-mappings.models';

export const selectQBCustomerMappingsState =
  createFeatureSelector<QuickBooksCustomerMappingsState>('qbCustomerMappings');

export const selectQuickBooksCustomers = createSelector(
  selectQBCustomerMappingsState,
  (state) => state.quickbooksCustomers
);

export const selectQuickBooksCustomersLoading = createSelector(
  selectQBCustomerMappingsState,
  (state) => state.quickbooksCustomersLoading
);

export const selectMappings = createSelector(
  selectQBCustomerMappingsState,
  (state) => state.mappings
);

export const selectMappingsLoading = createSelector(
  selectQBCustomerMappingsState,
  (state) => state.mappingsLoading
);

export const selectCreatingMapping = createSelector(
  selectQBCustomerMappingsState,
  (state) => state.creatingMapping
);

export const selectDeletingMapping = createSelector(
  selectQBCustomerMappingsState,
  (state) => state.deletingMapping
);

export const selectError = createSelector(
  selectQBCustomerMappingsState,
  (state) => state.error
);

/**
 * Check if a specific client has a mapping
 */
export const selectMappingForClient = (clientId: string) =>
  createSelector(selectMappings, (mappings) =>
    mappings.find((m) => m.clientId === clientId)
  );

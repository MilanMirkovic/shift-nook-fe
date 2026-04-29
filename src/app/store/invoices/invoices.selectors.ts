import { createFeatureSelector, createSelector } from '@ngrx/store';
import { InvoicesState } from './invoices.models';

export const INVOICES_FEATURE_KEY = 'invoices';

export const selectInvoicesState = createFeatureSelector<InvoicesState>(INVOICES_FEATURE_KEY);

export const selectInvoices = createSelector(selectInvoicesState, (state) => state.invoices);
export const selectInvoicesTotal = createSelector(selectInvoicesState, (state) => state.total);
export const selectInvoicesLoading = createSelector(selectInvoicesState, (state) => state.loading);
export const selectInvoicesError = createSelector(selectInvoicesState, (state) => state.error);
export const selectSelectedInvoice = createSelector(selectInvoicesState, (state) => state.selectedInvoice);

export const selectInvoiceById = (invoiceId: string) => createSelector(
  selectInvoicesState,
  (state) => state.invoices.find(i => i.id === invoiceId) ?? undefined
);

export const selectInvoicesByClientId = (clientId: string) => createSelector(
  selectInvoicesState,
  (state) => state.invoices.filter(i => i.clientId === clientId)
);

/**
 * Selects invoices related to a specific client (bidirectional).
 * Includes both:
 * - Invoices sent TO the client (where clientId = selectedClientId)
 * - Invoices received FROM the client (where companyId = selectedClientId and clientId = currentCompanyId)
 */
export const selectInvoicesByClientIdBidirectional = (currentCompanyId: string, selectedClientId: string) => createSelector(
  selectInvoicesState,
  (state) => state.invoices.filter(i =>
    i.clientId === selectedClientId || // Sent to this client
    (i.companyId === selectedClientId && i.clientId === currentCompanyId) // Received from this client
  )
);

export const selectInvoicesByEstimateId = (estimateId: string) => createSelector(
  selectInvoicesState,
  (state) => state.invoices.filter(i => i.estimateId === estimateId)
);

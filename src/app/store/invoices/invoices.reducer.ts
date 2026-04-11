import { createReducer, on } from '@ngrx/store';
import { InvoicesState } from './invoices.models';
import * as InvoicesActions from './invoices.actions';

export const INVOICES_FEATURE_KEY = 'invoices';

export const initialState: InvoicesState = {
  invoices: [],
  selectedInvoice: null,
  total: 0,
  loading: false,
  error: null,
  filters: { page: 0, size: 20 },
};

export const invoicesReducer = createReducer(
  initialState,

  // Create invoice
  on(InvoicesActions.createInvoice, (state) => ({ ...state, loading: true, error: null })),
  on(InvoicesActions.createInvoiceSuccess, (state, { invoice }) => ({
    ...state, invoices: [invoice, ...state.invoices], selectedInvoice: invoice, total: state.total + 1, loading: false, error: null,
  })),
  on(InvoicesActions.createInvoiceFailure, (state, { error }) => ({ ...state, loading: false, error })),

  // Load invoices
  on(InvoicesActions.loadInvoices, (state) => ({ ...state, loading: true, error: null })),
  on(InvoicesActions.loadInvoicesSuccess, (state, { invoices, total }) => ({ ...state, invoices, total, loading: false, error: null })),
  on(InvoicesActions.loadInvoicesFailure, (state, { error }) => ({ ...state, loading: false, error })),

  // Load single invoice
  on(InvoicesActions.loadInvoiceById, (state) => ({ ...state, loading: true, error: null })),
  on(InvoicesActions.loadInvoiceByIdSuccess, (state, { invoice }) => ({
    ...state,
    selectedInvoice: invoice,
    invoices: state.invoices.some(i => i.id === invoice.id)
      ? state.invoices.map(i => i.id === invoice.id ? invoice : i)
      : [...state.invoices, invoice],
    loading: false, error: null,
  })),
  on(InvoicesActions.loadInvoiceByIdFailure, (state, { error }) => ({ ...state, loading: false, error })),

  // Promote estimate → invoice
  on(InvoicesActions.promoteEstimateToInvoice, (state) => ({ ...state, loading: true, error: null })),
  on(InvoicesActions.promoteEstimateToInvoiceSuccess, (state, { invoice }) => ({
    ...state, invoices: [invoice, ...state.invoices], selectedInvoice: invoice, total: state.total + 1, loading: false, error: null,
  })),
  on(InvoicesActions.promoteEstimateToInvoiceFailure, (state, { error }) => ({ ...state, loading: false, error })),

  // Update invoice
  on(InvoicesActions.updateInvoice, (state) => ({ ...state, loading: true, error: null })),
  on(InvoicesActions.updateInvoiceSuccess, (state, { invoice }) => ({
    ...state,
    invoices: state.invoices.map(i => i.id === invoice.id ? invoice : i),
    selectedInvoice: state.selectedInvoice?.id === invoice.id ? invoice : state.selectedInvoice,
    loading: false, error: null,
  })),
  on(InvoicesActions.updateInvoiceFailure, (state, { error }) => ({ ...state, loading: false, error })),

  // Update invoice status
  on(InvoicesActions.updateInvoiceStatus, (state) => ({ ...state, loading: true, error: null })),
  on(InvoicesActions.updateInvoiceStatusSuccess, (state, { invoice }) => ({
    ...state,
    invoices: state.invoices.map(i => i.id === invoice.id ? invoice : i),
    selectedInvoice: state.selectedInvoice?.id === invoice.id ? invoice : state.selectedInvoice,
    loading: false, error: null,
  })),
  on(InvoicesActions.updateInvoiceStatusFailure, (state, { error }) => ({ ...state, loading: false, error })),

  // Delete invoice
  on(InvoicesActions.deleteInvoice, (state) => ({ ...state, loading: true, error: null })),
  on(InvoicesActions.deleteInvoiceSuccess, (state, { invoiceId }) => ({
    ...state,
    invoices: state.invoices.filter(i => i.id !== invoiceId),
    selectedInvoice: state.selectedInvoice?.id === invoiceId ? null : state.selectedInvoice,
    total: state.total - 1, loading: false, error: null,
  })),
  on(InvoicesActions.deleteInvoiceFailure, (state, { error }) => ({ ...state, loading: false, error })),

  // Download PDF
  on(InvoicesActions.downloadInvoicePdf, (state) => ({ ...state, loading: true, error: null })),
  on(InvoicesActions.downloadInvoicePdfSuccess, (state) => ({ ...state, loading: false, error: null })),
  on(InvoicesActions.downloadInvoicePdfFailure, (state, { error }) => ({ ...state, loading: false, error })),

  // Get PDF URL
  on(InvoicesActions.getInvoicePdfUrl, (state) => ({ ...state, loading: true, error: null })),
  on(InvoicesActions.getInvoicePdfUrlSuccess, (state) => ({ ...state, loading: false, error: null })),
  on(InvoicesActions.getInvoicePdfUrlFailure, (state, { error }) => ({ ...state, loading: false, error })),
);

import { createReducer, on } from '@ngrx/store';
import { InvoicesState } from './invoices.models';
import * as InvoicesActions from './invoices.actions';

export const INVOICES_FEATURE_KEY = 'invoices';

export const initialState: InvoicesState = {
  invoices: [],
  total: 0,
  loading: false,
  error: null,
  filters: { page: 0, size: 20 },
};

export const invoicesReducer = createReducer(
  initialState,

  on(InvoicesActions.loadInvoices, (state) => ({ ...state, loading: true, error: null })),
  on(InvoicesActions.loadInvoicesSuccess, (state, { invoices, total }) => ({ ...state, invoices, total, loading: false, error: null })),
  on(InvoicesActions.loadInvoicesFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(InvoicesActions.loadInvoiceById, (state) => ({ ...state, loading: true, error: null })),
  on(InvoicesActions.loadInvoiceByIdSuccess, (state, { invoice }) => ({
    ...state,
    invoices: state.invoices.some(i => i.id === invoice.id)
      ? state.invoices.map(i => i.id === invoice.id ? invoice : i)
      : [...state.invoices, invoice],
    loading: false, error: null,
  })),
  on(InvoicesActions.loadInvoiceByIdFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(InvoicesActions.createInvoice, (state) => ({ ...state, loading: true, error: null })),
  on(InvoicesActions.createInvoiceSuccess, (state, { invoice }) => ({
    ...state, invoices: [invoice, ...state.invoices], total: state.total + 1, loading: false, error: null,
  })),
  on(InvoicesActions.createInvoiceFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(InvoicesActions.updateInvoice, (state) => ({ ...state, loading: true, error: null })),
  on(InvoicesActions.updateInvoiceSuccess, (state, { invoice }) => ({
    ...state, invoices: state.invoices.map(i => i.id === invoice.id ? invoice : i), loading: false, error: null,
  })),
  on(InvoicesActions.updateInvoiceFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(InvoicesActions.updateInvoiceStatus, (state) => ({ ...state, loading: true, error: null })),
  on(InvoicesActions.updateInvoiceStatusSuccess, (state, { invoice }) => ({
    ...state, invoices: state.invoices.map(i => i.id === invoice.id ? invoice : i), loading: false, error: null,
  })),
  on(InvoicesActions.updateInvoiceStatusFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(InvoicesActions.deleteInvoice, (state) => ({ ...state, loading: true, error: null })),
  on(InvoicesActions.deleteInvoiceSuccess, (state, { invoiceId }) => ({
    ...state, invoices: state.invoices.filter(i => i.id !== invoiceId), total: state.total - 1, loading: false, error: null,
  })),
  on(InvoicesActions.deleteInvoiceFailure, (state, { error }) => ({ ...state, loading: false, error })),
);


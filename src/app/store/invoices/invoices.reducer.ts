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

  // Send invoice (DRAFT → ISSUED)
  on(InvoicesActions.sendInvoice, (state) => ({ ...state, loading: true, error: null })),
  on(InvoicesActions.sendInvoiceSuccess, (state, { invoice }) => ({
    ...state,
    invoices: state.invoices.map(i => i.id === invoice.id ? invoice : i),
    selectedInvoice: state.selectedInvoice?.id === invoice.id ? invoice : state.selectedInvoice,
    loading: false, error: null,
  })),
  on(InvoicesActions.sendInvoiceFailure, (state, { error }) => ({ ...state, loading: false, error })),

  // Create pass-through invoice
  on(InvoicesActions.createPassThroughInvoice, (state) => ({ ...state, loading: true, error: null })),
  on(InvoicesActions.createPassThroughInvoiceSuccess, (state, { invoice }) => ({
    ...state,
    invoices: [invoice, ...state.invoices],
    total: state.total + 1,
    loading: false, error: null,
  })),
  on(InvoicesActions.createPassThroughInvoiceFailure, (state, { error }) => ({ ...state, loading: false, error })),

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

  // Create payment
  on(InvoicesActions.createPayment, (state) => ({ ...state, error: null })),
  on(InvoicesActions.createPaymentSuccess, (state, { payment, invoiceId }) => ({
    ...state,
    invoices: state.invoices.map(inv =>
      inv.id === invoiceId
        ? {
            ...inv,
            payments: [...inv.payments, payment],
            paidAmount: inv.paidAmount + payment.amount,
            remainingAmount: inv.remainingAmount - payment.amount,
            paymentPercentage: Math.round(((inv.paidAmount + payment.amount) / inv.totalAmount) * 100),
          }
        : inv
    ),
    selectedInvoice: state.selectedInvoice?.id === invoiceId
      ? {
          ...state.selectedInvoice,
          payments: [...state.selectedInvoice.payments, payment],
          paidAmount: state.selectedInvoice.paidAmount + payment.amount,
          remainingAmount: state.selectedInvoice.remainingAmount - payment.amount,
          paymentPercentage: Math.round(((state.selectedInvoice.paidAmount + payment.amount) / state.selectedInvoice.totalAmount) * 100),
        }
      : state.selectedInvoice,
    error: null,
  })),
  on(InvoicesActions.createPaymentFailure, (state, { error }) => ({ ...state, error })),

  // Delete payment
  on(InvoicesActions.deletePayment, (state) => ({ ...state, error: null })),
  on(InvoicesActions.deletePaymentSuccess, (state, { paymentId, invoiceId }) => ({
    ...state,
    invoices: state.invoices.map(inv => {
      if (inv.id !== invoiceId) return inv;
      const deletedPayment = inv.payments.find(p => p.id === paymentId);
      if (!deletedPayment) return inv;
      const newPaidAmount = inv.paidAmount - deletedPayment.amount;
      return {
        ...inv,
        payments: inv.payments.filter(p => p.id !== paymentId),
        paidAmount: newPaidAmount,
        remainingAmount: inv.totalAmount - newPaidAmount,
        paymentPercentage: Math.round((newPaidAmount / inv.totalAmount) * 100),
      };
    }),
    selectedInvoice: state.selectedInvoice?.id === invoiceId
      ? (() => {
          const deletedPayment = state.selectedInvoice.payments.find(p => p.id === paymentId);
          if (!deletedPayment) return state.selectedInvoice;
          const newPaidAmount = state.selectedInvoice.paidAmount - deletedPayment.amount;
          return {
            ...state.selectedInvoice,
            payments: state.selectedInvoice.payments.filter(p => p.id !== paymentId),
            paidAmount: newPaidAmount,
            remainingAmount: state.selectedInvoice.totalAmount - newPaidAmount,
            paymentPercentage: Math.round((newPaidAmount / state.selectedInvoice.totalAmount) * 100),
          };
        })()
      : state.selectedInvoice,
    error: null,
  })),
  on(InvoicesActions.deletePaymentFailure, (state, { error }) => ({ ...state, error })),
);

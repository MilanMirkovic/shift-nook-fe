import { createAction, props } from '@ngrx/store';
import { Invoice, CreateInvoiceInput, UpdateInvoiceInput, UpdateInvoiceStatusInput, Payment, CreatePaymentInput } from './invoices.models';
import { CreateInvoiceFromTimesheetsInput, CreateInvoiceFromTimesheetsResponse } from '../../shared/models/invoice-from-timesheets.model';

// Create invoice
export const createInvoice = createAction(
  '[Invoices] Create Invoice',
  props<{ companyId: string; invoice: CreateInvoiceInput }>()
);
export const createInvoiceSuccess = createAction(
  '[Invoices] Create Invoice Success',
  props<{ invoice: Invoice }>()
);
export const createInvoiceFailure = createAction(
  '[Invoices] Create Invoice Failure',
  props<{ error: string }>()
);

// Load all invoices (optional clientId filter)
export const loadInvoices = createAction(
  '[Invoices] Load Invoices',
  props<{ companyId: string; clientId?: string; page?: number; size?: number; sort?: string }>()
);
export const loadInvoicesSuccess = createAction(
  '[Invoices] Load Invoices Success',
  props<{ invoices: Invoice[]; total: number }>()
);
export const loadInvoicesFailure = createAction(
  '[Invoices] Load Invoices Failure',
  props<{ error: string }>()
);

// Load single invoice
export const loadInvoiceById = createAction(
  '[Invoices] Load Invoice By ID',
  props<{ companyId: string; invoiceId: string }>()
);
export const loadInvoiceByIdSuccess = createAction(
  '[Invoices] Load Invoice By ID Success',
  props<{ invoice: Invoice }>()
);
export const loadInvoiceByIdFailure = createAction(
  '[Invoices] Load Invoice By ID Failure',
  props<{ error: string }>()
);

// Promote estimate → invoice
export const promoteEstimateToInvoice = createAction(
  '[Invoices] Promote Estimate To Invoice',
  props<{ companyId: string; estimateId: string }>()
);
export const promoteEstimateToInvoiceSuccess = createAction(
  '[Invoices] Promote Estimate To Invoice Success',
  props<{ invoice: Invoice }>()
);
export const promoteEstimateToInvoiceFailure = createAction(
  '[Invoices] Promote Estimate To Invoice Failure',
  props<{ error: string }>()
);

// Create invoice from timesheets
export const createInvoiceFromTimesheets = createAction(
  '[Invoices] Create Invoice From Timesheets',
  props<{ companyId: string; request: CreateInvoiceFromTimesheetsInput }>()
);
export const createInvoiceFromTimesheetsSuccess = createAction(
  '[Invoices] Create Invoice From Timesheets Success',
  props<{ response: CreateInvoiceFromTimesheetsResponse }>()
);
export const createInvoiceFromTimesheetsFailure = createAction(
  '[Invoices] Create Invoice From Timesheets Failure',
  props<{ error: string }>()
);

// Update invoice (title, notes, line items)
export const updateInvoice = createAction(
  '[Invoices] Update Invoice',
  props<{ companyId: string; invoiceId: string; invoice: UpdateInvoiceInput }>()
);
export const updateInvoiceSuccess = createAction(
  '[Invoices] Update Invoice Success',
  props<{ invoice: Invoice }>()
);
export const updateInvoiceFailure = createAction(
  '[Invoices] Update Invoice Failure',
  props<{ error: string }>()
);

// Change status
export const updateInvoiceStatus = createAction(
  '[Invoices] Update Invoice Status',
  props<{ companyId: string; invoiceId: string; statusUpdate: UpdateInvoiceStatusInput }>()
);
export const updateInvoiceStatusSuccess = createAction(
  '[Invoices] Update Invoice Status Success',
  props<{ invoice: Invoice }>()
);
export const updateInvoiceStatusFailure = createAction(
  '[Invoices] Update Invoice Status Failure',
  props<{ error: string }>()
);

// Soft-delete
export const deleteInvoice = createAction(
  '[Invoices] Delete Invoice',
  props<{ companyId: string; invoiceId: string }>()
);
export const deleteInvoiceSuccess = createAction(
  '[Invoices] Delete Invoice Success',
  props<{ invoiceId: string; companyId: string }>()
);
export const deleteInvoiceFailure = createAction(
  '[Invoices] Delete Invoice Failure',
  props<{ error: string }>()
);

// Download PDF (blob)
export const downloadInvoicePdf = createAction(
  '[Invoices] Download Invoice PDF',
  props<{ companyId: string; invoiceId: string }>()
);
export const downloadInvoicePdfSuccess = createAction(
  '[Invoices] Download Invoice PDF Success',
  props<{ blob: Blob; invoiceId: string }>()
);
export const downloadInvoicePdfFailure = createAction(
  '[Invoices] Download Invoice PDF Failure',
  props<{ error: string }>()
);

// Get pre-signed PDF URL
export const getInvoicePdfUrl = createAction(
  '[Invoices] Get Invoice PDF URL',
  props<{ companyId: string; invoiceId: string }>()
);
export const getInvoicePdfUrlSuccess = createAction(
  '[Invoices] Get Invoice PDF URL Success',
  props<{ url: string; invoiceId: string }>()
);
export const getInvoicePdfUrlFailure = createAction(
  '[Invoices] Get Invoice PDF URL Failure',
  props<{ error: string }>()
);

// Payment actions
export const createPayment = createAction(
  '[Invoices] Create Payment',
  props<{ companyId: string; invoiceId: string; payment: CreatePaymentInput }>()
);
export const createPaymentSuccess = createAction(
  '[Invoices] Create Payment Success',
  props<{ payment: Payment; invoiceId: string }>()
);
export const createPaymentFailure = createAction(
  '[Invoices] Create Payment Failure',
  props<{ error: string }>()
);

export const deletePayment = createAction(
  '[Invoices] Delete Payment',
  props<{ companyId: string; paymentId: string; invoiceId: string }>()
);
export const deletePaymentSuccess = createAction(
  '[Invoices] Delete Payment Success',
  props<{ paymentId: string; invoiceId: string }>()
);
export const deletePaymentFailure = createAction(
  '[Invoices] Delete Payment Failure',
  props<{ error: string }>()
);

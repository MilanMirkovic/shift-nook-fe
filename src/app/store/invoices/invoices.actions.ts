import { createAction, props } from '@ngrx/store';
import { Invoice, CreateInvoiceInput, UpdateInvoiceInput, UpdateInvoiceStatusInput } from './invoices.models';

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


import { InvoiceItemInput } from '../../store/invoices/invoices.models';
import { Invoice } from '../../store/invoices/invoices.models';

/**
 * Grouping strategy for invoice line items from timesheets.
 * WORKER: Group by worker (used by SUBCONTRACTOR role)
 * TASK: Group by jobsite task (used by OWNER/ACCOUNTANT/ADMIN role)
 */
export type GroupByStrategy = 'WORKER' | 'TASK';

/**
 * Preview of a line item for the invoice before submission.
 * Used to show calculated totals to the user before creating the invoice.
 */
export interface TimesheetLineItemPreview {
  workerUserId?: string;
  workerName?: string;
  taskId?: string;
  taskName?: string;
  taskNames?: string[]; // All distinct tasks this worker performed (WORKER grouping)
  totalHours: number;
  hourlyRate: number;
  amount: number;
  timesheetIds: string[];
}

/**
 * Request payload for creating an invoice from timesheets.
 */
export interface CreateInvoiceFromTimesheetsInput {
  jobsiteId: string;
  title?: string;
  notes?: string;
  issuedAt?: string;
  dueAt?: string;
  dateFrom?: string;
  dateTo?: string;
  timesheetIds: string[];
  groupBy: GroupByStrategy;
  lineItems: InvoiceItemInput[];
}

/**
 * Response from backend after creating invoice from timesheets.
 */
export interface CreateInvoiceFromTimesheetsResponse {
  invoice: Invoice;
  timesheetsLinked: number;
  timesheetIds: string[];
}

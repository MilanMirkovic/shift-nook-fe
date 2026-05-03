export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'PARTIALLY_PAID' | 'PAID' | 'VOID';

export type InvoiceType = 'MANUAL' | 'FROM_ESTIMATE' | 'FROM_TIMESHEETS' | 'PASS_THROUGH' | 'COMBINED';

export type PaymentMethod =
  | 'CASH'
  | 'CHECK'
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'BANK_TRANSFER'
  | 'ACH'
  | 'WIRE_TRANSFER'
  | 'PAYPAL'
  | 'VENMO'
  | 'ZELLE'
  | 'OTHER';

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
  createdBy: string;
}

export interface InvoiceItem {
  id: string;
  sortOrder: number;
  service?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  /** Markup percentage applied to the original unit price (0-100+). Optional;
   *  used by the combine-invoices flow so users can mark up subcontractor
   *  costs before issuing the combined invoice. The persisted {@link unitPrice}
   *  already includes the markup. */
  markupPercentage?: number;
  /** Unit price BEFORE the markup was applied. When markup is non-zero,
   *  unitPrice = originalUnitPrice * (1 + markupPercentage/100). */
  originalUnitPrice?: number;
}

export interface Invoice {
  id: string;
  companyId: string;
  clientId: string;
  estimateId: string | null;
  jobsiteId?: string;
  jobsiteName?: string;
  jobsiteAddress?: string;
  invoiceNumber: string;
  title: string;
  status: InvoiceStatus;
  invoiceType: InvoiceType;
  currency: string;
  subtotalAmount: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentPercentage: number;
  notes: string | null;
  issuedAt: string;
  dueAt: string;
  items: InvoiceItem[];
  payments: Payment[];
  createdAt: string;
  updatedAt: string;
  pdfFileId: string | null;
  sourceInvoiceId: string | null;
  recipientCompanyId: string | null;
  combinedFromInvoiceIds?: string[] | null;
  /** Display name of the company that issued this invoice. Populated by the
   *  backend; useful for received-invoice rows where {@link companyId} is the
   *  subcontractor's id. */
  senderCompanyName?: string | null;
}

export interface InvoiceItemInput {
  sortOrder: number;
  service?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  /** Optional markup metadata (combine-invoices flow). */
  markupPercentage?: number;
  originalUnitPrice?: number;
}

export interface CreateInvoiceInput {
  clientId: string;
  jobsiteId?: string;
  title: string;
  notes?: string;
  issuedAt?: string;
  dueAt?: string;
  items: InvoiceItemInput[];
  /** When set, server marks the new invoice as type=COMBINED and stores the
   *  source invoice IDs for traceability. Use with the jobsite "combine" flow. */
  combinedFromInvoiceIds?: string[];
  taxAmount?: number;
}

export interface CombineInvoicesPreviewInput {
  invoiceIds: string[];
  jobsiteId?: string;
}

export interface CombineInvoicesPreviewResponse {
  clientId: string;
  jobsiteId: string | null;
  title: string;
  notes: string | null;
  currency: string;
  subtotalAmount: number;
  taxAmount: number;
  totalAmount: number;
  issuedAt: string;
  dueAt: string;
  items: InvoiceItem[];
  sourceInvoiceIds: string[];
}

export interface UpdateInvoiceInput {
  jobsiteId?: string;
  title: string;
  notes?: string;
  issuedAt?: string;
  dueAt?: string;
  items: InvoiceItemInput[];
}

export interface UpdateInvoiceStatusInput {
  status: InvoiceStatus;
}

export interface CreatePaymentInput {
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
}

export interface CreatePassThroughInvoiceInput {
  sourceInvoiceId: string;
  markupPercentage: number;
}

export interface InvoicesPageResponse {
  totalElements: number;
  totalPages: number;
  size: number;
  content: Invoice[];
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface InvoicesState {
  invoices: Invoice[];
  selectedInvoice: Invoice | null;
  total: number;
  loading: boolean;
  error: string | null;
  filters: {
    page: number;
    size: number;
  };
}

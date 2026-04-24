export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'VOID';

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
}

export interface InvoiceItemInput {
  sortOrder: number;
  service?: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateInvoiceInput {
  clientId: string;
  jobsiteId?: string;
  title: string;
  notes?: string;
  items: InvoiceItemInput[];
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

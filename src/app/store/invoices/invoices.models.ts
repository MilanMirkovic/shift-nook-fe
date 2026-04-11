export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'VOID';

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
  invoiceNumber: string;
  title: string;
  status: InvoiceStatus;
  currency: string;
  subtotalAmount: number;
  taxAmount: number;
  totalAmount: number;
  notes: string | null;
  issuedAt: string;
  dueAt: string;
  items: InvoiceItem[];
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
  title: string;
  notes?: string;
  issuedAt: string;
  dueAt?: string;
  items: InvoiceItemInput[];
}

export interface UpdateInvoiceInput {
  title: string;
  notes?: string;
  issuedAt?: string;
  dueAt?: string;
  items: InvoiceItemInput[];
}

export interface UpdateInvoiceStatusInput {
  status: InvoiceStatus;
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

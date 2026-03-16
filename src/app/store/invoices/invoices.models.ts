export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'VOID';

export interface LineItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  companyId: string;
  clientId: string;
  invoiceNumber: number;
  title: string;
  status: InvoiceStatus;
  notes?: string;
  invoiceDate: string;
  dueDate: string;
  lineItems: LineItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceInput {
  clientId: string;
  title: string;
  notes?: string;
  invoiceDate: string;
  dueDate: string;
  lineItems: Omit<LineItem, 'amount'>[];
}

export interface UpdateInvoiceInput {
  title: string;
  notes?: string;
  invoiceDate: string;
  dueDate: string;
  lineItems: Omit<LineItem, 'amount'>[];
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
  total: number;
  loading: boolean;
  error: string | null;
  filters: {
    page: number;
    size: number;
  };
}


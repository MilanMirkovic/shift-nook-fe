export type DocumentType = 'INVOICE' | 'ESTIMATE';

export interface ParsedLineItem {
  service?: string | null;
  description: string;
  quantity: number | null;
  rate: number | null;
  amount: number;
}

export interface ParsedCompanyInfo {
  name: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
}

export interface ParsedClientInfo {
  name: string | null;
  address: string | null;
}

export interface ParsedDocumentData {
  documentType: DocumentType;
  uploadedFileId: string;
  documentNumber: string | null;
  documentDate: string | null;
  dueDate: string | null;
  terms: string | null;
  companyInfo: ParsedCompanyInfo;
  clientInfo: ParsedClientInfo;
  lineItems: ParsedLineItem[];
  subtotal: number | null;
  tax: number | null;
  total: number | null;
  notes: string | null;
}

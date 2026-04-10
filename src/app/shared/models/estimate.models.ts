export type EstimateStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'DECLINED' | 'VOID';

export interface LineItem {
  service?: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Estimate {
  id: string;
  companyId: string;
  clientId: string;
  estimateNumber: number;
  title: string;
  status: EstimateStatus;
  notes?: string;
  estimateDate: string;
  lineItems: LineItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEstimateInput {
  clientId: string;
  title: string;
  notes?: string;
  estimateDate: string;
  lineItems: Omit<LineItem, 'total'>[];
}

export interface UpdateEstimateInput {
  title: string;
  notes?: string;
  estimateDate: string;
  lineItems: Omit<LineItem, 'total'>[];
}

export interface UpdateEstimateStatusInput {
  status: EstimateStatus;
}

export type EstimateStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'DECLINED' | 'VOID' | 'INVOICED';

export interface LineItem {
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

export interface EstimatesPageResponse {
  totalElements: number;
  totalPages: number;
  size: number;
  content: Estimate[];
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface EstimatesState {
  estimates: Estimate[];
  total: number;
  loading: boolean;
  error: string | null;
  filters: {
    page: number;
    size: number;
    sort?: string;
    clientId?: string;
  };
}

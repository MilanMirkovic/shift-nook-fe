export type EstimateStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'DECLINED' | 'VOID' | 'INVOICED';

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
  jobsiteId?: string;
  jobsiteName?: string;
  jobsiteAddress?: string;
  estimateNumber: number;
  title: string;
  status: EstimateStatus;
  notes?: string;
  estimateDate: string;
  lineItems: LineItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
  revisionNumber: string;
}

export interface CreateEstimateInput {
  clientId: string;
  jobsiteId?: string;
  title: string;
  notes?: string;
  estimateDate: string;
  lineItems: Omit<LineItem, 'total'>[];
}

export interface UpdateEstimateInput {
  jobsiteId?: string;
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

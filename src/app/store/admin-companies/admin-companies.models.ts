export interface AdminCompany {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  website: string | null;
  logoUrl: string | null;
  memberCount: number;
  createdAt: string; // ISO-8601
}

export interface AdminCompaniesPageResponse {
  content: AdminCompany[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface CreateCompanyRequest {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
}

export interface AdminCompaniesState {
  items: AdminCompany[];
  total: number;
  page: number;
  size: number;
  loading: boolean;
  error: string | null;

  // Single company detail
  selectedCompany: AdminCompany | null;
  selectedCompanyLoading: boolean;
  selectedCompanyError: string | null;

  // For create/update operations
  submitting: boolean;
  submitError: string | null;
}


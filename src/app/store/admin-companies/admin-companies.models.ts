export interface AdminCompany {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  website: string | null;
  logoFileId: string | null;
  createdAt: string; // ISO-8601
}

// Matches Spring's Page<T> JSON structure
export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

export type AdminCompaniesPageResponse = SpringPage<AdminCompany>;

export interface CreateCompanyRequest {
  name: string;
  address?: string;
  email?: string;
  website?: string;
  phone?: string;
  ownerUserId?: string;
}

export interface UpdateCompanyRequest {
  name?: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  website?: string | null;
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

  // For create/update/delete operations
  submitting: boolean;
  submitError: string | null;
}

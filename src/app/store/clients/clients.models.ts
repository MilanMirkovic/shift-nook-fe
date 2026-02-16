export interface Client {
  id?: string;
  companyId: string;
  name: string;
  email: string;
  phone?: string;
  createdAt?: string;
}

export interface PagedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

/**
 * Raw backend response (Spring Page)
 */
export interface ClientsApiPage {
  content: Client[];
  totalElements: number;
  number: number;
  size: number;
}

export interface ClientsState {
  items: Client[];
  total: number;

  page: number;
  size: number;

  loading: boolean;
  error: string | null;
}

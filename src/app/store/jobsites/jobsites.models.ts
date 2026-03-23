export interface Jobsite {
  id: string;
  companyId: string;
  clientId: string;
  clientName?: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  createdAt: string;
}

export interface CreateJobsiteInput {
  name: string;
  address: string;
  clientId: string;
  latitude: number;
  longitude: number;
}

export interface UpdateJobsiteInput {
  name: string;
  address: string;
  clientId: string;
  latitude: number;
  longitude: number;
}

export interface JobsitesPageResponse {
  totalElements: number;
  totalPages: number;
  size: number;
  content: Jobsite[];
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface JobsitesState {
  jobsites: Jobsite[];
  total: number;
  loading: boolean;
  error: string | null;
  filters: {
    page: number;
    size: number;
    sort?: string;
    search?: string;
  };
}

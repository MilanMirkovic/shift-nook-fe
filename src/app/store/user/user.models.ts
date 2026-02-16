import { CompanyRole } from '../../shared/models/company-role';

export interface CompanyMembership {
  companyId: string;
  companyName: string;
  role: CompanyRole;
  memberSince: string; // ISO 8601 date string
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  cognitoUserId: string;
  canCreateCompany: boolean;
  createdAt: string; // ISO 8601 date string
  companies: CompanyMembership[];
}

export interface UserState {
  user: User | null;
  selectedCompanyId: string | null;
  loading: boolean;
  error: string | null;
}

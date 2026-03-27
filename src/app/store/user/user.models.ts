import { CompanyRole } from '../../shared/models/company-role';
import { UserRole } from '../../shared/models/user-role';

export interface CompanyMembership {
  companyId: string;
  companyName: string;
  role: CompanyRole;
  memberSince: string; // ISO 8601 date string
  logoUrl?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  cognitoUserId: string;
  role: UserRole;               // platform-level role
  canCreateCompany: boolean;
  createdAt: string; // ISO 8601 date string
  onboardingComplete: boolean;
  companies: CompanyMembership[];
}

export interface UserState {
  user: User | null;
  selectedCompanyId: string | null;
  loading: boolean;
  error: string | null;
}

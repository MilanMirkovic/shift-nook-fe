import { UserRole } from '../../shared/models/user-role';
import { CompanyRole } from '../../shared/models/company-role';

export interface CompanyAssignment {
  companyId: string;
  companyName: string;
  companyRole: CompanyRole;
  memberSince: string; // ISO-8601
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  canCreateCompany: boolean;
  createdAt: string; // ISO-8601
  onboardingComplete: boolean;
  companies: CompanyAssignment[];
}

export interface AdminUsersPageResponse {
  content: AdminUser[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  canCreateCompany: boolean;
}

export interface UpdateRoleRequest {
  role: UserRole;
}

export interface AssignCompanyRequest {
  companyId: string;
  role: CompanyRole;
}

export interface AdminUsersState {
  items: AdminUser[];
  total: number;
  page: number;
  size: number;
  loading: boolean;
  error: string | null;

  // Single user detail
  selectedUser: AdminUser | null;
  selectedUserLoading: boolean;
  selectedUserError: string | null;

  // For create/update operations
  submitting: boolean;
  submitError: string | null;
}

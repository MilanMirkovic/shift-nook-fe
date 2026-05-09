import { CompanyRole } from '../../shared/models/company-role';

export interface AccountantMetrics {
  hoursWorked: number;
  invoicesCreated: number;
  invoicesValue: number;
  companiesAssigned: number;
}

export interface CompanyAssignment {
  companyId: string;
  companyName: string;
  assignedAt: string;
  assignedBy: string;
}

export interface AccountantTeamMember {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: CompanyRole;
  metrics: AccountantMetrics;
  assignedCompanies: CompanyAssignment[];
}

export interface AccountantDetail extends AccountantTeamMember {
  memberSince: string;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'invoice_created' | 'timesheet_submitted' | 'company_assigned';
  description: string;
  timestamp: string;
}

export interface AssignCompaniesRequest {
  companyIds: string[];
}

export interface PagedResponse<T> {
  items: T[];
  total: number;
}

export interface AccountantTeamStats {
  totalAccountants: number;
  activeAccountants: number;
  pendingInvites: number;
  companiesManaged: number;
  totalHoursWorked: number;
  totalInvoices: number;
}

export interface AccountantTeamState {
  accountants: AccountantTeamMember[];
  total: number;
  page: number;
  size: number;
  filters: {
    q: string | null;
  };
  loading: boolean;
  loaded: boolean;
  error: string | null;

  stats: AccountantTeamStats | null;
  statsLoading: boolean;
  statsError: string | null;

  selectedAccountant: AccountantDetail | null;
  selectedLoading: boolean;
  selectedError: string | null;

  assigningCompanies: boolean;
  assignError: string | null;
}

export const ACCOUNTANT_TEAM_FEATURE_KEY = 'accountantTeam';

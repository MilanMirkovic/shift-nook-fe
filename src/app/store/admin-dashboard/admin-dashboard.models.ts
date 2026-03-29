export interface AdminPlatformStats {
  totalUsers: number;
  totalAdmins: number;
  totalRegularUsers: number;
  totalCompanies: number;
  newUsersLast30Days: number;
  newCompaniesLast30Days: number;
  usersWithCompanies: number;
  usersWithoutCompanies: number;
  onboardingCompleteUsers: number;
  onboardingIncompleteUsers: number;
}

export interface AdminRecentActivity {
  recentUsers: RecentUser[];
  recentCompanies: RecentCompany[];
}

export interface RecentUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
  onboardingComplete: boolean;
}

export interface RecentCompany {
  id: string;
  name: string;
  email: string | null;
  createdAt: string;
}

export interface AdminDashboardState {
  stats: AdminPlatformStats | null;
  recentUsers: RecentUser[];
  recentCompanies: RecentCompany[];
  loading: boolean;
  error: string | null;
}


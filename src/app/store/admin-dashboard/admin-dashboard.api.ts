import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminPlatformStats, RecentUser, RecentCompany } from './admin-dashboard.models';
import { AdminUsersPageResponse } from '../admin-users/admin-users.models';
import { AdminCompaniesPageResponse } from '../admin-companies/admin-companies.models';

@Injectable({ providedIn: 'root' })
export class AdminDashboardApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  /**
   * Load all dashboard data in parallel:
   * - users page (size=1 to get totals fast, plus a recent page)
   * - companies page (same approach)
   */
  loadDashboardData(): Observable<{
    stats: AdminPlatformStats;
    recentUsers: RecentUser[];
    recentCompanies: RecentCompany[];
  }> {
    const usersAll$ = this.http.get<AdminUsersPageResponse>(
      `${this.baseUrl}/admin/users`,
      { params: new HttpParams().set('page', 0).set('size', 50) }
    );
    const companiesAll$ = this.http.get<AdminCompaniesPageResponse>(
      `${this.baseUrl}/admin/companies`,
      { params: new HttpParams().set('page', 0).set('size', 50) }
    );

    return forkJoin({ users: usersAll$, companies: companiesAll$ }).pipe(
      map(({ users, companies }) => {
        const allUsers = users.content;
        const allCompanies = companies.content;

        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const totalUsers = users.totalElements;
        const totalAdmins = allUsers.filter(u => u.role === 'ADMIN').length;
        const totalRegularUsers = allUsers.filter(u => u.role === 'USER').length;
        const totalCompanies = companies.totalElements;

        const newUsersLast30Days = allUsers.filter(
          u => new Date(u.createdAt) >= thirtyDaysAgo
        ).length;
        const newCompaniesLast30Days = allCompanies.filter(
          c => new Date(c.createdAt) >= thirtyDaysAgo
        ).length;

        const usersWithCompanies = allUsers.filter(u => u.companies && u.companies.length > 0).length;
        const usersWithoutCompanies = allUsers.filter(u => !u.companies || u.companies.length === 0).length;

        const onboardingCompleteUsers = allUsers.filter(u => u.onboardingComplete).length;
        const onboardingIncompleteUsers = allUsers.filter(u => !u.onboardingComplete).length;

        const stats: AdminPlatformStats = {
          totalUsers,
          totalAdmins,
          totalRegularUsers,
          totalCompanies,
          newUsersLast30Days,
          newCompaniesLast30Days,
          usersWithCompanies,
          usersWithoutCompanies,
          onboardingCompleteUsers,
          onboardingIncompleteUsers,
        };

        const recentUsers: RecentUser[] = [...allUsers]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 8)
          .map(u => ({
            id: u.id,
            firstName: u.firstName,
            lastName: u.lastName,
            email: u.email,
            role: u.role,
            createdAt: u.createdAt,
            onboardingComplete: u.onboardingComplete,
          }));

        const recentCompanies: RecentCompany[] = [...allCompanies]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 8)
          .map(c => ({
            id: c.id,
            name: c.name,
            email: c.email,
            createdAt: c.createdAt,
          }));

        return { stats, recentUsers, recentCompanies };
      })
    );
  }
}


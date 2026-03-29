import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';

import { PageLayoutComponent } from '../../layout/page-layout/page-layout.component';
import {
  selectAdminDashboardStats,
  selectAdminDashboardRecentUsers,
  selectAdminDashboardRecentCompanies,
  selectAdminDashboardLoading,
  selectAdminDashboardError,
} from '../../store/admin-dashboard/admin-dashboard.selectors';
import { loadAdminDashboard } from '../../store/admin-dashboard/admin-dashboard.actions';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule,
    PageLayoutComponent,
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly router = inject(Router);

  readonly stats$ = this.store.select(selectAdminDashboardStats);
  readonly recentUsers$ = this.store.select(selectAdminDashboardRecentUsers);
  readonly recentCompanies$ = this.store.select(selectAdminDashboardRecentCompanies);
  readonly loading$ = this.store.select(selectAdminDashboardLoading);
  readonly error$ = this.store.select(selectAdminDashboardError);

  readonly today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  ngOnInit(): void {
    this.store.dispatch(loadAdminDashboard());
  }

  refresh(): void {
    this.store.dispatch(loadAdminDashboard());
  }

  goToUsers(): void {
    this.router.navigate(['/admin/users']);
  }

  goToCompanies(): void {
    this.router.navigate(['/admin/companies']);
  }

  goToUser(userId: string): void {
    this.router.navigate(['/admin/users', userId]);
  }

  goToCompany(companyId: string): void {
    this.router.navigate(['/admin/companies', companyId]);
  }

  getInitials(firstName: string, lastName: string): string {
    return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();
  }

  getCompanyInitials(name: string): string {
    return name
      ?.split(' ')
      .slice(0, 2)
      .map(w => w[0])
      .join('')
      .toUpperCase() ?? '';
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  onboardingPercent(stats: { onboardingCompleteUsers: number; totalUsers: number }): number {
    if (!stats.totalUsers) return 0;
    return Math.round((stats.onboardingCompleteUsers / stats.totalUsers) * 100);
  }

  companyAssignedPercent(stats: { usersWithCompanies: number; totalUsers: number }): number {
    if (!stats.totalUsers) return 0;
    return Math.round((stats.usersWithCompanies / stats.totalUsers) * 100);
  }
}

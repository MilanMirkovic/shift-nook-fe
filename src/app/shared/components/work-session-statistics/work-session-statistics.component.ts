import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Subject, combineLatest, map } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import {
  CompanyWorkSessionsStoreService
} from '../../../store/company-work-sessions/company-work-sessions-store.service';

type PeriodType = 'daily' | 'weekly' | 'monthly' | 'yearly';

@Component({
  selector: 'app-work-session-statistics',
  standalone: false,
  templateUrl: './work-session-statistics.component.html',
  styleUrl: './work-session-statistics.component.scss'
})
export class WorkSessionStatisticsComponent implements OnInit, OnDestroy {
  private readonly workSessionStore = inject(CompanyWorkSessionsStoreService);
  private readonly destroy$ = new Subject<void>();
  private readonly selectedCompanyId$ = new BehaviorSubject<string | null>(null);

  statistics$ = this.workSessionStore.getStatistics();
  loading$ = this.workSessionStore.getStatisticsLoading();
  error$ = this.workSessionStore.getStatisticsError();
  companiesWorkTime$ = this.workSessionStore.getCompaniesByWorkTime();

  selectedPeriod: PeriodType = 'daily';
  selectedDate: Date = new Date();

  get selectedCompanyId(): string | null {
    return this.selectedCompanyId$.value;
  }

  set selectedCompanyId(value: string | null) {
    this.selectedCompanyId$.next(value);
  }

  // Filtered statistics based on selected company
  filteredStatistics$ = combineLatest([
    this.statistics$,
    this.selectedCompanyId$
  ]).pipe(
    map(([stats, companyId]) => {
      if (!stats || !companyId) {
        return stats;
      }

      const filteredCompany = stats.byCompany.find(c => c.companyId === companyId);
      if (!filteredCompany) {
        return stats;
      }

      return {
        totalMinutes: stats.totalMinutes, // Keep the original total for percentage calculation
        byCompany: [filteredCompany]
      };
    })
  );

  // Get available companies for the filter dropdown
  availableCompanies$ = this.statistics$.pipe(
    map(stats => stats?.byCompany || [])
  );

  private readonly timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  ngOnInit(): void {
    this.loadStatistics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.selectedCompanyId$.complete();
  }

  onPeriodChange(period: PeriodType): void {
    this.selectedPeriod = period;
    this.loadStatistics();
  }

  onCompanyFilterChange(companyId: string | null): void {
    this.selectedCompanyId = companyId;
  }

  clearCompanyFilter(): void {
    this.selectedCompanyId = null;
  }

  onDateChange(date: Date): void {
    this.selectedDate = date;
    this.loadStatistics();
  }

  loadStatistics(): void {
    const date = this.selectedDate;

    switch (this.selectedPeriod) {
      case 'daily':
        const dateStr = this.formatDate(date);
        this.workSessionStore.loadDailyStatistics(dateStr, this.timezone);
        break;

      case 'weekly':
        const weekStart = this.getWeekStart(date);
        this.workSessionStore.loadWeeklyStatistics(this.formatDate(weekStart), this.timezone);
        break;

      case 'monthly':
        this.workSessionStore.loadMonthlyStatistics(
          date.getFullYear(),
          date.getMonth() + 1,
          this.timezone
        );
        break;

      case 'yearly':
        this.workSessionStore.loadYearlyStatistics(date.getFullYear(), this.timezone);
        break;
    }
  }

  formatMinutesToHours(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }

  getPercentage(companyMinutes: number, totalMinutes: number): number {
    return totalMinutes > 0 ? Math.round((companyMinutes / totalMinutes) * 100) : 0;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
    return new Date(d.setDate(diff));
  }

  navigatePrevious(): void {
    const date = new Date(this.selectedDate);

    switch (this.selectedPeriod) {
      case 'daily':
        date.setDate(date.getDate() - 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() - 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() - 1);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() - 1);
        break;
    }

    this.selectedDate = date;
    this.loadStatistics();
  }

  navigateNext(): void {
    const date = new Date(this.selectedDate);

    switch (this.selectedPeriod) {
      case 'daily':
        date.setDate(date.getDate() + 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
    }

    this.selectedDate = date;
    this.loadStatistics();
  }

  navigateToday(): void {
    this.selectedDate = new Date();
    this.loadStatistics();
  }

  getPeriodLabel(): string {
    const date = this.selectedDate;

    switch (this.selectedPeriod) {
      case 'daily':
        return date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      case 'weekly':
        const weekStart = this.getWeekStart(date);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      case 'monthly':
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      case 'yearly':
        return date.getFullYear().toString();
    }
  }

  getCompanyColor(index: number): string {
    const colors = [
      'linear-gradient(135deg, #667eea, #764ba2)',
      'linear-gradient(135deg, #f093fb, #f5576c)',
      'linear-gradient(135deg, #4facfe, #00f2fe)',
      'linear-gradient(135deg, #43e97b, #38f9d7)',
      'linear-gradient(135deg, #fa709a, #fee140)',
      'linear-gradient(135deg, #30cfd0, #330867)',
      'linear-gradient(135deg, #a8edea, #fed6e3)',
      'linear-gradient(135deg, #ff9a9e, #fecfef)',
      'linear-gradient(135deg, #ffecd2, #fcb69f)',
      'linear-gradient(135deg, #ff6e7f, #bfe9ff)',
    ];
    return colors[index % colors.length];
  }

  getTotalSessions(companies: any[]): number {
    return companies.reduce((sum, company) => sum + company.sessionCount, 0);
  }

  getAverageSessionDuration(companies: any[]): string {
    const totalSessions = this.getTotalSessions(companies);
    if (totalSessions === 0) return '0h 0m';

    const totalMinutes = companies.reduce((sum, company) => sum + company.totalMinutes, 0);
    const averageMinutes = Math.round(totalMinutes / totalSessions);

    return this.formatMinutesToHours(averageMinutes);
  }

  trackByIndex(index: number): number {
    return index;
  }

  trackByCompanyId(index: number, company: any): string {
    return company.companyId;
  }
}

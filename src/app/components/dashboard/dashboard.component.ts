import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy } from '@angular/core';
import { Subject, takeUntil, combineLatest } from 'rxjs';

import { UserStoreService } from '../../store/user/user-store.service';
import { TimesheetsStoreService } from '../../store/timesheets/timesheets-store.service';
import { JobsitesStoreService } from '../../store/jobsites/jobsites-store.service';
import { Store } from '@ngrx/store';
import { selectTotal as selectClientsTotal } from '../../store/clients/clients.selectors';
import { selectTotal as selectMembersTotal, selectMembers } from '../../store/company-members/company-members.selectors';
import { loadClients } from '../../store/clients/clients.actions';
import { loadMembers } from '../../store/company-members/company-members.actions';
import { Timesheet } from '../../store/timesheets/timesheets.models';
import { CompanyMember } from '../../store/company-members/company-members.models';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly userStore = inject(UserStoreService);
  private readonly timesheetsStore = inject(TimesheetsStoreService);
  private readonly jobsitesStore = inject(JobsitesStoreService);
  private readonly store = inject(Store);
  private readonly destroy$ = new Subject<void>();

  // Observables for stats
  clientsTotal$ = this.store.select(selectClientsTotal);
  jobsitesTotal$ = this.jobsitesStore.total$;
  membersTotal$ = this.store.select(selectMembersTotal);

  // Local state
  loading = true;
  todayTimesheets: Timesheet[] = [];
  activeTimesheets: Timesheet[] = [];
  recentTimesheets: Timesheet[] = [];
  activeTimesheetsCount = 0;
  completedToday = 0;
  totalHoursToday = '0h 0m';
  todayFormatted = '';
  private membersMap = new Map<string, CompanyMember>();

  ngOnInit(): void {
    this.todayFormatted = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });

    // Load data when company is available
    this.userStore.selectedCompanyId$
      .pipe(takeUntil(this.destroy$))
      .subscribe(companyId => {
        if (companyId) {
          this.loadDashboardData(companyId);
        }
      });

    // Subscribe to timesheets and members together to enrich with worker names
    combineLatest([
      this.timesheetsStore.timesheets$,
      this.store.select(selectMembers)
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([timesheets, members]) => {
        // Build members lookup map
        this.membersMap.clear();
        members.forEach(m => this.membersMap.set(m.userId, m));

        this.processTimesheets(timesheets);
        this.loading = false;
      });
  }

  private loadDashboardData(companyId: string): void {
    // Load clients
    this.store.dispatch(loadClients({ companyId, page: 0, size: 1 }));

    // Load jobsites
    this.jobsitesStore.loadJobsites(companyId, 0, 1);

    // Load company members (load more to get worker names)
    this.store.dispatch(loadMembers({ companyId, page: 0, size: 100, role: null, q: null }));

    // Load timesheets (for today)
    this.timesheetsStore.loadTimesheets(companyId, 0, 50);
  }

  private processTimesheets(timesheets: Timesheet[]): void {
    // Enrich timesheets with worker names
    const enrichedTimesheets = timesheets.map(t => {
      const member = this.membersMap.get(t.workerUserId);
      return {
        ...t,
        workerName: member ? `${member.firstName} ${member.lastName}` : undefined
      };
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter today's timesheets
    this.todayTimesheets = enrichedTimesheets.filter(t => {
      const checkIn = new Date(t.checkInTime);
      checkIn.setHours(0, 0, 0, 0);
      return checkIn.getTime() === today.getTime();
    });

    // Active timesheets (OPEN status)
    this.activeTimesheets = enrichedTimesheets.filter(t => t.status === 'OPEN');
    this.activeTimesheetsCount = this.activeTimesheets.length;

    // Completed today
    this.completedToday = this.todayTimesheets.filter(t => t.status === 'CLOSED').length;

    // Calculate total hours worked today
    const totalMinutes = this.todayTimesheets.reduce((sum, t) => sum + (t.durationMinutes || 0), 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    this.totalHoursToday = `${hours}h ${minutes}m`;

    // Recent timesheets (last 10)
    this.recentTimesheets = [...enrichedTimesheets]
      .sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime())
      .slice(0, 10);
  }

  formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDateTime(dateStr: string | null | undefined): string {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDuration(minutes: number | null | undefined): string {
    if (minutes == null) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }

  calculateDuration(checkInTime: string): string {
    const start = new Date(checkInTime);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    return this.formatDuration(diffMins);
  }

  trackById(index: number, item: Timesheet): string {
    return item.id;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

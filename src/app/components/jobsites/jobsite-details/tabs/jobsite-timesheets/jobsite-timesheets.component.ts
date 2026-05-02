import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, OnChanges, SimpleChanges, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil, filter, take } from 'rxjs/operators';

import { Jobsite } from '../../../../../store/jobsites/jobsites.models';
import { Timesheet } from '../../../../../store/timesheets/timesheets.models';
import { CompanyMember } from '../../../../../store/company-members/company-members.models';
import { CompanyRole } from '../../../../../shared/models/company-role';
import { selectTimesheets, selectTimesheetsLoading } from '../../../../../store/timesheets/timesheets.selectors';
import { selectMembers } from '../../../../../store/company-members/company-members.selectors';
import { selectCurrentUserRole, selectSelectedCompanyId } from '../../../../../store/user/user.selectors';
import { CreateInvoiceFromTimesheetsDialogComponent, CreateInvoiceFromTimesheetsDialogData } from '../../../../../shared/components/create-invoice-from-timesheets-dialog/create-invoice-from-timesheets-dialog.component';
import { loadJobsiteTimesheets } from '../../../../../store/timesheets/timesheets.actions';
import { loadMembers } from '../../../../../store/company-members/company-members.actions';

@Component({
  selector: 'app-jobsite-timesheets',
  standalone: false,
  templateUrl: './jobsite-timesheets.component.html',
  styleUrls: ['./jobsite-timesheets.component.scss']
})
export class JobsiteTimesheetsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() jobsite!: Jobsite;
  @Output() createTimesheet = new EventEmitter<void>();
  @Output() invoiceCreated = new EventEmitter<void>();

  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly store = inject(Store);
  private readonly destroy$ = new Subject<void>();

  timesheets: Timesheet[] = [];
  companyMembers: CompanyMember[] = [];
  currentUserRole: CompanyRole | null = null;
  currentCompanyId: string | null = null;
  loading = false;

  // Filters
  showFilters = false;
  filterStartDate: Date | null = null;
  filterEndDate: Date | null = null;
  private activeStartDate: Date | null = null;
  private activeEndDate: Date | null = null;

  // Expand/collapse per worker
  private expandedWorkers = new Set<string>();

  ngOnInit(): void {
    // Subscribe to timesheets
    this.store.select(selectTimesheets).pipe(
      takeUntil(this.destroy$)
    ).subscribe(timesheets => {
      this.timesheets = timesheets;
    });

    // Subscribe to loading state
    this.store.select(selectTimesheetsLoading).pipe(
      takeUntil(this.destroy$)
    ).subscribe(loading => {
      this.loading = loading;
    });

    // Subscribe to company members
    this.store.select(selectMembers).pipe(
      takeUntil(this.destroy$)
    ).subscribe(members => {
      this.companyMembers = members;
    });

    // Subscribe to current user role
    this.store.select(selectCurrentUserRole).pipe(
      takeUntil(this.destroy$)
    ).subscribe(role => {
      this.currentUserRole = role;
    });

    // Subscribe to current company ID and load timesheets + members when it changes
    this.store.select(selectSelectedCompanyId).pipe(
      takeUntil(this.destroy$)
    ).subscribe(companyId => {
      this.currentCompanyId = companyId;
      if (companyId && this.jobsite?.id) {
        this.loadTimesheets(companyId);
      }
      if (companyId) {
        // Ensure company members (with hourly rates) are loaded
        this.store.dispatch(loadMembers({ companyId, page: 0, size: 200, role: null, q: null }));
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Reload timesheets when jobsite changes
    if (changes['jobsite'] && !changes['jobsite'].firstChange && this.currentCompanyId) {
      this.loadTimesheets(this.currentCompanyId);
    }
  }

  private loadTimesheets(companyId: string): void {
    if (!this.jobsite?.id) return;

    this.store.dispatch(loadJobsiteTimesheets({
      companyId,
      jobsiteId: this.jobsite.id,
      page: 0,
      size: 100 // Load more timesheets for jobsite view
    }));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─── Filter helpers ───────────────────────────────────────────────────────
  applyFilters(): void {
    this.activeStartDate = this.filterStartDate;
    this.activeEndDate = this.filterEndDate;
  }

  clearFilters(): void {
    this.filterStartDate = null;
    this.filterEndDate = null;
    this.activeStartDate = null;
    this.activeEndDate = null;
  }

  get filteredTimesheets(): Timesheet[] {
    return this.timesheets.filter(t => {
      const date = new Date(t.checkInTime);
      if (this.activeStartDate && date < this.activeStartDate) return false;
      if (this.activeEndDate) {
        const end = new Date(this.activeEndDate);
        end.setHours(23, 59, 59, 999);
        if (date > end) return false;
      }
      return true;
    });
  }

  // ─── Grouping ─────────────────────────────────────────────────────────────
  private resolveWorkerName(userId: string, fallback?: string): string {
    const member = this.companyMembers.find(m => m.userId === userId);
    if (member) {
      const name = `${member.firstName ?? ''} ${member.lastName ?? ''}`.trim();
      if (name) return name;
      if (member.email) return member.email;
    }
    // Use fallback only if it's not just the UUID
    if (fallback && fallback !== userId) return fallback;
    return 'Unknown worker';
  }

  getWorkerGroups(): { workerUserId: string; workerName: string; timesheets: Timesheet[] }[] {
    const map = new Map<string, { workerUserId: string; workerName: string; timesheets: Timesheet[] }>();
    for (const t of this.filteredTimesheets) {
      const key = t.workerUserId;
      if (!map.has(key)) {
        map.set(key, { workerUserId: key, workerName: this.resolveWorkerName(key, t.workerName), timesheets: [] });
      }
      map.get(key)!.timesheets.push(t);
    }
    // Sort timesheets within each group by check-in time desc
    for (const group of map.values()) {
      group.timesheets.sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime());
    }
    // Sort groups by most recent timesheet (desc) — today first
    const groups = Array.from(map.values()).sort((a, b) => {
      const aTime = a.timesheets.length ? new Date(a.timesheets[0].checkInTime).getTime() : 0;
      const bTime = b.timesheets.length ? new Date(b.timesheets[0].checkInTime).getTime() : 0;
      return bTime - aTime;
    });
    // Auto-expand the most recent group if none expanded
    if (this.expandedWorkers.size === 0 && groups.length) {
      this.expandedWorkers.add(groups[0].workerUserId);
    }
    return groups;
  }

  toggleWorker(workerUserId: string): void {
    if (this.expandedWorkers.has(workerUserId)) {
      this.expandedWorkers.delete(workerUserId);
    } else {
      this.expandedWorkers.add(workerUserId);
    }
  }

  isWorkerExpanded(workerUserId: string): boolean {
    return this.expandedWorkers.has(workerUserId);
  }

  // ─── Display helpers ──────────────────────────────────────────────────────
  getInitials(name: string): string {
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  }

  getTotalHoursForWorker(timesheets: Timesheet[]): string {
    const totalMinutes = timesheets.reduce((sum, t) => {
      if (!t.checkOutTime) return sum;
      const ms = new Date(t.checkOutTime).getTime() - new Date(t.checkInTime).getTime();
      return sum + ms / 60000;
    }, 0);
    return (totalMinutes / 60).toFixed(1);
  }

  formatDuration(timesheet: Timesheet): string {
    if (!timesheet.checkInTime) return 'N/A';
    const checkIn = new Date(timesheet.checkInTime);
    const checkOut = timesheet.checkOutTime ? new Date(timesheet.checkOutTime) : new Date();
    const diffMs = checkOut.getTime() - checkIn.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }

  getTimesheetStatusClass(timesheet: Timesheet): string {
    return timesheet.checkOutTime ? 'status--completed' : 'status--active';
  }

  getTimesheetStatusLabel(timesheet: Timesheet): string {
    return timesheet.checkOutTime ? 'Completed' : 'Active';
  }

  onCreateTimesheet(): void {
    this.createTimesheet.emit();
  }

  onCreateInvoiceFromTimesheets(): void {
    if (!this.currentCompanyId || !this.currentUserRole || !this.jobsite.clientId) {
      this.snackBar.open('Unable to create invoice: missing required information', 'Close', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(CreateInvoiceFromTimesheetsDialogComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: false,
      data: {
        companyId: this.currentCompanyId,
        jobsiteId: this.jobsite.id,
        jobsiteName: this.jobsite.name,
        jobsiteCompanyId: this.jobsite.companyId, // The company that owns the jobsite
        clientId: this.jobsite.clientId,
        currentUserRole: this.currentUserRole,
        timesheets: this.timesheets,
        companyMembers: this.companyMembers
      } as CreateInvoiceFromTimesheetsDialogData
    });

    dialogRef.afterClosed().subscribe(success => {
      if (success) {
        this.snackBar.open('Invoice created successfully!', 'Close', { duration: 3000 });
        // Timesheets will be automatically updated via NgRx store
        // Notify parent to switch to invoices tab
        this.invoiceCreated.emit();
      }
    });
  }
}


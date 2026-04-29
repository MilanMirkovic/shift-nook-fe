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
import { selectTimesheets } from '../../../../../store/timesheets/timesheets.selectors';
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

  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly store = inject(Store);
  private readonly destroy$ = new Subject<void>();

  timesheets: Timesheet[] = [];
  companyMembers: CompanyMember[] = [];
  currentUserRole: CompanyRole | null = null;
  currentCompanyId: string | null = null;

  ngOnInit(): void {
    // Subscribe to timesheets
    this.store.select(selectTimesheets).pipe(
      takeUntil(this.destroy$)
    ).subscribe(timesheets => {
      this.timesheets = timesheets;
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
      }
    });
  }
}


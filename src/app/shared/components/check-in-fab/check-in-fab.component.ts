import { Component, inject, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil, filter, combineLatest, Observable, map, switchMap, startWith, take, shareReplay, distinctUntilChanged } from 'rxjs';

import { UserStoreService } from '../../../store/user/user-store.service';
import { TimesheetsStoreService } from '../../../store/timesheets/timesheets-store.service';
import { CompanyRole } from '../../models/company-role';
import { CheckInDialogComponent } from '../check-in-dialog/check-in-dialog.component';
import { Timesheet } from '../../../store/timesheets/timesheets.models';

@Component({
  selector: 'app-check-in-fab',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatDialogModule, MatTooltipModule],
  templateUrl: './check-in-fab.component.html',
  styleUrls: ['./check-in-fab.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckInFabComponent implements OnInit, OnDestroy {
  private readonly userStore = inject(UserStoreService);
  private readonly timesheetsStore = inject(TimesheetsStoreService);
  private readonly dialog = inject(MatDialog);
  private readonly destroy$ = new Subject<void>();

  protected isWorker = false;
  protected activeTimesheet$: Observable<Timesheet | null> = this.userStore.user$.pipe(
    switchMap(user =>
      this.userStore.currentCompany$.pipe(
        map(company => ({ user, company }))
      )
    ),
    filter(({ user, company }) => !!user && !!company && !!user.id && !!company.companyId),
    switchMap(({ user }) => {
      return this.timesheetsStore.activeTimesheetsForWorker$(user!.id).pipe(
        map(activeTimesheets => activeTimesheets.length > 0 ? activeTimesheets[0] : null),
        distinctUntilChanged((prev, curr) => prev?.id === curr?.id)
      );
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  protected isCheckedIn$: Observable<boolean> = this.activeTimesheet$.pipe(
    map(timesheet => timesheet !== null),
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  ngOnInit(): void {
    // Load timesheets once on initialization
    combineLatest([this.userStore.user$, this.userStore.currentCompany$])
      .pipe(
        takeUntil(this.destroy$),
        filter(([user, company]) => !!user && !!company && !!user.id && !!company.companyId)
      )
      .subscribe(([user, company]) => {
        this.timesheetsStore.loadWorkerTimesheets(company!.companyId, user!.id);
      });

    // Check if user is a worker
    this.userStore.currentCompany$
      .pipe(takeUntil(this.destroy$))
      .subscribe(company => {
        this.isWorker = company?.role === CompanyRole.WORKER;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openCheckInDialog(): void {
    // First, ensure we reload the latest timesheets before opening the dialog
    combineLatest([
      this.userStore.user$,
      this.userStore.currentCompany$
    ])
      .pipe(
        take(1),
        filter(([user, company]) => !!user && !!company && !!user.id && !!company.companyId)
      )
      .subscribe(([user, company]) => {
        console.log('User and Company:', { userId: user!.id, companyId: company!.companyId });

        // Reload timesheets to ensure we have the latest data
        this.timesheetsStore.loadWorkerTimesheets(company!.companyId, user!.id);

        // Wait for loading to complete, then get the latest data
        this.timesheetsStore.loading$
          .pipe(
            filter(loading => !loading), // Wait until loading is false
            take(1), // Take only the first emission after loading completes
            switchMap(() => {
              // First check all timesheets in the store
              return this.timesheetsStore.timesheets$.pipe(
                take(1),
                switchMap(allTimesheets => {
                  console.log('All timesheets from store:', allTimesheets);
                  console.log('Filtering for userId:', user!.id);

                  // Ensure allTimesheets is an array
                  const timesheetsArray = Array.isArray(allTimesheets) ? allTimesheets : [];

                  const userTimesheets = timesheetsArray.filter(t => t.userId === user!.id || t.workerUserId === user!.id);
                  console.log('User timesheets:', userTimesheets);

                  const activeTimesheets = userTimesheets.filter(t => !t.checkOutTime && t.status !== 'CLOSED');
                  console.log('Active timesheets:', activeTimesheets);

                  return combineLatest([
                    this.isCheckedIn$,
                    this.activeTimesheet$
                  ]);
                })
              );
            }),
            take(1)
          )
          .subscribe(([isCheckedIn, activeTimesheet]) => {
            console.log('Opening dialog with:', { isCheckedIn, activeTimesheet });

            this.dialog.open(CheckInDialogComponent, {
              width: '500px',
              maxWidth: '90vw',
              disableClose: false,
              panelClass: 'check-in-dialog-container',
              data: {
                isCheckedIn,
                activeTimesheet: activeTimesheet || undefined
              }
            });
          });
      });
  }
}

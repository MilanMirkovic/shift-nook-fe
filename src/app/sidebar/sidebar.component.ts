import { Component, Input, Output, EventEmitter, inject, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, combineLatest, map, take } from 'rxjs';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';

import { UserStoreService } from '../store/user/user-store.service';
import { CompanyMembership } from '../store/user/user.models';
import { CompanyRole } from '../shared/models/company-role';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../shared/components/confirmation-dialog/confirmation-dialog.component';
import { StopSessionDialogComponent, StopSessionDialogResult } from '../shared/components/stop-session-dialog/stop-session-dialog.component';
import { CompanyWorkSessionsStoreService } from '../store/company-work-sessions/company-work-sessions-store.service';
import { AuthService } from '../core/auth/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule, MatButtonModule, MatListModule, MatDividerModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input({ required: true }) appName!: string;
  @Input({ required: true }) isHandset = false;
  @Input({ required: true }) isCollapsed = false;

  @Output() linkClicked = new EventEmitter<void>();

  private readonly userStore = inject(UserStoreService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly workSessionStore = inject(CompanyWorkSessionsStoreService);
  private readonly authService = inject(AuthService);
  private readonly destroy$ = new Subject<void>();

  protected currentCompany: CompanyMembership | null = null;
  protected hasMultipleCompanies = false;
  protected canSeeWorkers = true; // Only show Workers menu if user is not a WORKER
  protected canSeeClients = false; // Only show Clients menu for OWNER and ACCOUNTANT
  protected canSeeDashboard = false; // Only show Dashboard for OWNER and ACCOUNTANT
  protected isWorker = false; // Show Check In button only for WORKER role
  protected isAuthenticated = false;
  protected canSeeSubcontractors = false;   // OWNER or ADMIN of a company
  protected canSeePrincipalCompanies = false; // OWNER whose company is a sub (any company)

  ngOnInit(): void {
    // Check if user is authenticated
    this.userStore.isAuthenticated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAuth => {
        this.isAuthenticated = isAuth;
      });

    // Get current company
    this.userStore.currentCompany$
      .pipe(takeUntil(this.destroy$))
      .subscribe(company => {
        this.currentCompany = company;
      });

    // Check if user has multiple companies
    this.userStore.companies$
      .pipe(takeUntil(this.destroy$))
      .subscribe(companies => {
        this.hasMultipleCompanies = companies.length > 1;
      });

    // Determine if user can see Workers menu based on their role in the current company
    combineLatest([
      this.userStore.currentCompany$,
      this.userStore.selectedCompanyId$
    ]).pipe(
      map(([company, _]) => {
        // If no company selected or user is a WORKER, hide the Workers menu
        if (!company) return false;
        return company.role !== CompanyRole.WORKER;
      }),
      takeUntil(this.destroy$)
    ).subscribe(canSee => {
      this.canSeeWorkers = canSee;
    });

    // Determine if user can see Clients menu (only OWNER and ACCOUNTANT)
    this.userStore.currentCompany$
      .pipe(
        map(company => {
          if (!company) return false;
          return company.role === CompanyRole.OWNER || company.role === CompanyRole.ACCOUNTANT;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(canSee => {
        this.canSeeClients = canSee;
      });

    // Determine if user can see Dashboard (only OWNER and ACCOUNTANT)
    this.userStore.currentCompany$
      .pipe(
        map(company => {
          if (!company) return false;
          return company.role === CompanyRole.OWNER || company.role === CompanyRole.ACCOUNTANT;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(canSee => {
        this.canSeeDashboard = canSee;
      });

    // Subcontractors tab — OWNER or ADMIN of current company
    this.userStore.currentCompany$
      .pipe(
        map(company => company?.role === CompanyRole.OWNER || company?.role === CompanyRole.ADMIN),
        takeUntil(this.destroy$)
      )
      .subscribe(canSee => {
        this.canSeeSubcontractors = canSee;
      });

    // Principal Companies tab — OWNER of current company
    // (a sub-company owner manages their principal links from here)
    this.userStore.currentCompany$
      .pipe(
        map(company => company?.role === CompanyRole.OWNER),
        takeUntil(this.destroy$)
      )
      .subscribe(canSee => {
        this.canSeePrincipalCompanies = canSee;
      });

    // Determine if user is a WORKER (to show Check In button)
    this.userStore.currentCompany$
      .pipe(
        map(company => company?.role === CompanyRole.WORKER),
        takeUntil(this.destroy$)
      )
      .subscribe(isWorker => {
        this.isWorker = isWorker;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected onLinkClicked(): void {
    this.linkClicked.emit();
  }

  protected onSwitchCompany(): void {
    // Only show confirmation dialog if user is an ACCOUNTANT with an active session
    if (this.currentCompany?.role === CompanyRole.ACCOUNTANT) {
      this.workSessionStore.getActiveSession()
        .pipe(take(1))
        .subscribe(activeSession => {
          if (activeSession?.isActive) {
            // Show confirmation dialog with description field
            const dialogRef = this.dialog.open(StopSessionDialogComponent, {
              width: '450px',
              maxWidth: '90vw',
              data: {
                currentCompanyName: activeSession.companyName
              },
              autoFocus: false,
              panelClass: 'stop-session-dialog-panel'
            });

            dialogRef.afterClosed().subscribe((result: StopSessionDialogResult | undefined) => {
              if (result?.confirmed) {
                // Stop the current session with description
                this.workSessionStore.stopWorkSession(result.description);
                // Navigate to company selection
                this.router.navigate(['/select-company']);
                this.linkClicked.emit();
              }
            });
          } else {
            // No active session, just navigate
            this.router.navigate(['/select-company']);
            this.linkClicked.emit();
          }
        });
    } else {
      // For non-ACCOUNTANT roles, just navigate
      this.router.navigate(['/select-company']);
      this.linkClicked.emit();
    }
  }

  protected getCompanyInitials(companyName: string): string {
    return companyName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  protected onSignOut(): void {
    // Only stop work session if user is an ACCOUNTANT
    if (this.currentCompany?.role === CompanyRole.ACCOUNTANT) {
      this.workSessionStore.stopWorkSession();
    }

    const dialogData: ConfirmationDialogData = {
      title: 'Sign Out',
      message: 'Are you sure you want to sign out?',
      confirmText: 'Yes, Sign Out',
      cancelText: 'Cancel',
      type: 'warning'
    };

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '440px',
      maxWidth: '90vw',
      data: dialogData,
      disableClose: false,
      autoFocus: true,
      panelClass: 'confirmation-dialog-panel',
      position: {
        top: '1%',

      },
      // This will center the dialog
      hasBackdrop: true,
      backdropClass: 'confirmation-dialog-backdrop'
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result === true) {
        // Sign out from Cognito first, then clear the store and redirect
        await this.authService.signOut();
        this.userStore.logout();
        this.linkClicked.emit();
        this.router.navigate(['/login']);
      }
    });
  }
}

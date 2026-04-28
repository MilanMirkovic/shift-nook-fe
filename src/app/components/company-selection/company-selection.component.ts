import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil, take, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserStoreService } from '../../store/user/user-store.service';
import { CompanyMembership } from '../../store/user/user.models';
import { CompanyWorkSessionsStoreService } from '../../store/company-work-sessions/company-work-sessions-store.service';
import { Actions, ofType } from '@ngrx/effects';
import * as WorkSessionActions from '../../store/company-work-sessions/company-work-sessions.actions';
import { CompanyRole } from '../../shared/models/company-role';
import { CompanyApiService } from '../../api/company.api.service';

@Component({
  selector: 'app-company-selection',
  standalone: false,
  templateUrl: './company-selection.component.html',
  styleUrl: './company-selection.component.scss'
})
export class CompanySelectionComponent implements OnInit, OnDestroy {
  private readonly userStore = inject(UserStoreService);
  private readonly workSessionStore = inject(CompanyWorkSessionsStoreService);
  private readonly actions$ = inject(Actions);
  private readonly companyApi = inject(CompanyApiService);
  protected readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  companies: CompanyMembership[] = [];
  loading = true;

  ngOnInit(): void {
    this.userStore.getUserCompanies()
      .pipe(takeUntil(this.destroy$))
      .subscribe(companies => {
        // Don't filter out SUBCONTRACTOR companies - users can be subcontractors in other companies
        if (companies.length === 0) {
          this.companies = companies;
          this.loading = false;
          this.userStore.user$.pipe(take(1)).subscribe(user => {
            if (user?.canCreateCompany) {
              this.router.navigate(['/create-company']);
            } else {
              this.router.navigate(['/dashboard']);
            }
          });
          return;
        }

        // Fetch logos for all companies in parallel
        forkJoin(
          companies.map(c =>
            this.companyApi.getLogo(c.companyId).pipe(
              catchError(() => of({ logoUrl: undefined }))
            )
          )
        ).pipe(take(1)).subscribe(logoResponses => {
          this.companies = companies.map((c, i) => ({
            ...c,
            logoUrl: logoResponses[i]?.logoUrl || undefined
          }));
          this.loading = false;

          if (this.companies.length === 1) {
            this.selectCompany(this.companies[0]);
          }
        });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectCompany(company: CompanyMembership): void {
    // Only stop/start work sessions for ACCOUNTANT role
    if (company.role === CompanyRole.ACCOUNTANT) {
      // Check if there's an active session first
      this.workSessionStore.getActiveSession()
        .pipe(take(1))
        .subscribe(activeSession => {
          if (activeSession?.isActive) {
            // Stop the current session and wait for it to complete
            this.workSessionStore.stopWorkSession();

            // Wait for stop to complete before starting new session
            this.actions$.pipe(
              ofType(WorkSessionActions.stopWorkSessionSuccess, WorkSessionActions.stopWorkSessionFailure),
              take(1)
            ).subscribe(() => {
              this.startNewCompanySession(company);
            });
          } else {
            // No active session, just start the new one
            this.startNewCompanySession(company);
          }
        });
    } else if (company.role === CompanyRole.WORKER || company.role === CompanyRole.OWNER || company.role === CompanyRole.SUBCONTRACTOR) {
      // For WORKER, OWNER, and SUBCONTRACTOR roles, select company and navigate to jobsites
      this.userStore.selectCompany(company.companyId);
      console.log('Switched company (worker/owner/subcontractor):', company);
      this.router.navigate(['/jobsites']);
    } else {
      // For other roles, just select the company without time tracking
      this.userStore.selectCompany(company.companyId);
      console.log('Switched company (no time tracking):', company);
      this.router.navigate(['/dashboard']);
    }
  }

  private startNewCompanySession(company: CompanyMembership): void {
    // Store selected company in state
    this.userStore.selectCompany(company.companyId);

    // Start work session tracking for the new company (only called for ACCOUNTANT)
    this.workSessionStore.startWorkSession(company.companyId);

    console.log('Switched company and started new work session:', company);
    this.router.navigate(['/dashboard']);
  }

  getCompanyInitials(companyName: string): string {
    return companyName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  formatMemberSince(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long'
    }).format(date);
  }

  trackByCompanyId(index: number, item: CompanyMembership): string {
    return item.companyId;
  }
}

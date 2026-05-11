import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserStoreService } from '../store/user/user-store.service';
import { CompanyWorkSessionsStoreService } from '../store/company-work-sessions/company-work-sessions-store.service';
import { CompanyRole } from '../shared/models/company-role';
import { take } from 'rxjs';

/**
 * Handles /companies/:companyId
 *
 * Selects the given company in the store then redirects to /dashboard.
 * This is the landing target after a worker/accountant accepts an invitation.
 * For accountants, also starts their work session timer.
 */
@Component({
  selector: 'app-company-redirect-page',
  standalone: true,
  template: ``,
})
export class CompanyRedirectPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly userStore = inject(UserStoreService);
  private readonly workSessionStore = inject(CompanyWorkSessionsStoreService);

  ngOnInit(): void {
    const companyId = this.route.snapshot.paramMap.get('companyId');
    if (companyId) {
      this.userStore.selectCompany(companyId);

      // Start work session for accountants
      this.userStore.currentCompany$
        .pipe(take(1))
        .subscribe(company => {
          if (company && (company.role === CompanyRole.ACCOUNTANT || company.role === CompanyRole.ACCOUNTING_MANAGER)) {
            this.workSessionStore.startWorkSession(companyId);
          }
        });
    }
    this.router.navigate(['/dashboard'], { replaceUrl: true });
  }
}


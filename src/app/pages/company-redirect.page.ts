import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserStoreService } from '../store/user/user-store.service';

/**
 * Handles /companies/:companyId
 *
 * Selects the given company in the store then redirects to /dashboard.
 * This is the landing target after a worker accepts an invitation.
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

  ngOnInit(): void {
    const companyId = this.route.snapshot.paramMap.get('companyId');
    if (companyId) {
      this.userStore.selectCompany(companyId);
    }
    this.router.navigate(['/dashboard'], { replaceUrl: true });
  }
}


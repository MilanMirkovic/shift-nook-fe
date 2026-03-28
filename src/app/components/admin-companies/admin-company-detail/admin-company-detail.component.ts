import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { Subject, take, takeUntil } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';

import { PageLayoutComponent } from '../../../layout/page-layout/page-layout.component';
import {
  selectSelectedAdminCompany,
  selectSelectedAdminCompanyLoading,
  selectSelectedAdminCompanyError,
} from '../../../store/admin-companies/admin-companies.selectors';
import {
  loadAdminCompany,
  clearAdminCompanyDetail,
  deleteAdminCompany,
  deleteAdminCompanySuccess,
  deleteAdminCompanyFailure,
} from '../../../store/admin-companies/admin-companies.actions';
import { AdminCompany } from '../../../store/admin-companies/admin-companies.models';
import { AdminEditCompanyDialogComponent, EditCompanyDialogData } from '../admin-edit-company-dialog/admin-edit-company-dialog.component';

@Component({
  selector: 'app-admin-company-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
    MatDividerModule,
    PageLayoutComponent,
  ],
  templateUrl: './admin-company-detail.component.html',
  styleUrls: ['./admin-company-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCompanyDetailComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly actions$ = inject(Actions);
  private readonly destroy$ = new Subject<void>();

  readonly company$ = this.store.select(selectSelectedAdminCompany);
  readonly loading$ = this.store.select(selectSelectedAdminCompanyLoading);
  readonly error$ = this.store.select(selectSelectedAdminCompanyError);

  private companyId: string | null = null;

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        this.companyId = params.get('companyId');
        if (this.companyId) {
          this.store.dispatch(loadAdminCompany({ companyId: this.companyId }));
        }
      });
  }

  ngOnDestroy(): void {
    this.store.dispatch(clearAdminCompanyDetail());
    this.destroy$.next();
    this.destroy$.complete();
  }

  goBack(): void {
    this.router.navigate(['/admin/companies']);
  }

  onEdit(company: AdminCompany): void {
    this.dialog.open(AdminEditCompanyDialogComponent, {
      width: '520px',
      maxWidth: '95vw',
      data: { company } satisfies EditCompanyDialogData,
      panelClass: 'sn-dialog',
    });
  }

  onDelete(company: AdminCompany): void {
    if (!confirm(`Are you sure you want to delete "${company.name}"? This action cannot be undone.`)) {
      return;
    }

    this.store.dispatch(deleteAdminCompany({ companyId: company.id }));

    this.actions$.pipe(ofType(deleteAdminCompanySuccess), take(1)).subscribe(() => {
      this.router.navigate(['/admin/companies']);
    });

    this.actions$.pipe(ofType(deleteAdminCompanyFailure), take(1)).subscribe(() => {
      // error already stored in state — could show snackbar here if desired
    });
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name
      .split(' ')
      .map((w) => w.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  formatDate(dateString: string): string {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  formatWebsite(url: string | null): string {
    if (!url) return '—';
    return url.replace(/^https?:\/\//, '');
  }
}

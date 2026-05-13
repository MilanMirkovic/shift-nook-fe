import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';

import { PageLayoutComponent } from '../../../layout/page-layout/page-layout.component';
import {
  selectAdminCompanies,
  selectAdminCompaniesTotal,
  selectAdminCompaniesLoading,
  selectAdminCompaniesPage,
  selectAdminCompaniesSize,
} from '../../../store/admin-companies/admin-companies.selectors';
import { loadAdminCompanies } from '../../../store/admin-companies/admin-companies.actions';
import { AdminCompany } from '../../../store/admin-companies/admin-companies.models';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-admin-companies',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatTableModule,
    PageLayoutComponent,
  ],
  templateUrl: './admin-companies.component.html',
  styleUrls: ['./admin-companies.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCompaniesComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly notificationService = inject(NotificationService);
  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject$ = new Subject<string>();

  readonly companies$ = this.store.select(selectAdminCompanies);
  readonly total$ = this.store.select(selectAdminCompaniesTotal);
  readonly loading$ = this.store.select(selectAdminCompaniesLoading);
  readonly page$ = this.store.select(selectAdminCompaniesPage);
  readonly size$ = this.store.select(selectAdminCompaniesSize);

  readonly displayedColumns = ['name', 'email', 'createdAt', 'actions'];

  searchQuery = '';
  currentPage = 0;
  currentSize = 50;

  ngOnInit(): void {
    this.loadCompanies();

    this.searchSubject$
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage = 0;
        this.loadCompanies();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchChange(query: string): void {
    this.searchQuery = query;
    this.searchSubject$.next(query);
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.currentSize = event.pageSize;
    this.loadCompanies();
  }

  onCompanyClick(company: AdminCompany): void {
    this.router.navigate(['/admin/companies', company.id]);
  }

  onCreateCompany(): void {
    import('../admin-create-company-dialog/admin-create-company-dialog.component').then((m) => {
      const dialogRef = this.dialog.open(m.AdminCreateCompanyDialogComponent, {
        width: '520px',
        maxWidth: '95vw',
        maxHeight: '90vh',
        disableClose: false,
        autoFocus: true,
        panelClass: 'admin-dialog-container'
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.notificationService.success('Company created successfully.');
          this.loadCompanies();
        }
      });
    });
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name
      .split(' ')
      .map((w) => w.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  private loadCompanies(): void {
    this.store.dispatch(
      loadAdminCompanies({
        page: this.currentPage,
        size: this.currentSize,
        q: this.searchQuery || undefined,
      })
    );
  }
}

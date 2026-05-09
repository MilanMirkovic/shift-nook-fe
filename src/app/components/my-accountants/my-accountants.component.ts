import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, filter, distinctUntilChanged } from 'rxjs';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { DataTableColumn, DataTableAction } from '../../layout/data-table/data-table.component';
import { ListPageComponent } from '../../layout/list-page/list-page.component';
import { AccountantTeamStatsCardComponent } from '../../shared/components/accountant-team-stats-card/accountant-team-stats-card.component';

import {
  selectAccountants,
  selectTotal,
  selectLoading,
  selectLoaded,
  selectStats,
  loadAccountants,
  loadStats,
  inviteAccountant,
  updateAccountant,
  updateFilters,
  updatePage,
  clearAccountants,
  AccountantTeamMember,
} from '../../store/accountant-team';
import { selectSelectedCompanyId, selectCurrentCompany } from '../../store/user/user.selectors';
import { CompanyRole } from '../../shared/models/company-role';
import { AssignCompaniesDialogComponent, AssignCompaniesDialogData } from './assign-companies-dialog/assign-companies-dialog.component';
import { AddEditAccountantDialogComponent, AddEditAccountantDialogData, AddEditAccountantDialogResult } from './add-edit-accountant-dialog/add-edit-accountant-dialog.component';

@Component({
  selector: 'app-my-accountants',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    ListPageComponent,
    AccountantTeamStatsCardComponent,
  ],
  templateUrl: './my-accountants.component.html',
  styleUrl: './my-accountants.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyAccountantsComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly destroy$ = new Subject<void>();

  readonly selectedCompanyId$ = this.store.select(selectSelectedCompanyId);
  readonly accountants$ = this.store.select(selectAccountants);
  readonly total$ = this.store.select(selectTotal);
  readonly loading$ = this.store.select(selectLoading);
  readonly loaded$ = this.store.select(selectLoaded);
  readonly stats$ = this.store.select(selectStats);
  readonly currentCompany$ = this.store.select(selectCurrentCompany);

  protected readonly CompanyRole = CompanyRole;

  private companyId: string | null = null;
  private currentQuery: string | null = null;
  private currentPage = 0;
  private pageSize = 20;

  protected readonly columns: DataTableColumn<AccountantTeamMember>[] = [
    {
      id: 'name',
      header: 'Name',
      searchable: true,
      value: (accountant) => `${accountant.firstName} ${accountant.lastName}`
    },
    { id: 'email', header: 'Email', field: 'email', searchable: true },
    {
      id: 'hoursWorked',
      header: 'Hours Worked',
      width: '140px',
      value: (accountant) => accountant.metrics.hoursWorked.toString()
    },
    {
      id: 'invoices',
      header: 'Invoices',
      width: '120px',
      value: (accountant) => accountant.metrics.invoicesCreated.toString()
    },
    {
      id: 'companies',
      header: 'Companies',
      width: '120px',
      value: (accountant) => accountant.metrics.companiesAssigned.toString()
    },
  ];

  protected readonly actions: DataTableAction<AccountantTeamMember>[] = [
    {
      icon: 'edit',
      label: 'Edit',
      color: 'primary',
      handler: (accountant) => this.onEditAccountant(accountant)
    },
    {
      icon: 'business',
      label: 'Assign Companies',
      color: 'primary',
      handler: (accountant) => this.onAssignCompanies(accountant)
    },
    {
      icon: 'visibility',
      label: 'View Details',
      color: 'primary',
      handler: (accountant) => this.onViewDetails(accountant)
    }
  ];

  /** Called by the table's built-in search input (server-side search). */
  onQueryChange = (q: string) => {
    const query = q?.trim() || '';
    this.currentQuery = query ? query : null;

    this.store.dispatch(updateFilters({ q: this.currentQuery }));

    if (this.companyId) {
      this.store.dispatch(
        loadAccountants({
          companyId: this.companyId,
          page: 0,
          size: this.pageSize,
          q: this.currentQuery
        })
      );
    }
  };

  onPageChange = (page: number) => {
    this.currentPage = page;
    this.store.dispatch(updatePage({ page, size: this.pageSize }));

    if (this.companyId) {
      this.store.dispatch(
        loadAccountants({
          companyId: this.companyId,
          page,
          size: this.pageSize,
          q: this.currentQuery
        })
      );
    }
  };

  onPageSizeChange = (size: number) => {
    this.pageSize = size;
    this.currentPage = 0;

    if (this.companyId) {
      this.store.dispatch(
        loadAccountants({
          companyId: this.companyId,
          page: 0,
          size,
          q: this.currentQuery
        })
      );
    }
  };

  ngOnInit(): void {
    this.selectedCompanyId$
      .pipe(
        filter((id): id is string => id !== null),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((companyId) => {
        this.companyId = companyId;

        // Clear stale data from previous company
        this.store.dispatch(clearAccountants());

        // Load accountants and stats for the new company
        this.store.dispatch(
          loadAccountants({
            companyId,
            page: this.currentPage,
            size: this.pageSize,
            q: this.currentQuery
          })
        );
        this.store.dispatch(loadStats({ companyId }));
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onViewDetails(accountant: AccountantTeamMember): void {
    this.router.navigate(['/my-accountants', accountant.userId]);
  }

  onRowClick(accountant: AccountantTeamMember): void {
    this.onViewDetails(accountant);
  }

  onAssignCompanies(accountant: AccountantTeamMember): void {
    if (!this.companyId) return;

    // Get all companies from user's company list
    this.currentCompany$.pipe(
      filter(c => c !== null),
      takeUntil(this.destroy$)
    ).subscribe(company => {
      // TODO: In a real implementation, we'd fetch all companies the user has access to
      // For now, we'll use a placeholder
      const availableCompanies = [
        { companyId: company!.companyId, companyName: company!.companyName }
      ];

      const dialogRef = this.dialog.open(AssignCompaniesDialogComponent, {
        width: '600px',
        data: {
          accountant,
          availableCompanies,
          currentCompanyId: this.companyId!
        } as AssignCompaniesDialogData
      });

      dialogRef.afterClosed().subscribe(success => {
        if (success && this.companyId) {
          // Reload accountants to get updated assignments
          this.store.dispatch(
            loadAccountants({
              companyId: this.companyId,
              page: this.currentPage,
              size: this.pageSize,
              q: this.currentQuery
            })
          );
        }
      });
    });
  }

  openInviteDialog(): void {
    const dialogRef = this.dialog.open(AddEditAccountantDialogComponent, {
      width: '600px',
      data: {
        mode: 'add'
      } as AddEditAccountantDialogData
    });

    dialogRef.afterClosed().subscribe((result: AddEditAccountantDialogResult | undefined) => {
      if (result && this.companyId) {
        this.store.dispatch(
          inviteAccountant({
            companyId: this.companyId,
            email: result.email,
            firstName: result.firstName,
            lastName: result.lastName,
            role: result.role
          })
        );
      }
    });
  }

  onEditAccountant(accountant: AccountantTeamMember): void {
    const dialogRef = this.dialog.open(AddEditAccountantDialogComponent, {
      width: '600px',
      data: {
        mode: 'edit',
        accountant
      } as AddEditAccountantDialogData
    });

    dialogRef.afterClosed().subscribe((result: AddEditAccountantDialogResult | undefined) => {
      if (result && this.companyId) {
        this.store.dispatch(
          updateAccountant({
            companyId: this.companyId,
            userId: accountant.userId,
            updates: {
              firstName: result.firstName,
              lastName: result.lastName,
              role: result.role
            }
          })
        );
      }
    });
  }
}

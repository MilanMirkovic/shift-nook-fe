import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, filter } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { DataTableColumn, DataTableAction } from '../../layout/data-table/data-table.component';

import {
  selectMembers,
  selectTotal,
  selectLoading
} from '../../store/company-members/company-members.selectors';
import {
  loadMembers,
  updateFilters,
  updatePage
} from '../../store/company-members/company-members.actions';
import { CompanyMember } from '../../store/company-members/company-members.models';
import { selectSelectedCompanyId, selectCurrentUserRole } from '../../store/user/user.selectors';
import { InviteWorkerDialogComponent } from '../../shared/components/invite-worker-dialog/invite-worker-dialog.component';
import { CompanyRole } from '../../shared/models/company-role';

@Component({
  selector: 'app-team-members',
  standalone: false,
  templateUrl: './team-members.component.html',
  styleUrl: './team-members.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeamMembersComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly route = inject(ActivatedRoute);
  private readonly destroy$ = new Subject<void>();

  readonly selectedCompanyId$ = this.store.select(selectSelectedCompanyId);
  readonly members$ = this.store.select(selectMembers);
  readonly total$ = this.store.select(selectTotal);
  readonly loading$ = this.store.select(selectLoading);
  readonly currentUserRole$ = this.store.select(selectCurrentUserRole);

  protected readonly CompanyRole = CompanyRole;

  private companyId: string | null = null;
  private currentQuery: string | null = null;
  private currentPage = 0;
  private pageSize = 20;

  isOnboarding = false;

  protected readonly columns: DataTableColumn<CompanyMember>[] = [
    { id: 'firstName', header: 'First name', field: 'firstName', searchable: true },
    { id: 'lastName', header: 'Last name', field: 'lastName', searchable: true },
    { id: 'email', header: 'Email', field: 'email', searchable: true },
    { id: 'role', header: 'Role', field: 'role', searchable: true, width: '140px' }
  ];

  protected readonly actions: DataTableAction<CompanyMember>[] = [
    {
      icon: 'visibility',
      label: 'View Details',
      color: 'primary',
      handler: (member) => this.onViewDetails(member)
    }
  ];

  /** Called by the table's built-in search input (server-side search). */
  onQueryChange = (q: string) => {
    const query = q?.trim() || '';
    this.currentQuery = query ? query : null;

    this.store.dispatch(updateFilters({ role: null, q: this.currentQuery }));

    if (this.companyId) {
      this.store.dispatch(
        loadMembers({
          companyId: this.companyId,
          page: 0,
          size: this.pageSize,
          role: null,
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
        loadMembers({
          companyId: this.companyId,
          page,
          size: this.pageSize,
          role: null,
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
        loadMembers({
          companyId: this.companyId,
          page: 0,
          size,
          role: null,
          q: this.currentQuery
        })
      );
    }
  };

  ngOnInit(): void {
    this.isOnboarding = this.route.snapshot.queryParamMap.get('onboarding') === 'true';

    this.selectedCompanyId$
      .pipe(
        takeUntil(this.destroy$),
        filter((id): id is string => id !== null)
      )
      .subscribe((companyId) => {
        this.companyId = companyId;
        this.store.dispatch(
          loadMembers({
            companyId,
            page: this.currentPage,
            size: this.pageSize,
            role: null,
            q: this.currentQuery
          })
        );
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onViewDetails(member: CompanyMember): void {
    this.router.navigate(['/team', member.userId]);
  }

  onRowClick(member: CompanyMember): void {
    this.onViewDetails(member);
  }

  openInviteDialog(): void {
    this.dialog.open(InviteWorkerDialogComponent, {
      width: '480px',
      disableClose: false,
      position: undefined,
      panelClass: 'centered-dialog',
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}

import {
  ChangeDetectionStrategy, Component, OnInit, OnDestroy, inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, filter, take } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { selectSelectedCompanyId } from '../../../store/user/user.selectors';
import { loadPrincipalCompanies } from '../../../store/subcontractors/subcontractors.actions';
import {
  selectPrincipalLinks,
  selectPrincipalLinksLoading,
} from '../../../store/subcontractors/subcontractors.selectors';
import { SubcontractorLinkResponse } from '../../../store/subcontractors/subcontractors.models';
import { ListPageComponent } from '../../../layout/list-page/list-page.component';
import { DataTableColumn, DataTableAction } from '../../../layout/data-table/data-table.component';

@Component({
  selector: 'app-principal-companies',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, ListPageComponent],
  templateUrl: './principal-companies.component.html',
  styleUrls: ['./principal-companies.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrincipalCompaniesComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  private companyId: string | null = null;

  readonly links$ = this.store.select(selectPrincipalLinks);
  readonly loading$ = this.store.select(selectPrincipalLinksLoading);

  readonly columns: DataTableColumn<SubcontractorLinkResponse>[] = [
    {
      id: 'ownerName',
      header: 'Principal Company',
      field: 'subcontractorCompanyName',
      format: (v) => (v as string) ?? '—',
    },
    { id: 'status', header: 'Status', field: 'status' },
    {
      id: 'acceptedAt',
      header: 'Accepted',
      field: 'acceptedAt',
      format: v => v ? this.fmtDate(v as string) : '—',
    },
    {
      id: 'createdAt',
      header: 'Invited',
      field: 'createdAt',
      format: v => this.fmtDate(v as string),
    },
  ];

  readonly actions: DataTableAction<SubcontractorLinkResponse>[] = [
    {
      icon: 'group',
      label: 'Manage Workers',
      color: 'primary',
      handler: (row) => this.onManageWorkers(row),
      visible: (row) => (row as SubcontractorLinkResponse).status === 'ACTIVE',
    },
  ];

  ngOnInit(): void {
    this.store.select(selectSelectedCompanyId)
      .pipe(filter((id): id is string => !!id), take(1), takeUntil(this.destroy$))
      .subscribe(id => {
        this.companyId = id;
        this.store.dispatch(loadPrincipalCompanies({ companyId: id }));
      });
  }

  onManageWorkers(row: SubcontractorLinkResponse): void {
    if (!this.companyId) return;
    this.router.navigate(['/principal-companies', row.id, 'workers']);
  }

  fmtDate(iso: string): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}


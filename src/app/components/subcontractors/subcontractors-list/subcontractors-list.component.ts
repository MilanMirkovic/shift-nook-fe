import {
  ChangeDetectionStrategy, Component, OnInit, OnDestroy, inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, filter, take } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';

import { selectCurrentCompany } from '../../../store/user/user.selectors';
import {
  loadSubcontractors,
  revokeSubcontractor,
} from '../../../store/subcontractors/subcontractors.actions';
import {
  selectSubcontractorLinks,
  selectSubcontractorLinksLoading,
} from '../../../store/subcontractors/subcontractors.selectors';
import { SubcontractorLinkResponse } from '../../../store/subcontractors/subcontractors.models';
import { InviteSubcontractorDialogComponent } from '../invite-subcontractor-dialog/invite-subcontractor-dialog.component';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { PageLayoutComponent } from '../../../layout/page-layout/page-layout.component';
import { DataTableComponent, DataTableColumn, DataTableAction } from '../../../layout/data-table/data-table.component';

@Component({
  selector: 'app-subcontractors-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    PageLayoutComponent,
    DataTableComponent,
  ],
  templateUrl: './subcontractors-list.component.html',
  styleUrls: ['./subcontractors-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubcontractorsListComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  private companyId: string | null = null;

  readonly links$ = this.store.select(selectSubcontractorLinks);
  readonly loading$ = this.store.select(selectSubcontractorLinksLoading);

  readonly columns: DataTableColumn<SubcontractorLinkResponse>[] = [
    {
      id: 'name',
      header: 'Subcontractor',
      field: 'subcontractorCompanyName',
      format: (v, row) => (row as SubcontractorLinkResponse).subcontractorCompanyName ?? 'Awaiting acceptance',
    },
    { id: 'email', header: 'Invited Email', field: 'invitedEmail' },
    { id: 'status', header: 'Status', field: 'status' },
    {
      id: 'createdAt',
      header: 'Invited',
      field: 'createdAt',
      format: v => this.fmtDate(v as string),
    },
    {
      id: 'acceptedAt',
      header: 'Accepted',
      field: 'acceptedAt',
      format: v => v ? this.fmtDate(v as string) : '—',
    },
  ];

  readonly actions: DataTableAction<SubcontractorLinkResponse>[] = [
    {
      icon: 'visibility',
      label: 'View Details',
      color: 'primary',
      handler: (row) => this.onViewDetails(row),
    },
    {
      icon: 'block',
      label: 'Revoke',
      color: 'warn',
      handler: (row) => this.onRevoke(row),
      visible: (row) => (row as SubcontractorLinkResponse).status !== 'REVOKED',
    },
  ];

  ngOnInit(): void {
    this.store.select(selectCurrentCompany)
      .pipe(
        filter((c) => !!c),
        take(1),
        takeUntil(this.destroy$)
      )
      .subscribe(company => {
        this.companyId = company!.companyId;
        this.store.dispatch(loadSubcontractors({ companyId: this.companyId }));
      });
  }

  onInvite(): void {
    this.store.select(selectCurrentCompany).pipe(
      filter((c) => !!c),
      take(1),
    ).subscribe(company => {
      const companyId = company!.companyId;
      this.companyId = companyId;
      const ref = this.dialog.open(InviteSubcontractorDialogComponent, {
        data: { companyId },
        width: '480px',
        disableClose: true,
      });
      ref.afterClosed().pipe(take(1)).subscribe(sent => {
        if (sent) {
          this.store.dispatch(loadSubcontractors({ companyId }));
        }
      });
    });
  }

  onViewDetails(row: SubcontractorLinkResponse): void {
    if (!this.companyId) return;
    this.router.navigate(['/subcontractors', row.id]);
  }

  onRevoke(row: SubcontractorLinkResponse): void {
    if (!this.companyId) return;
    const ref = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Revoke Subcontractor',
        message: `Remove <strong>${row.subcontractorCompanyName ?? row.invitedEmail}</strong> as a subcontractor? All enrolled workers will immediately lose access to your jobsites.`,
        confirmText: 'Revoke',
        cancelText: 'Cancel',
        type: 'danger',
      },
      width: '420px',
    });
    ref.afterClosed().pipe(take(1)).subscribe(confirmed => {
      if (confirmed) {
        this.store.dispatch(revokeSubcontractor({ companyId: this.companyId!, linkId: row.id }));
      }
    });
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

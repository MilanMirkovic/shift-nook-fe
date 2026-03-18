import {
  ChangeDetectionStrategy, Component, OnInit, OnDestroy, inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, filter, take } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';

import { selectSelectedCompanyId } from '../../../store/user/user.selectors';
import {
  loadSubcontractorDetail,
  revokeSubcontractor,
  removeWorkerFromLink,
} from '../../../store/subcontractors/subcontractors.actions';
import {
  selectSubcontractorDetail,
  selectSubcontractorDetailLoading,
  selectSubcontractorDetailError,
  selectSubcontractorRevoking,
} from '../../../store/subcontractors/subcontractors.selectors';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { PageLayoutComponent } from '../../../layout/page-layout/page-layout.component';
import { SubcontractorWorker } from '../../../store/subcontractors/subcontractors.models';

@Component({
  selector: 'app-subcontractor-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule,
    PageLayoutComponent,
  ],
  templateUrl: './subcontractor-detail.component.html',
  styleUrls: ['./subcontractor-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubcontractorDetailComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly destroy$ = new Subject<void>();

  private companyId: string | null = null;
  private linkId: string | null = null;

  readonly detail$ = this.store.select(selectSubcontractorDetail);
  readonly loading$ = this.store.select(selectSubcontractorDetailLoading);
  readonly error$ = this.store.select(selectSubcontractorDetailError);
  readonly revoking$ = this.store.select(selectSubcontractorRevoking);

  ngOnInit(): void {
    this.linkId = this.route.snapshot.paramMap.get('linkId');

    this.store.select(selectSelectedCompanyId)
      .pipe(filter((id): id is string => !!id), take(1), takeUntil(this.destroy$))
      .subscribe(id => {
        this.companyId = id;
        this.load();
      });
  }

  private load(): void {
    if (this.companyId && this.linkId) {
      this.store.dispatch(loadSubcontractorDetail({ companyId: this.companyId, linkId: this.linkId }));
    }
  }

  onRevoke(): void {
    this.detail$.pipe(take(1)).subscribe(detail => {
      if (!detail || !this.companyId || !this.linkId) return;
      const ref = this.dialog.open(ConfirmationDialogComponent, {
        data: {
          title: 'Revoke Subcontractor',
          message: `Remove <strong>${detail.subcontractorCompanyName ?? detail.invitedEmail}</strong> as a subcontractor? All enrolled workers will immediately lose access.`,
          confirmText: 'Revoke',
          cancelText: 'Cancel',
          type: 'danger',
        },
        width: '420px',
      });
      ref.afterClosed().pipe(take(1)).subscribe(confirmed => {
        if (confirmed) {
          this.store.dispatch(revokeSubcontractor({ companyId: this.companyId!, linkId: this.linkId! }));
          this.router.navigate(['/subcontractors']);
        }
      });
    });
  }

  onRemoveWorker(worker: SubcontractorWorker): void {
    if (!this.companyId || !this.linkId) return;
    const ref = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Remove Worker',
        message: `Remove <strong>${worker.firstName} ${worker.lastName}</strong> from this subcontractor link?`,
        confirmText: 'Remove',
        cancelText: 'Cancel',
        type: 'warning',
      },
      width: '400px',
    });
    ref.afterClosed().pipe(take(1)).subscribe(confirmed => {
      if (confirmed) {
        this.store.dispatch(removeWorkerFromLink({
          ownerCompanyId: this.companyId!,
          linkId: this.linkId!,
          workerUserId: worker.userId,
        }));
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/subcontractors']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}


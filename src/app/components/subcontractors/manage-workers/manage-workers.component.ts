import {
  ChangeDetectionStrategy, Component, OnInit, OnDestroy, inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, filter, take, combineLatest } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

import { selectSelectedCompanyId } from '../../../store/user/user.selectors';
import {
  loadSubcontractorDetail,
  addWorkerToLink,
  removeWorkerFromLink,
} from '../../../store/subcontractors/subcontractors.actions';
import {
  selectSubcontractorDetail,
  selectSubcontractorDetailLoading,
  selectSubcontractorDetailError,
  selectAddingWorker,
  selectRemovingWorker,
} from '../../../store/subcontractors/subcontractors.selectors';
import {
  loadMembers,
} from '../../../store/company-members/company-members.actions';
import {
  selectMembers,
  selectLoading as selectMembersLoading,
} from '../../../store/company-members/company-members.selectors';
import { CompanyRole } from '../../../shared/models/company-role';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { PageLayoutComponent } from '../../../layout/page-layout/page-layout.component';
import { SubcontractorWorker } from '../../../store/subcontractors/subcontractors.models';
import { CompanyMember } from '../../../store/company-members/company-members.models';

@Component({
  selector: 'app-manage-workers',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatSelectModule,
    MatFormFieldModule,
    PageLayoutComponent,
  ],
  templateUrl: './manage-workers.component.html',
  styleUrls: ['./manage-workers.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManageWorkersComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly destroy$ = new Subject<void>();

  /** The subcontractor's own companyId (selected in store) */
  private subCompanyId: string | null = null;
  /** The ownerCompanyId comes from the detail response (ownerCompanyId) */
  private ownerCompanyId: string | null = null;
  private linkId: string | null = null;

  readonly detail$ = this.store.select(selectSubcontractorDetail);
  readonly detailLoading$ = this.store.select(selectSubcontractorDetailLoading);
  readonly detailError$ = this.store.select(selectSubcontractorDetailError);
  readonly addingWorker$ = this.store.select(selectAddingWorker);
  readonly removingWorker$ = this.store.select(selectRemovingWorker);
  readonly ownWorkers$ = this.store.select(selectMembers);
  readonly ownWorkersLoading$ = this.store.select(selectMembersLoading);

  /** Workers from own company not yet enrolled */
  availableWorkers: CompanyMember[] = [];
  addWorkerCtrl = new FormControl<string | null>(null);

  ngOnInit(): void {
    this.linkId = this.route.snapshot.paramMap.get('linkId');
    this.ownerCompanyId = this.route.snapshot.paramMap.get('ownerCompanyId');

    this.store.select(selectSelectedCompanyId)
      .pipe(filter((id): id is string => !!id), take(1), takeUntil(this.destroy$))
      .subscribe(id => {
        this.subCompanyId = id;
        this.loadDetail();
        this.loadOwnWorkers();
      });

    // Compute available (not yet enrolled) workers
    combineLatest([this.ownWorkers$, this.detail$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([ownWorkers, detail]) => {
        const enrolledIds = new Set((detail?.workers ?? []).map(w => w.userId));
        this.availableWorkers = ownWorkers.filter(w => !enrolledIds.has(w.userId));
      });
  }

  private loadDetail(): void {
    if (this.ownerCompanyId && this.linkId) {
      this.store.dispatch(loadSubcontractorDetail({
        companyId: this.ownerCompanyId,
        linkId: this.linkId,
      }));
    }
  }

  private loadOwnWorkers(): void {
    if (!this.subCompanyId) return;
    this.store.dispatch(loadMembers({
      companyId: this.subCompanyId,
      page: 0,
      size: 200,
      role: CompanyRole.WORKER,
      q: null,
    }));
  }

  onAddWorker(): void {
    const workerUserId = this.addWorkerCtrl.value;
    if (!workerUserId || !this.ownerCompanyId || !this.linkId) return;
    this.store.dispatch(addWorkerToLink({
      ownerCompanyId: this.ownerCompanyId,
      linkId: this.linkId,
      workerUserId,
    }));
    this.addWorkerCtrl.reset();
  }

  onRemoveWorker(worker: SubcontractorWorker): void {
    if (!this.ownerCompanyId || !this.linkId) return;
    const ref = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Remove Worker',
        message: `Remove <strong>${worker.firstName} ${worker.lastName}</strong> from this principal company?`,
        confirmText: 'Remove',
        cancelText: 'Cancel',
        type: 'warning',
      },
      width: '400px',
    });
    ref.afterClosed().pipe(take(1)).subscribe(confirmed => {
      if (confirmed) {
        this.store.dispatch(removeWorkerFromLink({
          ownerCompanyId: this.ownerCompanyId!,
          linkId: this.linkId!,
          workerUserId: worker.userId,
        }));
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/principal-companies']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}


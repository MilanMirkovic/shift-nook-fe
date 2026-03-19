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
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

import { AssignmentTooltipPipe } from '../../../shared/pipes/assignment-tooltip.pipe';
import { selectSelectedCompanyId } from '../../../store/user/user.selectors';
import {
  addWorkerToLink,
  removeWorkerFromLink,
  loadWorkerStatuses,
  loadPrincipalCompanies,
} from '../../../store/subcontractors/subcontractors.actions';
import {
  selectAddingWorker,
  selectRemovingWorker,
  selectWorkerStatuses,
  selectWorkerStatusesLoading,
  selectPrincipalLinks,
} from '../../../store/subcontractors/subcontractors.selectors';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { PageLayoutComponent } from '../../../layout/page-layout/page-layout.component';
import {
  SubcontractorWorkerStatus,
  WorkerAssignment,
} from '../../../store/subcontractors/subcontractors.models';

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
    MatChipsModule,
    MatTooltipModule,
    PageLayoutComponent,
    AssignmentTooltipPipe,
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

  private subCompanyId: string | null = null;
  ownerCompanyId: string | null = null;
  linkId: string | null = null;

  /** Display name of the principal (owner) company, resolved from principalLinks */
  principalCompanyName = 'Principal Company';

  readonly addingWorker$ = this.store.select(selectAddingWorker);
  readonly removingWorker$ = this.store.select(selectRemovingWorker);
  readonly workerStatuses$ = this.store.select(selectWorkerStatuses);
  readonly workerStatusesLoading$ = this.store.select(selectWorkerStatusesLoading);

  /** Workers already enrolled in this specific link */
  enrolledWorkers: SubcontractorWorkerStatus[] = [];
  /** Workers not yet enrolled in this link */
  availableWorkers: SubcontractorWorkerStatus[] = [];
  /** O(1) lookup: userId → status */
  workerStatusesMap = new Map<string, SubcontractorWorkerStatus>();

  addWorkerCtrl = new FormControl<string | null>(null);

  ngOnInit(): void {
    this.linkId = this.route.snapshot.paramMap.get('linkId');
    this.ownerCompanyId = this.route.snapshot.paramMap.get('ownerCompanyId');

    this.store.select(selectSelectedCompanyId)
      .pipe(filter((id): id is string => !!id), take(1), takeUntil(this.destroy$))
      .subscribe(id => {
        this.subCompanyId = id;
        this.store.dispatch(loadWorkerStatuses({ subcontractorCompanyId: id }));
        this.store.dispatch(loadPrincipalCompanies({ companyId: id }));
      });

    // Resolve principal company display name from the principalLinks list
    this.store.select(selectPrincipalLinks)
      .pipe(takeUntil(this.destroy$))
      .subscribe(links => {
        const match = links.find(l => l.id === this.linkId);
        if (match) {
          this.principalCompanyName = match.ownerCompanyName;
        }
      });

    // Split all workers into enrolled / available for this link
    this.workerStatuses$
      .pipe(takeUntil(this.destroy$))
      .subscribe(allWorkers => {
        this.workerStatusesMap = new Map(allWorkers.map(w => [w.userId, w]));
        this.enrolledWorkers = allWorkers.filter(w =>
          w.assignments.some(a => a.linkId === this.linkId)
        );
        this.availableWorkers = allWorkers.filter(w =>
          !w.assignments.some(a => a.linkId === this.linkId)
        );
      });
  }

  /**
   * Returns all assignments for an available worker —
   * shown as a badge in the dropdown hinting it's already active elsewhere.
   */
  getAssignmentsForAvailable(userId: string): WorkerAssignment[] {
    return this.workerStatusesMap.get(userId)?.assignments ?? [];
  }

  /**
   * Returns assignments for an enrolled worker, excluding the current link —
   * shown as chips in the "Also assigned to" column.
   */
  getOtherAssignments(userId: string): WorkerAssignment[] {
    return (this.workerStatusesMap.get(userId)?.assignments ?? [])
      .filter(a => a.linkId !== this.linkId);
  }

  getSelectedWorker(): SubcontractorWorkerStatus | undefined {
    const id = this.addWorkerCtrl.value;
    if (!id) return undefined;
    return this.workerStatusesMap.get(id)
      ?? this.availableWorkers.find(w => w.userId === id);
  }

  onAddWorker(): void {
    const workerUserId = this.addWorkerCtrl.value;
    if (!workerUserId || !this.ownerCompanyId || !this.linkId || !this.subCompanyId) return;
    this.store.dispatch(addWorkerToLink({
      ownerCompanyId: this.ownerCompanyId,
      subcontractorCompanyId: this.subCompanyId,
      workerUserId,
      linkId: this.linkId,
    }));
    this.addWorkerCtrl.reset();
  }

  onRemoveWorker(worker: SubcontractorWorkerStatus): void {
    if (!this.ownerCompanyId || !this.subCompanyId) return;
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
          subcontractorCompanyId: this.subCompanyId!,
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

import { Component, inject, Input, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, combineLatest, BehaviorSubject } from 'rxjs';
import { filter, map, take, takeUntil } from 'rxjs/operators';
import { Actions, ofType } from '@ngrx/effects';

import { AsyncPipe, CurrencyPipe, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';

import { Estimate, EstimateStatus } from '../../../../store/estimates/estimates.models';
import {
  loadEstimates,
  createEstimate, createEstimateSuccess, createEstimateFailure,
  updateEstimate, updateEstimateSuccess, updateEstimateFailure,
  updateEstimateStatus, updateEstimateStatusSuccess, updateEstimateStatusFailure,
  deleteEstimate, deleteEstimateSuccess, deleteEstimateFailure,
} from '../../../../store/estimates/estimates.actions';
import {
  selectEstimatesByClientId,
  selectEstimatesLoading,
  selectEstimatesError,
} from '../../../../store/estimates/estimates.selectors';
import {
  promoteEstimateToInvoice,
  promoteEstimateToInvoiceSuccess,
  promoteEstimateToInvoiceFailure,
} from '../../../../store/invoices/invoices.actions';
import { EstimateDialogComponent, EstimateDialogResult } from '../../../../shared/components/estimate-dialog/estimate-dialog.component';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { NotificationService } from '../../../../shared/services/notification.service';
import { EstimatesApiService } from '../../../../store/estimates/estimates.api';
import { EstimateStatusDialogComponent } from '../../../../shared/components/estimate-status-dialog/estimate-status-dialog.component';
import { DocumentUploadDialogComponent, DocumentUploadDialogResult } from '../../../../shared/components/document-upload-dialog/document-upload-dialog.component';

@Component({
  selector: 'app-client-estimates',
  standalone: true,
  templateUrl: './client-estimates.component.html',
  styleUrls: ['./client-estimates.component.scss'],
  imports: [
    AsyncPipe,
    CurrencyPipe,
    DatePipe,
    NgIf,
    NgFor,
    NgClass,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
})
export class ClientEstimatesComponent implements OnInit, OnDestroy {
  @Input({ required: true }) clientId!: string;
  @Input({ required: true }) clientName!: string;
  @Input({ required: true }) companyId!: string;

  private readonly store = inject(Store);
  private readonly dialog = inject(MatDialog);
  private readonly notificationService = inject(NotificationService);
  private readonly estimatesApi = inject(EstimatesApiService);
  private readonly actions$ = inject(Actions);
  private readonly destroy$ = new Subject<void>();

  protected estimates$!: Observable<Estimate[]>;
  protected filteredEstimates$!: Observable<Estimate[]>;
  protected estimatesLoading$!: Observable<boolean>;
  protected estimatesError$!: Observable<string | null>;

  protected searchQuery = '';
  private readonly searchQuery$ = new BehaviorSubject<string>('');

  ngOnInit(): void {
    this.estimates$ = this.store.select(selectEstimatesByClientId(this.clientId));
    this.estimatesLoading$ = this.store.select(selectEstimatesLoading);
    this.estimatesError$ = this.store.select(selectEstimatesError);

    this.filteredEstimates$ = combineLatest([
      this.estimates$,
      this.searchQuery$,
    ]).pipe(
      map(([estimates, query]) => {
        if (!query.trim()) return estimates;
        const q = query.toLowerCase().trim();
        return estimates.filter(e =>
          e.title.toLowerCase().includes(q) ||
          (e.notes && e.notes.toLowerCase().includes(q)) ||
          String(e.estimateNumber).includes(q) ||
          e.status.toLowerCase().includes(q) ||
          String(e.total).includes(q)
        );
      }),
    );

    this.store.dispatch(loadEstimates({
      companyId: this.companyId,
      clientId: this.clientId,
      page: 0,
      size: 100,
    }));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected onSearchChange(query: string): void {
    this.searchQuery = query;
    this.searchQuery$.next(query);
  }

  protected clearSearch(): void {
    this.searchQuery = '';
    this.searchQuery$.next('');
  }

  protected onAddEstimate(): void {
    const dialogRef = this.dialog.open(EstimateDialogComponent, {
      width: '700px',
      maxWidth: '95vw',
      maxHeight: '92vh',
      disableClose: false,
      autoFocus: true,
      panelClass: 'estimate-dialog-container',
      data: { clientId: this.clientId, clientName: this.clientName },
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result: EstimateDialogResult | undefined) => {
      if (!result || result.mode !== 'create') return;

      this.store.dispatch(createEstimate({ companyId: this.companyId, estimate: result.payload }));

      this.actions$.pipe(
        ofType(createEstimateSuccess, createEstimateFailure),
        take(1),
        takeUntil(this.destroy$),
      ).subscribe(action => {
        if (action.type === createEstimateSuccess.type) {
          this.notificationService.success('Estimate created successfully!');
          this.reloadEstimates();
        } else {
          this.notificationService.error('Failed to create estimate. Please try again.');
        }
      });
    });
  }

  protected onEditEstimate(estimate: Estimate): void {
    const dialogRef = this.dialog.open(EstimateDialogComponent, {
      width: '700px',
      maxWidth: '95vw',
      maxHeight: '92vh',
      disableClose: false,
      autoFocus: true,
      panelClass: 'estimate-dialog-container',
      data: {
        clientId: this.clientId,
        clientName: this.clientName,
        estimate,
      },
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result: EstimateDialogResult | undefined) => {
      if (!result || result.mode !== 'edit') return;

      this.store.dispatch(updateEstimate({
        companyId: this.companyId,
        estimateId: estimate.id,
        estimate: result.payload,
      }));

      this.actions$.pipe(
        ofType(updateEstimateSuccess, updateEstimateFailure),
        take(1),
        takeUntil(this.destroy$),
      ).subscribe(action => {
        if (action.type === updateEstimateSuccess.type) {
          this.notificationService.success('Estimate updated successfully!');
          this.reloadEstimates();
        } else {
          this.notificationService.error('Failed to update estimate. Please try again.');
        }
      });
    });
  }

  protected onChangeEstimateStatus(estimate: Estimate): void {
    const dialogRef = this.dialog.open(EstimateStatusDialogComponent, {
      width: '480px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: false,
      autoFocus: false,
      panelClass: 'centered-dialog',
      data: {
        estimateTitle: estimate.title,
        estimateNumber: estimate.estimateNumber,
        currentStatus: estimate.status,
        revisionNumber: +estimate.revisionNumber || 0,
      },
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((newStatus: EstimateStatus | null) => {
      if (!newStatus) return;

      this.store.dispatch(updateEstimateStatus({
        companyId: this.companyId,
        estimateId: estimate.id,
        statusUpdate: { status: newStatus },
      }));

      this.actions$.pipe(
        ofType(updateEstimateStatusSuccess, updateEstimateStatusFailure),
        take(1),
        takeUntil(this.destroy$),
      ).subscribe(action => {
        if (action.type === updateEstimateStatusSuccess.type) {
          this.notificationService.success(`Estimate marked as ${newStatus.toLowerCase()}.`);
          this.reloadEstimates();
        } else {
          this.notificationService.error('Failed to update estimate status. Please try again.');
        }
      });
    });
  }

  protected onDeleteEstimate(estimate: Estimate): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Estimate',
        message: `Are you sure you want to delete estimate "${estimate.title}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger',
      },
      position: { top: '80px' },
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(confirmed => {
      if (!confirmed) return;

      this.store.dispatch(deleteEstimate({ companyId: this.companyId, estimateId: estimate.id }));

      this.actions$.pipe(
        ofType(deleteEstimateSuccess, deleteEstimateFailure),
        take(1),
        takeUntil(this.destroy$),
      ).subscribe(action => {
        if (action.type === deleteEstimateSuccess.type) {
          this.notificationService.success('Estimate deleted successfully!');
        } else {
          this.notificationService.error('Failed to delete estimate. Please try again.');
        }
      });
    });
  }

  protected onUpdateEstimateStatus(estimate: Estimate, status: EstimateStatus): void {
    this.store.dispatch(updateEstimateStatus({
      companyId: this.companyId,
      estimateId: estimate.id,
      statusUpdate: { status },
    }));

    this.actions$.pipe(
      ofType(updateEstimateStatusSuccess, updateEstimateStatusFailure),
      take(1),
      takeUntil(this.destroy$),
    ).subscribe(result => {
      if (result.type === updateEstimateStatusSuccess.type) {
        this.notificationService.success(`Estimate marked as ${status.toLowerCase()}.`);
      } else {
        this.notificationService.error('Failed to update estimate status.');
      }
    });
  }

  protected async onDownloadEstimatePdf(estimate: Estimate): Promise<void> {
    try {
      await this.estimatesApi.openPdf(this.companyId, estimate.id);
    } catch {
      this.notificationService.error('Failed to open PDF. Please try again.');
    }
  }

  protected onPromoteToInvoice(estimate: Estimate): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Convert to Invoice',
        message: `Are you sure you want to Convert estimate "${estimate.title}" to an invoice? The estimate will be marked as invoiced.`,
        confirmText: 'Convert',
        cancelText: 'Cancel',
        type: 'primary',
      },
      position: { top: '80px' },
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(confirmed => {
      if (!confirmed) return;

      this.store.dispatch(promoteEstimateToInvoice({ companyId: this.companyId, estimateId: estimate.id }));

      this.actions$.pipe(
        ofType(promoteEstimateToInvoiceSuccess, promoteEstimateToInvoiceFailure),
        take(1),
        takeUntil(this.destroy$),
      ).subscribe(action => {
        if (action.type === promoteEstimateToInvoiceSuccess.type) {
          this.notificationService.success('Estimate promoted to invoice successfully!');
          this.reloadEstimates();
        } else {
          this.notificationService.error('Failed to promote estimate to invoice. Please try again.');
        }
      });
    });
  }

  protected onUploadDocument(): void {
    const dialogRef = this.dialog.open(DocumentUploadDialogComponent, {
      width: '720px',
      maxWidth: '96vw',
      maxHeight: '94vh',
      disableClose: false,
      autoFocus: false,
      panelClass: 'document-upload-dialog-container',
      backdropClass: 'document-upload-dialog-backdrop',
      data: {
        companyId: this.companyId,
        clientId: this.clientId,
        clientName: this.clientName,
        documentType: 'ESTIMATE' as const,
      },
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result: DocumentUploadDialogResult | undefined) => {
      if (!result) return;

      if (result.mode === 'estimate') {
        this.store.dispatch(createEstimate({ companyId: this.companyId, estimate: result.payload }));

        this.actions$.pipe(
          ofType(createEstimateSuccess, createEstimateFailure),
          take(1),
          takeUntil(this.destroy$),
        ).subscribe(action => {
          if (action.type === createEstimateSuccess.type) {
            this.notificationService.success('Estimate created from uploaded document!');
            this.reloadEstimates();
          } else {
            this.notificationService.error('Failed to create estimate. Please try again.');
          }
        });
      }
    });
  }

  protected getEstimateStatusClass(status: EstimateStatus): string {
    switch (status) {
      case 'ACCEPTED': return 'estimate-status--accepted';
      case 'SENT':     return 'estimate-status--sent';
      case 'DRAFT':    return 'estimate-status--draft';
      case 'DECLINED': return 'estimate-status--rejected';
      case 'VOID':     return 'estimate-status--expired';
      case 'INVOICED': return 'estimate-status--invoiced';
      default:         return 'estimate-status--draft';
    }
  }

  private reloadEstimates(): void {
    this.store.dispatch(loadEstimates({
      companyId: this.companyId,
      clientId: this.clientId,
      page: 0,
      size: 100,
    }));
  }
}

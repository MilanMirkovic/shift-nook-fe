import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject, Observable, combineLatest } from 'rxjs';
import { takeUntil, map, take } from 'rxjs/operators';
import { Actions, ofType } from '@ngrx/effects';

import { CompanyRole } from '../../models/company-role';
import { Timesheet } from '../../../store/timesheets/timesheets.models';
import { CompanyMember } from '../../../store/company-members/company-members.models';
import {
  TimesheetLineItemPreview,
  GroupByStrategy,
  CreateInvoiceFromTimesheetsInput
} from '../../models/invoice-from-timesheets.model';
import { InvoiceItemInput } from '../../../store/invoices/invoices.models';
import {
  createInvoiceFromTimesheets,
  createInvoiceFromTimesheetsSuccess,
  createInvoiceFromTimesheetsFailure
} from '../../../store/invoices/invoices.actions';

export interface CreateInvoiceFromTimesheetsDialogData {
  companyId: string;
  jobsiteId: string;
  jobsiteName: string;
  clientId: string;
  currentUserRole: CompanyRole;
  timesheets: Timesheet[];
  companyMembers: CompanyMember[];
}

interface DateRangePreset {
  label: string;
  dateFrom: Date;
  dateTo: Date;
}

@Component({
  selector: 'app-create-invoice-from-timesheets-dialog',
  standalone: false,
  templateUrl: './create-invoice-from-timesheets-dialog.component.html',
  styleUrls: ['./create-invoice-from-timesheets-dialog.component.scss']
})
export class CreateInvoiceFromTimesheetsDialogComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  invoiceForm: FormGroup;
  lineItemPreviews: TimesheetLineItemPreview[] = [];
  filteredTimesheets: Timesheet[] = [];

  isSubcontractor: boolean;
  isOwnerOrAccountant: boolean;
  groupByStrategy: GroupByStrategy;

  datePresets: DateRangePreset[] = [];

  loading = false;
  submitting = false;

  // Validation warnings
  missingRatesWarning = false;
  missingRateWorkers: string[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: CreateInvoiceFromTimesheetsDialogData,
    private dialogRef: MatDialogRef<CreateInvoiceFromTimesheetsDialogComponent>,
    private fb: FormBuilder,
    private store: Store,
    private actions$: Actions
  ) {
    // Determine role-based behavior
    this.isSubcontractor = data.currentUserRole === CompanyRole.SUBCONTRACTOR;
    this.isOwnerOrAccountant = [
      CompanyRole.OWNER,
      CompanyRole.ACCOUNTANT,
      CompanyRole.ADMIN
    ].includes(data.currentUserRole);

    this.groupByStrategy = this.isSubcontractor ? 'WORKER' : 'TASK';

    // Initialize form
    this.invoiceForm = this.fb.group({
      title: [''],
      notes: [''],
      issuedAt: [new Date(), Validators.required],
      dueAt: [this.getDefaultDueDate()],
      dateFrom: [null],
      dateTo: [null]
    });

    // Set date range validators for subcontractor
    if (this.isSubcontractor) {
      this.invoiceForm.get('dateFrom')?.setValidators(Validators.required);
      this.invoiceForm.get('dateTo')?.setValidators(Validators.required);
    }
  }

  ngOnInit(): void {
    this.setupDatePresets();

    if (this.isOwnerOrAccountant) {
      // Load all unbilled timesheets automatically
      this.loadUnbilledTimesheets();
    }

    // Listen for date range changes (subcontractor only)
    if (this.isSubcontractor) {
      combineLatest([
        this.invoiceForm.get('dateFrom')!.valueChanges,
        this.invoiceForm.get('dateTo')!.valueChanges
      ]).pipe(
        takeUntil(this.destroy$)
      ).subscribe(([dateFrom, dateTo]) => {
        if (dateFrom && dateTo) {
          this.loadTimesheetsInRange(dateFrom, dateTo);
        }
      });
    }

    // Listen for line item rate changes
    this.setupLineItemRateListeners();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupDatePresets(): void {
    const today = new Date();
    const dayOfWeek = today.getDay();

    // This week (Monday to Sunday)
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    thisWeekStart.setHours(0, 0, 0, 0);
    const thisWeekEnd = new Date(thisWeekStart);
    thisWeekEnd.setDate(thisWeekStart.getDate() + 6);
    thisWeekEnd.setHours(23, 59, 59, 999);

    // Last week
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(thisWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(thisWeekEnd);
    lastWeekEnd.setDate(thisWeekEnd.getDate() - 7);

    // This month
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    this.datePresets = [
      { label: 'This Week', dateFrom: thisWeekStart, dateTo: thisWeekEnd },
      { label: 'Last Week', dateFrom: lastWeekStart, dateTo: lastWeekEnd },
      { label: 'This Month', dateFrom: thisMonthStart, dateTo: thisMonthEnd }
    ];
  }

  applyDatePreset(preset: DateRangePreset): void {
    this.invoiceForm.patchValue({
      dateFrom: preset.dateFrom,
      dateTo: preset.dateTo
    });
  }

  private loadUnbilledTimesheets(): void {
    this.loading = true;

    // Filter unbilled timesheets for this jobsite
    this.filteredTimesheets = this.data.timesheets.filter(t =>
      t.jobsiteId === this.data.jobsiteId &&
      t.status === 'CLOSED' &&
      !t.invoiceId
    );

    this.loading = false;
    this.generateLineItemPreviews();
  }

  private loadTimesheetsInRange(dateFrom: Date, dateTo: Date): void {
    this.loading = true;

    const fromTime = dateFrom.getTime();
    const toTime = dateTo.getTime();

    // Filter unbilled timesheets in date range for this jobsite
    this.filteredTimesheets = this.data.timesheets.filter(t => {
      if (t.jobsiteId !== this.data.jobsiteId || t.status !== 'CLOSED' || t.invoiceId) {
        return false;
      }

      const checkInTime = new Date(t.checkInTime).getTime();
      return checkInTime >= fromTime && checkInTime <= toTime;
    });

    this.loading = false;
    this.generateLineItemPreviews();
  }

  private generateLineItemPreviews(): void {
    if (this.groupByStrategy === 'WORKER') {
      this.lineItemPreviews = this.groupByWorker(this.filteredTimesheets);
      this.checkForMissingRates();
    } else {
      this.lineItemPreviews = this.groupByTask(this.filteredTimesheets);
    }
  }

  private groupByWorker(timesheets: Timesheet[]): TimesheetLineItemPreview[] {
    const workerMap = new Map<string, TimesheetLineItemPreview>();

    timesheets.forEach(ts => {
      const workerId = ts.workerUserId;
      const workerName = ts.workerName || 'Unknown Worker';

      if (!workerMap.has(workerId)) {
        // Find worker's hourly rate from company members
        const member = this.data.companyMembers.find(m => m.userId === workerId);
        const hourlyRate = member?.hourlyRate || 0;

        workerMap.set(workerId, {
          workerUserId: workerId,
          workerName: workerName,
          totalHours: 0,
          hourlyRate: hourlyRate,
          amount: 0,
          timesheetIds: []
        });
      }

      const preview = workerMap.get(workerId)!;
      const hours = (ts.durationMinutes || 0) / 60;
      preview.totalHours += hours;
      preview.timesheetIds.push(ts.id);
    });

    // Calculate amounts
    workerMap.forEach(preview => {
      preview.amount = preview.totalHours * preview.hourlyRate;
    });

    return Array.from(workerMap.values());
  }

  private groupByTask(timesheets: Timesheet[]): TimesheetLineItemPreview[] {
    const taskMap = new Map<string, TimesheetLineItemPreview>();

    timesheets.forEach(ts => {
      const taskId = ts.jobsiteTaskId;
      const taskName = ts.jobsiteTaskName || 'Unnamed Task';

      if (!taskMap.has(taskId)) {
        taskMap.set(taskId, {
          taskId: taskId,
          taskName: taskName,
          totalHours: 0,
          hourlyRate: 0, // Will be entered manually
          amount: 0,
          timesheetIds: []
        });
      }

      const preview = taskMap.get(taskId)!;
      const hours = (ts.durationMinutes || 0) / 60;
      preview.totalHours += hours;
      preview.timesheetIds.push(ts.id);
    });

    return Array.from(taskMap.values());
  }

  private checkForMissingRates(): void {
    this.missingRateWorkers = [];
    this.missingRatesWarning = false;

    if (this.isSubcontractor) {
      this.lineItemPreviews.forEach(preview => {
        if (preview.hourlyRate <= 0 && preview.workerName) {
          this.missingRateWorkers.push(preview.workerName);
        }
      });

      this.missingRatesWarning = this.missingRateWorkers.length > 0;
    }
  }

  private setupLineItemRateListeners(): void {
    // For OWNER/ACCOUNTANT, rates are entered manually
    // We'll handle this in the template with ngModel
  }

  onRateChange(lineItem: TimesheetLineItemPreview, newRate: number): void {
    lineItem.hourlyRate = newRate;
    lineItem.amount = lineItem.totalHours * lineItem.hourlyRate;
  }

  getTotalAmount(): number {
    return this.lineItemPreviews.reduce((sum, item) => sum + item.amount, 0);
  }

  canSubmit(): boolean {
    if (!this.invoiceForm.valid || this.lineItemPreviews.length === 0) {
      return false;
    }

    // Check that all line items have rates > 0
    const allHaveRates = this.lineItemPreviews.every(item => item.hourlyRate > 0);

    return allHaveRates && !this.submitting;
  }

  onSubmit(): void {
    if (!this.canSubmit()) {
      return;
    }

    this.submitting = true;

    const formValue = this.invoiceForm.value;

    // Build line items
    const lineItems: InvoiceItemInput[] = this.lineItemPreviews.map((preview, index) => {
      let description: string;
      if (this.groupByStrategy === 'WORKER') {
        description = `${preview.workerName} - ${preview.totalHours.toFixed(2)} hours`;
      } else {
        description = `${preview.taskName} - ${preview.totalHours.toFixed(2)} hours`;
      }

      return {
        sortOrder: index,
        description: description,
        quantity: preview.totalHours,
        unitPrice: preview.hourlyRate
      };
    });

    // Collect all timesheet IDs
    const timesheetIds: string[] = [];
    this.lineItemPreviews.forEach(preview => {
      timesheetIds.push(...preview.timesheetIds);
    });

    // Build request
    const request: CreateInvoiceFromTimesheetsInput = {
      jobsiteId: this.data.jobsiteId,
      title: formValue.title || undefined,
      notes: formValue.notes || undefined,
      issuedAt: formValue.issuedAt?.toISOString(),
      dueAt: formValue.dueAt?.toISOString(),
      dateFrom: formValue.dateFrom?.toISOString(),
      dateTo: formValue.dateTo?.toISOString(),
      timesheetIds: timesheetIds,
      groupBy: this.groupByStrategy,
      lineItems: lineItems
    };

    // Dispatch action
    this.store.dispatch(
      createInvoiceFromTimesheets({
        companyId: this.data.companyId,
        request: request
      })
    );

    // Listen for success/failure
    this.actions$.pipe(
      ofType(createInvoiceFromTimesheetsSuccess, createInvoiceFromTimesheetsFailure),
      take(1),
      takeUntil(this.destroy$)
    ).subscribe(action => {
      this.submitting = false;

      if (action.type === createInvoiceFromTimesheetsSuccess.type) {
        this.dialogRef.close(true);
      } else {
        // Error handling is done by the effect/notification service
        // Just reset submitting state
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  private getDefaultDueDate(): Date {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date;
  }
}

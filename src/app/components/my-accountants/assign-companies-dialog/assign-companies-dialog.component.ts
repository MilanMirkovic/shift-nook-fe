import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AccountantTeamMember } from '../../../store/accountant-team/accountant-team.models';
import { assignCompanies, selectAssigningCompanies, selectAssignError } from '../../../store/accountant-team';
import { takeUntil, filter } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Actions, ofType } from '@ngrx/effects';
import { assignCompaniesSuccess, assignCompaniesFailure } from '../../../store/accountant-team';

export interface AssignCompaniesDialogData {
  accountant: AccountantTeamMember;
  availableCompanies: { companyId: string; companyName: string }[];
  currentCompanyId: string;
}

@Component({
  selector: 'app-assign-companies-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './assign-companies-dialog.component.html',
  styleUrls: ['./assign-companies-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignCompaniesDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<AssignCompaniesDialogComponent>);
  private readonly store = inject(Store);
  private readonly actions$ = inject(Actions);
  readonly data = inject<AssignCompaniesDialogData>(MAT_DIALOG_DATA);
  private readonly destroy$ = new Subject<void>();

  readonly assigning$ = this.store.select(selectAssigningCompanies);
  readonly error$ = this.store.select(selectAssignError);

  selectedCompanyIds = new Set<string>(
    this.data.accountant.assignedCompanies.map((c) => c.companyId)
  );

  constructor() {
    // Listen for success and close dialog
    this.actions$
      .pipe(
        ofType(assignCompaniesSuccess),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.dialogRef.close(true);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isAssigned(companyId: string): boolean {
    return this.selectedCompanyIds.has(companyId);
  }

  toggleCompany(companyId: string, checked: boolean): void {
    if (checked) {
      this.selectedCompanyIds.add(companyId);
    } else {
      this.selectedCompanyIds.delete(companyId);
    }
  }

  onSave(): void {
    this.store.dispatch(
      assignCompanies({
        companyId: this.data.currentCompanyId,
        userId: this.data.accountant.userId,
        request: {
          companyIds: Array.from(this.selectedCompanyIds),
        },
      })
    );
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

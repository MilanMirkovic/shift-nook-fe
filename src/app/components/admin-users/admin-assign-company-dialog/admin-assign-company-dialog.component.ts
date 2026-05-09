import { Component, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { combineLatest, map, startWith, take } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

import { CompanyRole } from '../../../shared/models/company-role';
import {
  assignAdminUserCompany,
  assignAdminUserCompanySuccess,
  assignAdminUserCompanyFailure,
} from '../../../store/admin-users/admin-users.actions';
import { loadAdminCompanies } from '../../../store/admin-companies/admin-companies.actions';
import { selectAdminCompanies, selectAdminCompaniesLoading } from '../../../store/admin-companies/admin-companies.selectors';
import { AdminCompany } from '../../../store/admin-companies/admin-companies.models';

export interface AssignCompanyDialogData {
  userId: string;
}

const COMPANY_ROLES: CompanyRole[] = [
  CompanyRole.OWNER,
  CompanyRole.ADMIN,
  CompanyRole.ACCOUNTANT,
  CompanyRole.ACCOUNTING_MANAGER,
  CompanyRole.WORKER,
  CompanyRole.SUBCONTRACTOR,
];

const ROLE_LABELS: Record<CompanyRole, string> = {
  [CompanyRole.OWNER]: 'Owner',
  [CompanyRole.ADMIN]: 'Admin',
  [CompanyRole.ACCOUNTANT]: 'Accountant',
  [CompanyRole.ACCOUNTING_MANAGER]: 'Accounting Manager',
  [CompanyRole.WORKER]: 'Worker',
  [CompanyRole.SUBCONTRACTOR]: 'Subcontractor',
};

@Component({
  selector: 'app-admin-assign-company-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './admin-assign-company-dialog.component.html',
  styleUrls: ['./admin-assign-company-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAssignCompanyDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<AdminAssignCompanyDialogComponent>);
  private readonly data: AssignCompanyDialogData = inject(MAT_DIALOG_DATA);
  private readonly store = inject(Store);
  private readonly actions$ = inject(Actions);

  readonly companyRoles = COMPANY_ROLES;
  readonly roleLabels = ROLE_LABELS;
  readonly companies$ = this.store.select(selectAdminCompanies);
  readonly companiesLoading$ = this.store.select(selectAdminCompaniesLoading);

  readonly companySearch = new FormControl('');

  readonly filteredCompanies$ = combineLatest([
    this.companies$,
    this.companySearch.valueChanges.pipe(startWith('')),
  ]).pipe(
    map(([companies, search]) => {
      const term = (search ?? '').toLowerCase().trim();
      return term ? companies.filter(c => c.name.toLowerCase().includes(term)) : companies;
    })
  );

  protected submitting = false;
  protected serverError: string | null = null;

  protected readonly form: FormGroup = this.fb.group({
    company: [null as AdminCompany | null, [Validators.required]],
    role: [CompanyRole.WORKER, [Validators.required]],
  });

  ngOnInit(): void {
    this.store.dispatch(loadAdminCompanies({ page: 0, size: 200 }));
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.serverError = null;

    const { company, role } = this.form.value;
    const companyId = (company as AdminCompany).id;

    this.store.dispatch(
      assignAdminUserCompany({
        userId: this.data.userId,
        request: { companyId, role },
      })
    );

    this.actions$.pipe(ofType(assignAdminUserCompanySuccess), take(1)).subscribe(() => {
      this.submitting = false;
      this.dialogRef.close(true);
    });

    this.actions$.pipe(ofType(assignAdminUserCompanyFailure), take(1)).subscribe(({ error }) => {
      this.submitting = false;
      this.serverError = error;
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getErrorMessage(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (!control || !control.errors || !control.touched) return '';
    if (control.errors['required']) return `${fieldName === 'company' ? 'Company' : 'Role'} is required`;
    return '';
  }
}

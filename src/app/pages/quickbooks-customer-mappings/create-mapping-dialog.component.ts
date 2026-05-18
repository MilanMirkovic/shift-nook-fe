import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import * as QBCustomerMappingsActions from '../../store/quickbooks-customer-mappings/qb-customer-mappings.actions';
import * as QBCustomerMappingsSelectors from '../../store/quickbooks-customer-mappings/qb-customer-mappings.selectors';
import { QuickBooksCustomer } from '../../store/quickbooks-customer-mappings/qb-customer-mappings.models';
import { selectUserCompanies } from '../../store/user/user.selectors';
import { CompanyMembership } from '../../store/user/user.models';

@Component({
  selector: 'app-create-mapping-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>Create Customer Mapping</h2>

    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>ShiftNook Company</mat-label>
          <mat-select formControlName="clientId">
            <mat-option *ngFor="let company of (companies$ | async)" [value]="company.companyId">
              {{ company.companyName }}
            </mat-option>
          </mat-select>
          <mat-hint>Select the ShiftNook company you want to map to a QuickBooks customer</mat-hint>
          <mat-error *ngIf="form.get('clientId')?.hasError('required')">
            Company is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>QuickBooks Customer</mat-label>
          <mat-select formControlName="quickbooksCustomerId" (selectionChange)="onCustomerSelected($event.value)">
            <mat-option *ngFor="let customer of (quickbooksCustomers$ | async)" [value]="customer.Id">
              {{ customer.DisplayName }}
              <span *ngIf="customer.CompanyName" class="customer-company"> - {{ customer.CompanyName }}</span>
            </mat-option>
          </mat-select>
          <mat-hint>Select the QuickBooks customer to map to this client</mat-hint>
          <mat-error *ngIf="form.get('quickbooksCustomerId')?.hasError('required')">
            QuickBooks customer is required
          </mat-error>
        </mat-form-field>

        <!-- Hidden fields auto-populated when QB customer selected -->
        <input type="hidden" formControlName="quickbooksCustomerName">
        <input type="hidden" formControlName="quickbooksDisplayName">
      </form>

      <div *ngIf="creatingMapping$ | async" class="loading-container">
        <mat-spinner diameter="32"></mat-spinner>
        <p>Creating mapping...</p>
      </div>

      <div *ngIf="error$ | async as error" class="error-message">
        {{ error }}
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">Cancel</button>
      <button
        mat-raised-button
        color="primary"
        (click)="create()"
        [disabled]="form.invalid || (creatingMapping$ | async)"
      >
        Create Mapping
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .customer-company {
      font-size: 0.875rem;
      color: rgba(0, 0, 0, 0.54);
      font-weight: 400;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 16px 0;
    }

    .error-message {
      color: #f44336;
      padding: 8px;
      margin-top: 16px;
      background-color: #ffebee;
      border-radius: 4px;
    }

    mat-dialog-content {
      min-width: 400px;
      padding: 20px;
    }
  `]
})
export class CreateMappingDialogComponent {
  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);

  form: FormGroup;
  quickbooksCustomers$: Observable<QuickBooksCustomer[]>;
  companies$: Observable<CompanyMembership[]>;
  companyId$: Observable<string | null>;
  creatingMapping$: Observable<boolean>;
  error$: Observable<string | null>;

  private selectedCustomer: QuickBooksCustomer | null = null;

  constructor(
    public dialogRef: MatDialogRef<CreateMappingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      quickbooksCustomers$: Observable<QuickBooksCustomer[]>;
      companyId$: Observable<string | null>;
    }
  ) {
    this.quickbooksCustomers$ = data.quickbooksCustomers$;
    this.companyId$ = data.companyId$;
    this.companies$ = this.store.select(selectUserCompanies);
    this.creatingMapping$ = this.store.select(QBCustomerMappingsSelectors.selectCreatingMapping);
    this.error$ = this.store.select(QBCustomerMappingsSelectors.selectError);

    this.form = this.fb.group({
      clientId: ['', Validators.required],
      quickbooksCustomerId: ['', Validators.required],
      quickbooksCustomerName: ['', Validators.required],
      quickbooksDisplayName: ['']
    });

    // Subscribe to success to close dialog
    this.store.select(QBCustomerMappingsSelectors.selectCreatingMapping).subscribe((creating) => {
      // If we were creating and now we're not, and there's no error, close the dialog
      if (!creating && this.selectedCustomer) {
        this.error$.subscribe((error) => {
          if (!error) {
            this.dialogRef.close(true);
          }
        }).unsubscribe();
      }
    });
  }

  onCustomerSelected(customerId: string): void {
    this.quickbooksCustomers$.subscribe((customers) => {
      this.selectedCustomer = customers.find((c) => c.Id === customerId) || null;
      if (this.selectedCustomer) {
        this.form.patchValue({
          quickbooksCustomerName: this.selectedCustomer.DisplayName,
          quickbooksDisplayName: this.selectedCustomer.DisplayName
        });
      }
    }).unsubscribe();
  }

  create(): void {
    if (this.form.valid) {
      this.companyId$.subscribe((companyId) => {
        if (companyId) {
          this.store.dispatch(
            QBCustomerMappingsActions.createMapping({
              companyId,
              request: {
                clientId: this.form.value.clientId,
                quickbooksCustomerId: this.form.value.quickbooksCustomerId,
                quickbooksCustomerName: this.form.value.quickbooksCustomerName,
                quickbooksDisplayName: this.form.value.quickbooksDisplayName
              }
            })
          );
        }
      }).unsubscribe();
    }
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}

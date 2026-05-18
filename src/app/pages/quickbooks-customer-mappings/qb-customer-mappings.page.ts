import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import * as QBCustomerMappingsActions from '../../store/quickbooks-customer-mappings/qb-customer-mappings.actions';
import * as QBCustomerMappingsSelectors from '../../store/quickbooks-customer-mappings/qb-customer-mappings.selectors';
import {
  QuickBooksCustomer,
  QuickBooksCustomerMapping
} from '../../store/quickbooks-customer-mappings/qb-customer-mappings.models';
import { selectSelectedCompanyId, selectCurrentCompany, selectUserCompanies } from '../../store/user/user.selectors';
import { CompanyRole } from '../../shared/models/company-role';
import { UserCompany } from '../../store/user/user.models';

import { CreateMappingDialogComponent } from './create-mapping-dialog.component';

@Component({
  selector: 'app-qb-customer-mappings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="page-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>QuickBooks Customer Mappings</mat-card-title>
          <mat-card-subtitle>
            Map ShiftNook companies to QuickBooks customers to sync invoices
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <!-- Loading state -->
          <div *ngIf="mappingsLoading$ | async" class="loading-container">
            <mat-spinner diameter="40"></mat-spinner>
            <p>Loading mappings...</p>
          </div>

          <!-- Error state -->
          <div *ngIf="error$ | async as error" class="error-container">
            <mat-icon color="warn">error</mat-icon>
            <p>{{ error }}</p>
            <button mat-button (click)="retry()">Retry</button>
          </div>

          <!-- Mappings table -->
          <div *ngIf="!(mappingsLoading$ | async) && !(error$ | async)" class="table-container">
            <div class="table-actions" *ngIf="canManageMappings">
              <button mat-raised-button color="primary" (click)="openCreateMappingDialog()">
                <mat-icon>add</mat-icon>
                Create Mapping
              </button>
            </div>
            <div class="read-only-notice" *ngIf="!canManageMappings">
              <mat-icon>info</mat-icon>
              <p>You can view mappings but cannot create or delete them. Contact your company owner or accounting manager.</p>
            </div>

            <table mat-table [dataSource]="(mappings$ | async) || []" class="mappings-table">
              <!-- ShiftNook Company Column -->
              <ng-container matColumnDef="clientId">
                <th mat-header-cell *matHeaderCellDef>ShiftNook Company</th>
                <td mat-cell *matCellDef="let mapping">
                  {{ getCompanyName(mapping.clientId) || mapping.clientId }}
                </td>
              </ng-container>

              <!-- QuickBooks Customer Column -->
              <ng-container matColumnDef="quickbooksCustomer">
                <th mat-header-cell *matHeaderCellDef>QuickBooks Customer</th>
                <td mat-cell *matCellDef="let mapping">
                  <div class="qb-customer-info">
                    <strong>{{ mapping.quickbooksCustomerName }}</strong>
                    <small>ID: {{ mapping.quickbooksCustomerId }}</small>
                  </div>
                </td>
              </ng-container>

              <!-- Created Date Column -->
              <ng-container matColumnDef="createdAt">
                <th mat-header-cell *matHeaderCellDef>Created</th>
                <td mat-cell *matCellDef="let mapping">
                  {{ mapping.createdAt | date:'short' }}
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let mapping">
                  <button
                    mat-icon-button
                    color="warn"
                    (click)="deleteMapping(mapping.id)"
                    [disabled]="deletingMapping$ | async"
                  >
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

              <!-- Empty state -->
              <tr class="mat-row" *matNoDataRow>
                <td class="mat-cell empty-state" [attr.colspan]="displayedColumns.length">
                  <div class="empty-state-content">
                    <mat-icon>link_off</mat-icon>
                    <h3>No mappings yet</h3>
                    <p *ngIf="canManageMappings">Create your first mapping to start syncing invoices to QuickBooks</p>
                    <p *ngIf="!canManageMappings">No QuickBooks customer mappings have been configured yet.</p>
                    <button *ngIf="canManageMappings" mat-raised-button color="primary" (click)="openCreateMappingDialog()">
                      <mat-icon>add</mat-icon>
                      Create Mapping
                    </button>
                  </div>
                </td>
              </tr>
            </table>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .loading-container, .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      text-align: center;
    }

    .error-container mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }

    .table-actions {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 16px;
    }

    .mappings-table {
      width: 100%;
    }

    .qb-customer-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .qb-customer-info small {
      color: rgba(0, 0, 0, 0.6);
    }

    .empty-state {
      text-align: center !important;
      padding: 48px !important;
    }

    .empty-state-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }

    .empty-state-content mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      opacity: 0.5;
    }

    .empty-state-content h3 {
      margin: 0;
    }

    .empty-state-content p {
      margin: 0;
      color: rgba(0, 0, 0, 0.6);
    }

    .read-only-notice {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      background-color: rgba(59, 130, 246, 0.05);
      border: 1px solid rgba(59, 130, 246, 0.2);
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .read-only-notice mat-icon {
      color: #3b82f6;
      font-size: 24px;
      width: 24px;
      height: 24px;
      flex-shrink: 0;
    }

    .read-only-notice p {
      margin: 0;
      font-size: 0.9375rem;
    }
  `]
})
export class QBCustomerMappingsPage implements OnInit {
  private readonly store = inject(Store);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  displayedColumns: string[] = [];

  companyId$: Observable<string | null>;
  mappings$: Observable<QuickBooksCustomerMapping[]>;
  mappingsLoading$: Observable<boolean>;
  quickbooksCustomers$: Observable<QuickBooksCustomer[]>;
  deletingMapping$: Observable<boolean>;
  error$: Observable<string | null>;
  canManageMappings = false;

  private userCompanies: UserCompany[] = [];

  constructor() {
    this.companyId$ = this.store.select(selectSelectedCompanyId);
    this.mappings$ = this.store.select(QBCustomerMappingsSelectors.selectMappings);
    this.mappingsLoading$ = this.store.select(QBCustomerMappingsSelectors.selectMappingsLoading);
    this.quickbooksCustomers$ = this.store.select(QBCustomerMappingsSelectors.selectQuickBooksCustomers);
    this.deletingMapping$ = this.store.select(QBCustomerMappingsSelectors.selectDeletingMapping);
    this.error$ = this.store.select(QBCustomerMappingsSelectors.selectError);

    // Load user companies for display
    this.store.select(selectUserCompanies).subscribe(companies => {
      this.userCompanies = companies;
    });
  }

  ngOnInit(): void {
    this.companyId$.subscribe((companyId) => {
      if (companyId) {
        this.store.dispatch(QBCustomerMappingsActions.loadMappings({ companyId }));
        this.store.dispatch(QBCustomerMappingsActions.loadQuickBooksCustomers({ companyId }));
      }
    });

    this.store.select(selectCurrentCompany).subscribe((company) => {
      // Only OWNER and ACCOUNTING_MANAGER can create/delete mappings
      this.canManageMappings = company?.role === CompanyRole.OWNER || company?.role === CompanyRole.ACCOUNTING_MANAGER;

      // Set displayed columns based on permissions
      this.displayedColumns = this.canManageMappings
        ? ['clientId', 'quickbooksCustomer', 'createdAt', 'actions']
        : ['clientId', 'quickbooksCustomer', 'createdAt'];
    });
  }

  openCreateMappingDialog(): void {
    const dialogRef = this.dialog.open(CreateMappingDialogComponent, {
      width: '500px',
      data: {
        quickbooksCustomers$: this.quickbooksCustomers$,
        companyId$: this.companyId$
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.snackBar.open('Mapping created successfully', 'Close', { duration: 3000 });
      }
    });
  }

  deleteMapping(mappingId: string): void {
    if (confirm('Are you sure you want to delete this mapping?')) {
      this.companyId$.subscribe((companyId) => {
        if (companyId) {
          this.store.dispatch(QBCustomerMappingsActions.deleteMapping({ companyId, mappingId }));
          this.snackBar.open('Mapping deleted', 'Close', { duration: 3000 });
        }
      }).unsubscribe();
    }
  }

  retry(): void {
    this.store.dispatch(QBCustomerMappingsActions.clearError());
    this.companyId$.subscribe((companyId) => {
      if (companyId) {
        this.store.dispatch(QBCustomerMappingsActions.loadMappings({ companyId }));
        this.store.dispatch(QBCustomerMappingsActions.loadQuickBooksCustomers({ companyId }));
      }
    }).unsubscribe();
  }

  getCompanyName(companyId: string): string | null {
    const company = this.userCompanies.find(c => c.companyId === companyId);
    return company?.companyName || null;
  }
}

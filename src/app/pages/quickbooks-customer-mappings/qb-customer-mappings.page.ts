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
import { selectSelectedCompanyId } from '../../store/user/user.selectors';

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
            Map your ShiftNook clients to QuickBooks customers to sync invoices
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
            <div class="table-actions">
              <button mat-raised-button color="primary" (click)="openCreateMappingDialog()">
                <mat-icon>add</mat-icon>
                Create Mapping
              </button>
            </div>

            <table mat-table [dataSource]="(mappings$ | async) || []" class="mappings-table">
              <!-- ShiftNook Client Column -->
              <ng-container matColumnDef="clientId">
                <th mat-header-cell *matHeaderCellDef>ShiftNook Client</th>
                <td mat-cell *matCellDef="let mapping">
                  {{ mapping.clientId }}
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
                    <p>Create your first mapping to start syncing invoices to QuickBooks</p>
                    <button mat-raised-button color="primary" (click)="openCreateMappingDialog()">
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
  `]
})
export class QBCustomerMappingsPage implements OnInit {
  private readonly store = inject(Store);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  displayedColumns: string[] = ['clientId', 'quickbooksCustomer', 'createdAt', 'actions'];

  companyId$: Observable<string | null>;
  mappings$: Observable<QuickBooksCustomerMapping[]>;
  mappingsLoading$: Observable<boolean>;
  quickbooksCustomers$: Observable<QuickBooksCustomer[]>;
  deletingMapping$: Observable<boolean>;
  error$: Observable<string | null>;

  constructor() {
    this.companyId$ = this.store.select(selectSelectedCompanyId);
    this.mappings$ = this.store.select(QBCustomerMappingsSelectors.selectMappings);
    this.mappingsLoading$ = this.store.select(QBCustomerMappingsSelectors.selectMappingsLoading);
    this.quickbooksCustomers$ = this.store.select(QBCustomerMappingsSelectors.selectQuickBooksCustomers);
    this.deletingMapping$ = this.store.select(QBCustomerMappingsSelectors.selectDeletingMapping);
    this.error$ = this.store.select(QBCustomerMappingsSelectors.selectError);
  }

  ngOnInit(): void {
    this.companyId$.subscribe((companyId) => {
      if (companyId) {
        this.store.dispatch(QBCustomerMappingsActions.loadMappings({ companyId }));
        this.store.dispatch(QBCustomerMappingsActions.loadQuickBooksCustomers({ companyId }));
      }
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
}

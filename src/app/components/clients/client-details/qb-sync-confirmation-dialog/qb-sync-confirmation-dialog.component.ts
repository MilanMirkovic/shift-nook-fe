import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { QuickBooksCustomer } from '../../../../store/quickbooks-customer-mappings/qb-customer-mappings.models';

export interface QBSyncConfirmationDialogData {
  clientName: string;
  matches: QuickBooksCustomer[];
}

export interface QBSyncConfirmationDialogResult {
  confirmed: boolean;
  selectedCustomer?: QuickBooksCustomer;
}

@Component({
  selector: 'app-qb-sync-confirmation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <div class="dialog-header">
      <mat-icon class="header-icon">link</mat-icon>
      <h2 mat-dialog-title>QuickBooks Customer Found</h2>
    </div>

    <mat-dialog-content>
      <div class="match-info">
        <p class="info-text">
          We found <strong>{{ data.matches.length }}</strong>
          QuickBooks customer{{ data.matches.length > 1 ? 's' : '' }}
          matching "<strong>{{ data.clientName }}</strong>":
        </p>

        <div class="customer-list">
          @for (customer of data.matches; track customer.Id) {
            <div
              class="customer-card"
              [class.selected]="selectedCustomer?.Id === customer.Id"
              (click)="selectCustomer(customer)"
            >
              <div class="customer-info">
                <div class="customer-name">{{ customer.DisplayName }}</div>
                @if (customer.CompanyName && customer.CompanyName !== customer.DisplayName) {
                  <div class="customer-company">{{ customer.CompanyName }}</div>
                }
                @if (customer.PrimaryEmailAddr?.Address) {
                  <div class="customer-email">
                    <mat-icon>email</mat-icon>
                    {{ customer.PrimaryEmailAddr?.Address }}
                  </div>
                }
              </div>
              <div class="customer-id">ID: {{ customer.Id }}</div>
              @if (selectedCustomer?.Id === customer.Id) {
                <mat-icon class="check-icon">check_circle</mat-icon>
              }
            </div>
          }
        </div>

        <p class="confirm-text">
          Would you like to link this client to the selected QuickBooks customer?
        </p>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">Cancel</button>
      <button
        mat-raised-button
        color="primary"
        [disabled]="!selectedCustomer"
        (click)="confirm()"
      >
        <mat-icon>link</mat-icon>
        Link Customer
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 24px 0;
    }

    .header-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #4f46e5;
    }

    h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
    }

    mat-dialog-content {
      padding: 24px;
      min-width: 500px;
      max-width: 600px;
    }

    .match-info {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .info-text {
      margin: 0;
      color: rgba(0, 0, 0, 0.87);
      font-size: 0.95rem;
      line-height: 1.5;
    }

    .customer-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-height: 400px;
      overflow-y: auto;
    }

    .customer-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      background: #fff;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
    }

    .customer-card:hover {
      border-color: #4f46e5;
      background: #f5f3ff;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.1);
    }

    .customer-card.selected {
      border-color: #4f46e5;
      background: #eef2ff;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.15);
    }

    .customer-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .customer-name {
      font-size: 1rem;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.87);
    }

    .customer-company {
      font-size: 0.875rem;
      color: rgba(0, 0, 0, 0.6);
    }

    .customer-email {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.875rem;
      color: rgba(0, 0, 0, 0.54);
    }

    .customer-email mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .customer-id {
      font-size: 0.75rem;
      color: rgba(0, 0, 0, 0.38);
      font-family: 'Roboto Mono', monospace;
    }

    .check-icon {
      color: #4f46e5;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .confirm-text {
      margin: 8px 0 0;
      padding: 16px;
      background: #f0f9ff;
      border-left: 4px solid #0ea5e9;
      border-radius: 8px;
      font-size: 0.9rem;
      color: rgba(0, 0, 0, 0.87);
    }

    mat-dialog-actions {
      padding: 16px 24px 20px;
      gap: 12px;
    }

    mat-dialog-actions button {
      min-width: 100px;
    }
  `]
})
export class QBSyncConfirmationDialogComponent {
  selectedCustomer: QuickBooksCustomer | null = null;

  constructor(
    public dialogRef: MatDialogRef<QBSyncConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: QBSyncConfirmationDialogData
  ) {
    // Auto-select if only one match
    if (data.matches.length === 1) {
      this.selectedCustomer = data.matches[0];
    }
  }

  selectCustomer(customer: QuickBooksCustomer): void {
    this.selectedCustomer = customer;
  }

  confirm(): void {
    if (this.selectedCustomer) {
      this.dialogRef.close({
        confirmed: true,
        selectedCustomer: this.selectedCustomer
      } satisfies QBSyncConfirmationDialogResult);
    }
  }

  cancel(): void {
    this.dialogRef.close({
      confirmed: false
    } satisfies QBSyncConfirmationDialogResult);
  }
}

import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { EstimateStatus } from '../../../store/estimates/estimates.models';

export interface EstimateStatusDialogData {
  estimateTitle: string;
  estimateNumber: number;
  currentStatus: EstimateStatus;
  revisionNumber: number;
}

interface StatusOption {
  value: EstimateStatus;
  label: string;
  icon: string;
  colorClass: string;
  description: string;
}

@Component({
  selector: 'app-estimate-status-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './estimate-status-dialog.component.html',
  styleUrls: ['./estimate-status-dialog.component.scss'],
})
export class EstimateStatusDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<EstimateStatusDialogComponent>);

  selectedStatus: EstimateStatus;

  readonly statusOptions: StatusOption[] = [
    { value: 'DRAFT', label: 'Draft', icon: 'edit_note', colorClass: 'status--draft', description: 'Work in progress, not yet sent' },
    { value: 'SENT', label: 'Sent', icon: 'send', colorClass: 'status--sent', description: 'Sent to the client for review' },
    { value: 'ACCEPTED', label: 'Accepted', icon: 'check_circle', colorClass: 'status--accepted', description: 'Client has accepted the estimate' },
    { value: 'DECLINED', label: 'Declined', icon: 'cancel', colorClass: 'status--declined', description: 'Client has declined the estimate' },
    { value: 'VOID', label: 'Void', icon: 'block', colorClass: 'status--void', description: 'Estimate is no longer valid' },
  ];

  constructor(@Inject(MAT_DIALOG_DATA) public data: EstimateStatusDialogData) {
    this.selectedStatus = data.currentStatus;
  }

  selectStatus(status: EstimateStatus): void {
    this.selectedStatus = status;
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onConfirm(): void {
    if (this.selectedStatus === this.data.currentStatus) {
      this.dialogRef.close(null);
      return;
    }
    this.dialogRef.close(this.selectedStatus);
  }

  get hasChanged(): boolean {
    return this.selectedStatus !== this.data.currentStatus;
  }
}

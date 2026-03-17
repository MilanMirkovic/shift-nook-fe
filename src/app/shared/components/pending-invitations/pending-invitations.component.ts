import { Component, Input, OnInit, OnDestroy, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';

import { loadInvitations, revokeInvitation } from '../../../store/invitations/invitations.actions';
import {
  selectInvitations,
  selectInvitationsListLoading,
  selectInvitationsRevoking,
} from '../../../store/invitations/invitations.selectors';
import { Invitation } from '../../../store/invitations/invitations.models';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-pending-invitations',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './pending-invitations.component.html',
  styleUrls: ['./pending-invitations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PendingInvitationsComponent implements OnInit, OnDestroy {
  @Input({ required: true }) companyId!: string;

  private readonly store = inject(Store);
  private readonly dialog = inject(MatDialog);
  private readonly destroy$ = new Subject<void>();

  readonly invitations$ = this.store.select(selectInvitations);
  readonly loading$ = this.store.select(selectInvitationsListLoading);
  readonly revoking$ = this.store.select(selectInvitationsRevoking);

  ngOnInit(): void {
    this.store.dispatch(loadInvitations({ companyId: this.companyId }));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onRevoke(invite: Invitation): void {
    const ref = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Revoke Invitation',
        message: `Are you sure you want to revoke the invitation sent to <strong>${invite.email}</strong>?`,
        confirmText: 'Revoke',
        cancelText: 'Cancel',
        type: 'danger',
      },
      width: '420px',
    });

    ref.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.store.dispatch(revokeInvitation({ companyId: this.companyId, inviteId: invite.id }));
        }
      });
  }

  trackById(_: number, item: Invitation): string {
    return item.id;
  }
}


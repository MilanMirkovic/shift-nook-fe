import { Component, inject, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, filter } from 'rxjs';

import { CompanyRole } from '../../models/company-role';
import { sendInvitation, resetSendState, loadInvitations } from '../../../store/invitations/invitations.actions';
import {
  selectInvitationsSending,
  selectInvitationsSendError,
  selectInvitationsSendSuccess,
} from '../../../store/invitations/invitations.selectors';
import { selectCurrentCompany } from '../../../store/user/user.selectors';
import { NotificationService } from '../../services/notification.service';

export interface InviteWorkerDialogData {
  role?: CompanyRole;
}

@Component({
  selector: 'app-invite-worker-dialog',
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
  templateUrl: './invite-worker-dialog.component.html',
  styleUrls: ['./invite-worker-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InviteWorkerDialogComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly dialogRef = inject(MatDialogRef<InviteWorkerDialogComponent>);
  private readonly notifications = inject(NotificationService);
  private readonly data: InviteWorkerDialogData = inject(MAT_DIALOG_DATA, { optional: true }) ?? {};
  private readonly destroy$ = new Subject<void>();

  readonly sending$ = this.store.select(selectInvitationsSending);
  readonly sendError$ = this.store.select(selectInvitationsSendError);

  readonly inviteForm: FormGroup;
  private companyId: string | null = null;

  readonly roleOptions: { value: CompanyRole; label: string }[] = [
    { value: CompanyRole.WORKER, label: 'Worker' },
    { value: CompanyRole.ACCOUNTANT, label: 'Accountant' },
  ];

  readonly presetRole: CompanyRole | null = this.data.role ?? null;

  constructor() {
    this.inviteForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      role: [this.data.role ?? CompanyRole.WORKER, Validators.required],
    });
  }

  ngOnInit(): void {
    // Grab current company — use selectCurrentCompany which falls back to companies[0]
    this.store.select(selectCurrentCompany)
      .pipe(takeUntil(this.destroy$))
      .subscribe(company => (this.companyId = company?.companyId ?? null));

    // On success — show toast, reload list, close dialog
    this.store.select(selectInvitationsSendSuccess)
      .pipe(
        takeUntil(this.destroy$),
        filter(Boolean),
      )
      .subscribe(() => {
        const email = this.inviteForm.value.email as string;
        this.notifications.success(`Invitation sent to ${email}`);
        if (this.companyId) {
          this.store.dispatch(loadInvitations({ companyId: this.companyId }));
        }
        this.store.dispatch(resetSendState());
        this.dialogRef.close(true);
      });
  }

  ngOnDestroy(): void {
    this.store.dispatch(resetSendState());
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.inviteForm.invalid || !this.companyId) {
      this.inviteForm.markAllAsTouched();
      return;
    }
    this.store.dispatch(
      sendInvitation({
        companyId: this.companyId,
        request: this.inviteForm.value,
      })
    );
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  getErrorMessage(field: string): string {
    const ctrl = this.inviteForm.get(field);
    if (!ctrl || !ctrl.errors || !ctrl.touched) return '';
    if (ctrl.errors['required']) return 'This field is required.';
    if (ctrl.errors['email']) return 'Please enter a valid email address.';
    return '';
  }
}

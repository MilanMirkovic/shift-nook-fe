import { Component, inject, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, filter } from 'rxjs';

import {
  inviteSubcontractor,
  resetInviteState,
} from '../../../store/subcontractors/subcontractors.actions';
import {
  selectSubcontractorInviting,
  selectSubcontractorInviteError,
  selectSubcontractorInviteSuccess,
} from '../../../store/subcontractors/subcontractors.selectors';
import { selectCurrentCompany } from '../../../store/user/user.selectors';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-invite-subcontractor-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './invite-subcontractor-dialog.component.html',
  styleUrls: ['./invite-subcontractor-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InviteSubcontractorDialogComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly dialogRef = inject(MatDialogRef<InviteSubcontractorDialogComponent>);
  private readonly notifications = inject(NotificationService);
  private readonly destroy$ = new Subject<void>();

  readonly sending$ = this.store.select(selectSubcontractorInviting);
  readonly sendError$ = this.store.select(selectSubcontractorInviteError);

  private companyId: string | null = null;

  readonly inviteForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  ngOnInit(): void {
    this.store.dispatch(resetInviteState());

    this.store.select(selectCurrentCompany)
      .pipe(takeUntil(this.destroy$))
      .subscribe(company => (this.companyId = company?.companyId ?? null));

    this.store.select(selectSubcontractorInviteSuccess)
      .pipe(takeUntil(this.destroy$), filter(Boolean))
      .subscribe(() => {
        const email = this.inviteForm.value.email as string;
        this.notifications.success(`Invitation sent to ${email}`);
        this.store.dispatch(resetInviteState());
        this.dialogRef.close(true);
      });
  }

  ngOnDestroy(): void {
    this.store.dispatch(resetInviteState());
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.inviteForm.invalid || !this.companyId) {
      this.inviteForm.markAllAsTouched();
      return;
    }
    this.store.dispatch(inviteSubcontractor({
      companyId: this.companyId,
      request: { email: this.inviteForm.value.email.trim() },
    }));
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

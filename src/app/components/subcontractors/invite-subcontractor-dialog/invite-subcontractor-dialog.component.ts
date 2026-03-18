import { Component, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { Subject, takeUntil } from 'rxjs';

import {
  inviteSubcontractor,
  inviteSubcontractorSuccess,
  resetInviteState,
} from '../../../store/subcontractors/subcontractors.actions';
import {
  selectSubcontractorInviting,
  selectSubcontractorInviteError,
} from '../../../store/subcontractors/subcontractors.selectors';

export interface InviteSubcontractorDialogData {
  companyId: string;
}

@Component({
  selector: 'app-invite-subcontractor-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>Invite Subcontractor</h2>

    <mat-dialog-content>
      <p class="dialog-intro">
        Send an invitation to a subcontractor company owner.<br>
        They will receive an email with a link to accept.
      </p>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" id="invite-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Email address</mat-label>
          <input
            matInput
            formControlName="email"
            type="email"
            placeholder="owner@subcontractor.com"
            autocomplete="off"
          />
          @if (form.get('email')?.errors?.['required'] && form.get('email')?.touched) {
            <mat-error>Email is required</mat-error>
          }
          @if (form.get('email')?.errors?.['email'] && form.get('email')?.touched) {
            <mat-error>Enter a valid email address</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Subcontractor company name (optional)</mat-label>
          <input
            matInput
            formControlName="subcontractorCompanyName"
            placeholder="e.g. Plumber Co"
            autocomplete="off"
          />
          <mat-hint>Used as a hint in the invitation email</mat-hint>
        </mat-form-field>

        @if (inviteError$ | async; as err) {
          <div class="error-banner">
            <mat-icon>error_outline</mat-icon>
            <span>{{ err }}</span>
          </div>
        }
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-stroked-button type="button" (click)="onCancel()" [disabled]="(inviting$ | async) ?? false">
        Cancel
      </button>
      <button
        mat-flat-button
        color="primary"
        type="submit"
        form="invite-form"
        [disabled]="form.invalid || ((inviting$ | async) ?? false)"
      >
        @if (inviting$ | async) {
          <mat-spinner diameter="20" color="accent"></mat-spinner>
        } @else {
          Send Invitation
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-intro { color: #666; margin-bottom: 20px; font-size: 14px; line-height: 1.5; }
    .full-width { width: 100%; margin-bottom: 8px; }
    .error-banner {
      display: flex; align-items: center; gap: 8px;
      background: #fdecea; color: #c62828; border-radius: 6px;
      padding: 10px 14px; margin-top: 8px; font-size: 13px;
    }
    mat-dialog-content { min-width: 420px; }
    mat-dialog-actions { padding: 16px 24px; gap: 8px; }
    button mat-spinner { display: inline-block; }
  `],
})
export class InviteSubcontractorDialogComponent implements OnDestroy {
  private readonly store = inject(Store);
  private readonly actions$ = inject(Actions);
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<InviteSubcontractorDialogComponent>);
  private readonly destroy$ = new Subject<void>();

  readonly data: InviteSubcontractorDialogData = inject(MAT_DIALOG_DATA);

  readonly inviting$ = this.store.select(selectSubcontractorInviting);
  readonly inviteError$ = this.store.select(selectSubcontractorInviteError);

  form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    subcontractorCompanyName: [''],
  });

  constructor() {
    this.store.dispatch(resetInviteState());

    this.actions$.pipe(ofType(inviteSubcontractorSuccess), takeUntil(this.destroy$))
      .subscribe(() => this.dialogRef.close(true));
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const { email, subcontractorCompanyName } = this.form.value;
    this.store.dispatch(inviteSubcontractor({
      companyId: this.data.companyId,
      request: {
        email: email.trim(),
        ...(subcontractorCompanyName?.trim() ? { subcontractorCompanyName: subcontractorCompanyName.trim() } : {}),
      },
    }));
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.store.dispatch(resetInviteState());
  }
}

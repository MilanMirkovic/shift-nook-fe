import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { AccountantTeamMember } from '../../../store/accountant-team/accountant-team.models';

export interface AddEditAccountantDialogData {
  accountant?: AccountantTeamMember;
  mode: 'add' | 'edit';
}

export interface AddEditAccountantDialogResult {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

@Component({
  selector: 'app-add-edit-accountant-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './add-edit-accountant-dialog.component.html',
  styleUrls: ['./add-edit-accountant-dialog.component.scss'],
})
export class AddEditAccountantDialogComponent implements OnInit {
  form: FormGroup;
  isEditMode: boolean;

  availableRoles = [
    { value: 'accountant', label: 'Accountant' },
    { value: 'senior_accountant', label: 'Senior Accountant' },
    { value: 'accounting_manager', label: 'Accounting Manager' },
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddEditAccountantDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddEditAccountantDialogData
  ) {
    this.isEditMode = data.mode === 'edit';
    this.form = this.createForm();
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.accountant) {
      this.form.patchValue({
        email: this.data.accountant.email,
        firstName: this.data.accountant.firstName,
        lastName: this.data.accountant.lastName,
        role: this.data.accountant.role,
      });

      // Disable email in edit mode
      this.form.get('email')?.disable();
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      role: ['accountant', Validators.required],
    });
  }

  get title(): string {
    return this.isEditMode ? 'Edit Accountant' : 'Add New Accountant';
  }

  get submitButtonText(): string {
    return this.isEditMode ? 'Update' : 'Send Invite';
  }

  onSubmit(): void {
    if (this.form.valid) {
      const formValue = this.form.getRawValue();
      this.dialogRef.close(formValue);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

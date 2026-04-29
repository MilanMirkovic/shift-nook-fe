import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AssignSubcontractorToJobsiteRequest } from '../../models/jobsite-subcontractor-assignment.model';

export interface SubcontractorOption {
  companyId: string;
  companyName: string;
  linkId: string;
}

export interface AssignSubcontractorDialogData {
  companyId: string;
  jobsiteId: string;
  jobsiteName: string;
  availableSubcontractors: SubcontractorOption[];
}

@Component({
  selector: 'app-assign-subcontractor-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './assign-subcontractor-dialog.component.html',
  styleUrls: ['./assign-subcontractor-dialog.component.scss']
})
export class AssignSubcontractorDialogComponent implements OnInit {
  assignmentForm: FormGroup;
  submitting = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: AssignSubcontractorDialogData,
    private dialogRef: MatDialogRef<AssignSubcontractorDialogComponent>,
    private fb: FormBuilder
  ) {
    this.assignmentForm = this.fb.group({
      subcontractorCompanyId: ['', Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    // Pre-select first subcontractor if only one available
    if (this.data.availableSubcontractors.length === 1) {
      this.assignmentForm.patchValue({
        subcontractorCompanyId: this.data.availableSubcontractors[0].companyId
      });
    }
  }

  onSubmit(): void {
    if (this.assignmentForm.invalid || this.submitting) {
      return;
    }

    this.submitting = true;

    const request: AssignSubcontractorToJobsiteRequest = {
      subcontractorCompanyId: this.assignmentForm.value.subcontractorCompanyId,
      notes: this.assignmentForm.value.notes || undefined
    };

    this.dialogRef.close(request);
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}

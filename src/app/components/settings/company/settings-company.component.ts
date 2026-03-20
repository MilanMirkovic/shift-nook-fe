import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Subject, combineLatest, filter, take, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { selectCurrentCompany, selectSelectedCompanyId } from '../../../store/user/user.selectors';
import { CompanyMembership } from '../../../store/user/user.models';
import { CompanyRole } from '../../../shared/models/company-role';
import { loadUser } from '../../../store/user/user.actions';
import { CompanyApiService, CompanyDetails } from '../../../api/company.api.service';

@Component({
  selector: 'app-settings-company',
  standalone: true,
  templateUrl: './settings-company.component.html',
  styleUrl: './settings-company.component.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
  ],
})
export class SettingsCompanyComponent implements OnInit, OnDestroy {
  private readonly store      = inject(Store);
  private readonly router     = inject(Router);
  private readonly fb         = inject(FormBuilder);
  private readonly companyApi = inject(CompanyApiService);
  private readonly snack      = inject(MatSnackBar);
  private readonly destroy$   = new Subject<void>();

  isLoading       = true;
  isSaving        = false;
  isEditing       = false;
  isUploadingLogo = false;
  canEdit         = false;
  company: CompanyMembership | null = null;
  private companyId = '';

  // Stored display values
  details: CompanyDetails = { companyName: '' };

  // Logo
  logoUrl         = '';
  logoPreviewUrl  = '';
  isExternalLogo  = false;
  pendingLogoFile: File | null = null;

  form = this.fb.group({
    companyName: ['', Validators.required],
    email:       ['', Validators.email],
    phone:       [''],
    address:     [''],
    website:     ['', Validators.pattern(/^(https?:\/\/.+)?$/)],
  });

  ngOnInit(): void {
    this.isEditing = false;
    combineLatest([
      this.store.select(selectSelectedCompanyId).pipe(filter((id): id is string => !!id), take(1)),
      this.store.select(selectCurrentCompany),
    ]).pipe(take(1), takeUntil(this.destroy$))
      .subscribe(([companyId, company]) => {
        this.companyId = companyId;
        this.company   = company;
        this.canEdit   = company?.role === CompanyRole.OWNER || company?.role === CompanyRole.ADMIN;

        this.companyApi.getCompany(companyId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (d) => {
              this.details = {
                ...d,
                companyName: d.companyName || (d as any).name || company?.companyName || '',
              };
              this.form.patchValue({
                companyName: this.details.companyName,
                email:   d.email   ?? '',
                phone:   d.phone   ?? '',
                address: d.address ?? '',
                website: d.website ?? '',
              });
              this.form.markAsPristine();
              this.isLoading = false;
            },
            error: () => {
              this.details = { companyName: company?.companyName ?? '' };
              this.form.patchValue({ companyName: this.details.companyName });
              this.form.markAsPristine();
              this.isLoading = false;
            },
          });

        this.companyApi.getLogo(companyId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (res) => {
              if (res.logoUrl) {
                this.logoUrl        = res.logoUrl;
                this.logoPreviewUrl = res.logoUrl;
                this.isExternalLogo = true;
              }
            },
            error: () => {},
          });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Edit mode ────────────────────────────────────────────────────────────────

  startEdit(): void {
    this.form.patchValue({
      companyName: this.details.companyName ?? '',
      email:   this.details.email   ?? '',
      phone:   this.details.phone   ?? '',
      address: this.details.address ?? '',
      website: this.details.website ?? '',
    });
    this.form.markAsPristine();
    this.isEditing = true;
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.form.markAsPristine();
  }

  // ── Logo ─────────────────────────────────────────────────────────────────────

  private readonly LOGO_MAX_BYTES  = 20 * 1024 * 1024; // 20 MB
  private readonly LOGO_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file) return;

    if (!this.LOGO_MIME_TYPES.includes(file.type)) {
      this.snack.open('Unsupported file type. Please upload a JPEG, PNG, WebP, or SVG.', 'Dismiss', { duration: 5000 });
      input.value = '';
      return;
    }
    if (file.size > this.LOGO_MAX_BYTES) {
      this.snack.open('File is too large. Maximum size is 20 MB.', 'Dismiss', { duration: 4000 });
      input.value = '';
      return;
    }

    this.pendingLogoFile = file;
    this.isExternalLogo  = false;
    const reader = new FileReader();
    reader.onload = (e) => { this.logoPreviewUrl = e.target?.result as string; };
    reader.readAsDataURL(file);
    input.value = '';
  }

  uploadLogo(): void {
    if (!this.pendingLogoFile || this.isUploadingLogo) return;
    this.isUploadingLogo = true;

    this.companyApi.uploadLogo(this.companyId, this.pendingLogoFile)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.logoUrl         = res.logoUrl ?? this.logoPreviewUrl;
          this.logoPreviewUrl  = this.logoUrl;
          this.isExternalLogo  = true;
          this.pendingLogoFile = null;
          this.isUploadingLogo = false;
          this.snack.open('Logo uploaded successfully.', 'Dismiss', { duration: 3500 });
        },
        error: (err) => {
          this.isUploadingLogo = false;
          this.snack.open(err?.error?.message ?? 'Upload failed. Please try again.', 'Dismiss', { duration: 5000 });
        },
      });
  }

  discardLogo(): void {
    this.pendingLogoFile = null;
    this.logoPreviewUrl  = this.logoUrl;
    this.isExternalLogo  = !!this.logoUrl;
  }

  // ── Save details ─────────────────────────────────────────────────────────────

  save(): void {
    if (this.form.invalid || this.isSaving) return;
    this.isSaving = true;
    const payload = this.form.getRawValue();

    this.companyApi.updateCompany(this.companyId, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.details = {
            companyName: payload.companyName ?? '',
            email:   payload.email   ?? '',
            phone:   payload.phone   ?? '',
            address: payload.address ?? '',
            website: payload.website ?? '',
          };
          this.store.dispatch(loadUser());
          this.form.markAsPristine();
          this.isSaving  = false;
          this.isEditing = false;
          this.snack.open('Company details saved.', 'Dismiss', { duration: 3500 });
        },
        error: (err) => {
          this.isSaving = false;
          this.snack.open(err?.error?.message ?? 'Could not save changes. Please try again.', 'Dismiss', { duration: 5000 });
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/settings']);
  }
}

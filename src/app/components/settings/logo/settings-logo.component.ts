import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, combineLatest, filter, take, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { selectCurrentCompany, selectSelectedCompanyId } from '../../../store/user/user.selectors';
import { CompanyRole } from '../../../shared/models/company-role';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface CompanyLogoResponse {
  logoUrl?: string;
}

@Component({
  selector: 'app-settings-logo',
  standalone: true,
  templateUrl: './settings-logo.component.html',
  styleUrl: './settings-logo.component.scss',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
})
export class SettingsLogoComponent implements OnInit, OnDestroy {
  private readonly store    = inject(Store);
  private readonly router   = inject(Router);
  private readonly http     = inject(HttpClient);
  private readonly snack    = inject(MatSnackBar);
  private readonly destroy$ = new Subject<void>();

  isLoading      = true;
  isSaving       = false;
  canEdit        = false;
  previewUrl     = '';
  isExternalLogo = false;
  pendingFile: File | null = null;
  private companyId = '';

  ngOnInit(): void {
    combineLatest([
      this.store.select(selectSelectedCompanyId).pipe(filter((id): id is string => !!id), take(1)),
      this.store.select(selectCurrentCompany),
    ]).pipe(take(1), takeUntil(this.destroy$))
      .subscribe(([companyId, company]) => {
        this.companyId = companyId;
        this.canEdit   = company?.role === CompanyRole.OWNER || company?.role === CompanyRole.ADMIN;

        this.http.get<CompanyLogoResponse>(`${environment.apiBaseUrl}/companies/${companyId}/logo`)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (res) => {
              if (res.logoUrl) {
                this.previewUrl     = res.logoUrl;
                this.isExternalLogo = true;
              }
              this.isLoading = false;
            },
            error: () => { this.isLoading = false; },
          });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      this.snack.open('File is too large. Maximum size is 2 MB.', 'Dismiss', { duration: 4000 });
      input.value = '';
      return;
    }

    this.pendingFile    = file;
    this.isExternalLogo = false;
    const reader        = new FileReader();
    reader.onload       = (e) => { this.previewUrl = e.target?.result as string; };
    reader.readAsDataURL(file);
  }

  save(): void {
    if (!this.pendingFile || this.isSaving) return;
    this.isSaving = true;

    const fd = new FormData();
    fd.append('file', this.pendingFile, this.pendingFile.name);

    this.http.post<CompanyLogoResponse>(
      `${environment.apiBaseUrl}/companies/${this.companyId}/logo`, fd,
    ).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.previewUrl     = res.logoUrl ?? this.previewUrl;
          this.isExternalLogo = true;
          this.pendingFile    = null;
          this.isSaving       = false;
          this.snack.open('Logo uploaded successfully.', 'Dismiss', { duration: 3500 });
        },
        error: (err) => {
          this.isSaving = false;
          const msg = err?.error?.message ?? 'Upload failed. Please try again.';
          this.snack.open(msg, 'Dismiss', { duration: 5000 });
        },
      });
  }

  removeLogo(): void {
    this.pendingFile    = null;
    this.previewUrl     = '';
    this.isExternalLogo = false;
  }

  discardFile(): void {
    this.pendingFile = null;
    this.isLoading   = true;
    this.ngOnInit();
  }

  goBack(): void {
    this.router.navigate(['/settings']);
  }
}


import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Actions, ofType } from '@ngrx/effects';
import { switchMap, take } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TextFieldModule } from '@angular/cdk/text-field';
import { environment } from '../../../environments/environment';
import { UserStoreService } from '../../store/user/user-store.service';
import { loadUserSuccess } from '../../store/user/user.actions';

function urlValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  try {
    const url = new URL(control.value);
    return url.protocol === 'http:' || url.protocol === 'https:' ? null : { url: true };
  } catch {
    return { url: true };
  }
}

@Component({
  selector: 'app-create-company',
  standalone: true,
  templateUrl: './create-company.component.html',
  styleUrl: './create-company.component.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TextFieldModule,
  ],
})
export class CreateCompanyComponent implements OnInit {
  private readonly fb        = inject(FormBuilder);
  private readonly router    = inject(Router);
  private readonly route     = inject(ActivatedRoute);
  private readonly http      = inject(HttpClient);
  private readonly userStore = inject(UserStoreService);
  private readonly actions$  = inject(Actions);

  isLoading    = false;
  errorMessage = '';
  private returnUrl: string | null = null;
  /** Extracted subcontractor invite token if coming from that flow */
  private subcontractorInviteToken: string | null = null;

  form: FormGroup = this.fb.group({
    name:    ['', [Validators.required, Validators.maxLength(255)]],
    address: ['', [Validators.maxLength(500)]],
    email:   ['', [Validators.email, Validators.maxLength(255)]],
    website: ['', [urlValidator, Validators.maxLength(1024)]],
    phone:   ['', [Validators.maxLength(50)]],
  });

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

    // Extract invite token from returnUrl if present (e.g. /subcontractor-invite?token=abc)
    if (this.returnUrl) {
      const match = this.returnUrl.match(/[?&]token=([^&]+)/);
      if (match && this.returnUrl.includes('subcontractor-invite')) {
        this.subcontractorInviteToken = match[1];
      }
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading    = true;
    this.errorMessage = '';

    const raw = this.form.value;
    const payload = {
      name:    raw.name.trim(),
      address: raw.address?.trim()  || null,
      email:   raw.email?.trim()    || null,
      website: raw.website?.trim()  || null,
      phone:   raw.phone?.trim()    || null,
    };

    this.http.post(`${environment.apiBaseUrl}/companies`, payload).pipe(
      switchMap(() => {
        this.userStore.loadUser();
        return this.actions$.pipe(ofType(loadUserSuccess), take(1));
      }),
      // If subcontractor invite token present, accept it immediately after company is created
      switchMap(() => {
        if (this.subcontractorInviteToken) {
          return this.http.post<void>(
            `${environment.apiBaseUrl}/subcontractor-invites/accept`,
            null,
            { params: { token: this.subcontractorInviteToken } }
          );
        }
        return [null];
      })
    ).subscribe({
      next: () => {
        this.isLoading = false;
        if (this.subcontractorInviteToken) {
          // Invite accepted — reload user and go to principal companies
          this.userStore.loadUser();
          this.router.navigate(['/principal-companies']);
        } else if (this.returnUrl) {
          this.router.navigateByUrl(this.returnUrl);
        } else {
          this.router.navigate(['/team'], { queryParams: { onboarding: true } });
        }
      },
      error: (err) => {
        this.isLoading    = false;
        this.errorMessage = err?.error?.message ?? err?.message ?? 'Failed to create company. Please try again.';
      },
    });
  }
}

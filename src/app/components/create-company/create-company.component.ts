import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TextFieldModule } from '@angular/cdk/text-field';
import { environment } from '../../../environments/environment';
import { UserStoreService } from '../../store/user/user-store.service';

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
export class CreateCompanyComponent {
  private readonly fb     = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly http   = inject(HttpClient);
  private readonly userStore = inject(UserStoreService);

  isLoading    = false;
  errorMessage = '';

  form: FormGroup = this.fb.group({
    name:    ['', [Validators.required, Validators.maxLength(255)]],
    address: ['', [Validators.maxLength(500)]],
    email:   ['', [Validators.email, Validators.maxLength(255)]],
    website: ['', [urlValidator, Validators.maxLength(1024)]],
    phone:   ['', [Validators.maxLength(50)]],
  });

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

    this.http.post(`${environment.apiBaseUrl}/companies`, payload).subscribe({
      next: () => {
        this.userStore.loadUser();
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading    = false;
        this.errorMessage = err?.error?.message ?? err?.message ?? 'Failed to create company. Please try again.';
      },
    });
  }
}

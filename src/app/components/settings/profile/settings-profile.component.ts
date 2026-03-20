import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Subject, filter, take, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { selectUser } from '../../../store/user/user.selectors';
import { UserApi } from '../../../store/user/user.api';
import { loadUser } from '../../../store/user/user.actions';

@Component({
  selector: 'app-settings-profile',
  standalone: true,
  templateUrl: './settings-profile.component.html',
  styleUrl: './settings-profile.component.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
})
export class SettingsProfileComponent implements OnInit, OnDestroy {
  private readonly store    = inject(Store);
  private readonly router   = inject(Router);
  private readonly fb       = inject(FormBuilder);
  private readonly userApi  = inject(UserApi);
  private readonly snack    = inject(MatSnackBar);
  private readonly destroy$ = new Subject<void>();

  isLoading = true;
  isSaving  = false;
  isEditing = false;
  email     = '';
  firstName = '';
  lastName  = '';

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName:  ['', Validators.required],
  });

  ngOnInit(): void {
    this.store.select(selectUser)
      .pipe(filter((u) => !!u), take(1), takeUntil(this.destroy$))
      .subscribe((user) => {
        this.email     = user!.email;
        this.firstName = user!.firstName;
        this.lastName  = user!.lastName;
        this.form.patchValue({ firstName: user!.firstName, lastName: user!.lastName });
        this.form.markAsPristine();
        this.isLoading = false;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  save(): void {
    if (this.form.invalid || this.isSaving) return;
    this.isSaving = true;
    const { firstName, lastName } = this.form.getRawValue();
    this.userApi.updateProfile(firstName!, lastName!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.firstName = firstName!;
          this.lastName  = lastName!;
          this.store.dispatch(loadUser());
          this.form.markAsPristine();
          this.isSaving  = false;
          this.isEditing = false;
          this.snack.open('Profile updated.', 'Dismiss', { duration: 3500 });
        },
        error: (err) => {
          this.isSaving = false;
          const msg = err?.error?.message ?? 'Could not save changes. Please try again.';
          this.snack.open(msg, 'Dismiss', { duration: 5000 });
        },
      });
  }

  startEdit(): void {
    this.form.patchValue({ firstName: this.firstName, lastName: this.lastName });
    this.form.markAsPristine();
    this.isEditing = true;
  }

  cancelEdit(): void {
    this.form.markAsPristine();
    this.isEditing = false;
  }

  discard(): void {
    this.isLoading = true;
    this.isEditing = false;
    this.ngOnInit();
  }

  goBack(): void {
    this.router.navigate(['/settings']);
  }
}

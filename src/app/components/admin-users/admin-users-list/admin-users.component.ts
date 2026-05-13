import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';

import { PageLayoutComponent } from '../../../layout/page-layout/page-layout.component';
import {
  selectAdminUsers,
  selectAdminUsersTotal,
  selectAdminUsersLoading,
  selectAdminUsersPage,
  selectAdminUsersSize,
} from '../../../store/admin-users/admin-users.selectors';
import { loadAdminUsers } from '../../../store/admin-users/admin-users.actions';
import { AdminUser } from '../../../store/admin-users/admin-users.models';
import { UserRole, USER_ROLES } from '../../../shared/models/user-role';
import { AdminCreateUserDialogComponent } from '../admin-create-user-dialog/admin-create-user-dialog.component';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatTableModule,
    MatMenuModule,
    PageLayoutComponent,
  ],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUsersComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly notificationService = inject(NotificationService);
  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject$ = new Subject<string>();

  readonly users$ = this.store.select(selectAdminUsers);
  readonly total$ = this.store.select(selectAdminUsersTotal);
  readonly loading$ = this.store.select(selectAdminUsersLoading);
  readonly page$ = this.store.select(selectAdminUsersPage);
  readonly size$ = this.store.select(selectAdminUsersSize);

  readonly roles = USER_ROLES;
  readonly displayedColumns = ['name', 'email', 'role', 'onboarding', 'createdAt', 'actions'];

  searchQuery = '';
  selectedRole: UserRole | '' = '';
  currentPage = 0;
  currentSize = 50;

  ngOnInit(): void {
    this.loadUsers();

    this.searchSubject$
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage = 0;
        this.loadUsers();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchChange(query: string): void {
    this.searchQuery = query;
    this.searchSubject$.next(query);
  }

  onRoleFilterChange(role: UserRole | ''): void {
    this.selectedRole = role;
    this.currentPage = 0;
    this.loadUsers();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.currentSize = event.pageSize;
    this.loadUsers();
  }

  onUserClick(user: AdminUser): void {
    this.router.navigate(['/admin/users', user.id]);
  }

  onCreateUser(): void {
    const dialogRef = this.dialog.open(AdminCreateUserDialogComponent, {
      width: '520px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: false,
      autoFocus: true,
      panelClass: 'admin-dialog-container'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.notificationService.success('User created! They will receive an email to set their password.');
        this.loadUsers();
      }
    });
  }

  getRoleBadgeClass(role: string): string {
    return `role-badge role-badge--${role.toLowerCase()}`;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  private loadUsers(): void {
    this.store.dispatch(
      loadAdminUsers({
        page: this.currentPage,
        size: this.currentSize,
        role: this.selectedRole || undefined,
        q: this.searchQuery || undefined,
      })
    );
  }
}


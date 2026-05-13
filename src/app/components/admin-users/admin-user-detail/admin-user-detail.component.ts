import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';

import { PageLayoutComponent } from '../../../layout/page-layout/page-layout.component';
import {
  selectSelectedAdminUser,
  selectSelectedAdminUserLoading,
  selectSelectedAdminUserError,
  selectAdminUsersSubmitting,
} from '../../../store/admin-users/admin-users.selectors';
import {
  loadAdminUser,
  clearAdminUserDetail,
  removeAdminUserFromCompany,
} from '../../../store/admin-users/admin-users.actions';
import { AdminUser, CompanyAssignment } from '../../../store/admin-users/admin-users.models';
import { NotificationService } from '../../../shared/services/notification.service';
import { AdminChangeRoleDialogComponent } from '../admin-change-role-dialog/admin-change-role-dialog.component';
import { AdminAssignCompanyDialogComponent } from '../admin-assign-company-dialog/admin-assign-company-dialog.component';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-admin-user-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
    MatCardModule,
    MatDividerModule,
    MatTableModule,
    PageLayoutComponent,
  ],
  templateUrl: './admin-user-detail.component.html',
  styleUrls: ['./admin-user-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUserDetailComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly notificationService = inject(NotificationService);
  private readonly destroy$ = new Subject<void>();

  readonly user$ = this.store.select(selectSelectedAdminUser);
  readonly loading$ = this.store.select(selectSelectedAdminUserLoading);
  readonly error$ = this.store.select(selectSelectedAdminUserError);
  readonly submitting$ = this.store.select(selectAdminUsersSubmitting);

  readonly companyColumns = ['companyName', 'companyRole', 'memberSince', 'actions'];

  private userId: string | null = null;

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        this.userId = params.get('userId');
        if (this.userId) {
          this.store.dispatch(loadAdminUser({ userId: this.userId }));
        }
      });
  }

  ngOnDestroy(): void {
    this.store.dispatch(clearAdminUserDetail());
    this.destroy$.next();
    this.destroy$.complete();
  }

  onChangeRole(user: AdminUser): void {
    const dialogRef = this.dialog.open(AdminChangeRoleDialogComponent, {
      width: '420px',
      maxWidth: '95vw',
      data: { userId: user.id, currentRole: user.role },
      panelClass: 'admin-dialog-container',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.notificationService.success('Platform role updated successfully.');
      }
    });
  }

  onAssignCompany(user: AdminUser): void {
    const dialogRef = this.dialog.open(AdminAssignCompanyDialogComponent, {
      width: '480px',
      maxWidth: '95vw',
      data: { userId: user.id },
      panelClass: 'admin-dialog-container',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.notificationService.success('Company assignment updated.');
      }
    });
  }

  onRemoveFromCompany(user: AdminUser, assignment: CompanyAssignment): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '420px',
      maxWidth: '90vw',
      data: {
        title: 'Remove from Company',
        message: `Remove ${user.firstName} ${user.lastName} from ${assignment.companyName}? This will revoke their access to this company.`,
        confirmText: 'Remove',
        type: 'danger',
      } as ConfirmationDialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.store.dispatch(
          removeAdminUserFromCompany({ userId: user.id, companyId: assignment.companyId })
        );
        this.notificationService.success(`Removed from ${assignment.companyName}.`);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/users']);
  }

  getRoleBadgeClass(role: string): string {
    return `role-badge role-badge--${role.toLowerCase()}`;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}


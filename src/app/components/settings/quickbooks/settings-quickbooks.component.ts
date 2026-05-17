import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { selectSelectedCompanyId, selectCurrentCompany } from '../../../store/user/user.selectors';
import * as QuickBooksConnectionActions from '../../../store/quickbooks-connection/quickbooks-connection.actions';
import * as QuickBooksConnectionSelectors from '../../../store/quickbooks-connection/quickbooks-connection.selectors';
import { QuickBooksConnection } from '../../../store/quickbooks-connection/quickbooks-connection.models';
import { CompanyRole } from '../../../shared/models/company-role';

@Component({
  selector: 'app-settings-quickbooks',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatSnackBarModule,
  ],
  templateUrl: './settings-quickbooks.component.html',
  styleUrl: './settings-quickbooks.component.scss',
})
export class SettingsQuickBooksComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroy$ = new Subject<void>();

  connection$ = this.store.select(QuickBooksConnectionSelectors.selectConnection);
  isConnected$ = this.store.select(QuickBooksConnectionSelectors.selectIsConnected);
  loading$ = this.store.select(QuickBooksConnectionSelectors.selectLoading);
  connecting$ = this.store.select(QuickBooksConnectionSelectors.selectConnecting);
  disconnecting$ = this.store.select(QuickBooksConnectionSelectors.selectDisconnecting);
  error$ = this.store.select(QuickBooksConnectionSelectors.selectError);

  companyId: string | null = null;
  canManageConnection = false;

  ngOnInit(): void {
    // Handle OAuth callback query parameters
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      if (params['qb'] === 'success') {
        this.snackBar.open('Successfully connected to QuickBooks!', 'Close', {
          duration: 5000,
          panelClass: 'success-snackbar',
        });
        // Reload connection status to show connected state
        const companyId = params['companyId'] || this.companyId;
        if (companyId) {
          this.store.dispatch(QuickBooksConnectionActions.loadConnectionStatus({ companyId }));
        }
        // Remove query params from URL
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {},
          replaceUrl: true,
        });
      } else if (params['qb'] === 'error') {
        const message = params['message'] || 'Failed to connect to QuickBooks';
        this.snackBar.open(message, 'Close', {
          duration: 7000,
          panelClass: 'error-snackbar',
        });
        // Remove query params from URL
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {},
          replaceUrl: true,
        });
      }
    });

    this.store
      .select(selectSelectedCompanyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((companyId) => {
        if (companyId) {
          this.companyId = companyId;
          this.store.dispatch(QuickBooksConnectionActions.loadConnectionStatus({ companyId }));
        }
      });

    this.store
      .select(selectCurrentCompany)
      .pipe(takeUntil(this.destroy$))
      .subscribe((company) => {
        // Only OWNER and ACCOUNTING_MANAGER can connect/disconnect QuickBooks
        this.canManageConnection = company?.role === CompanyRole.OWNER || company?.role === CompanyRole.ACCOUNTING_MANAGER;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  connectToQuickBooks(): void {
    if (this.companyId) {
      this.store.dispatch(QuickBooksConnectionActions.connectToQuickBooks({ companyId: this.companyId }));
    }
  }

  disconnect(): void {
    if (this.companyId && confirm('Are you sure you want to disconnect QuickBooks? This will stop invoice syncing.')) {
      this.store.dispatch(QuickBooksConnectionActions.disconnectQuickBooks({ companyId: this.companyId }));
    }
  }

  goToCustomerMappings(): void {
    this.router.navigate(['/settings/quickbooks-customer-mappings']);
  }

  clearError(): void {
    this.store.dispatch(QuickBooksConnectionActions.clearError());
  }

  goBack(): void {
    this.router.navigate(['/settings']);
  }
}

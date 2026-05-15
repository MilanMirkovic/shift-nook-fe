import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { Subject, takeUntil, combineLatest, filter, take } from 'rxjs';
import { Store } from '@ngrx/store';

import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';

import { PageLayoutComponent } from '../../layout/page-layout/page-layout.component';
import { selectCurrentCompany, selectSelectedCompanyId, selectUser } from '../../store/user/user.selectors';
import { CompanyRole } from '../../shared/models/company-role';

interface SettingsCard {
  route: string;
  icon: string;
  iconClass: string;
  title: string;
  description: string;
  meta?: string;
  chevron: boolean;
  disabled?: boolean;
  badge?: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  imports: [CommonModule, RouterOutlet, PageLayoutComponent, MatIconModule, MatRippleModule],
})
export class SettingsComponent implements OnInit, OnDestroy {
  private readonly store   = inject(Store);
  private readonly router  = inject(Router);
  private readonly destroy$ = new Subject<void>();

  isLoading       = true;
  canEditCompany  = false;
  userInitials    = '';
  userName        = '';
  companyName     = '';
  roleLabel       = '';
  roleBadgeClass  = '';

  cards: SettingsCard[] = [];

  ngOnInit(): void {
    combineLatest([
      this.store.select(selectSelectedCompanyId).pipe(filter((id): id is string => !!id), take(1)),
      this.store.select(selectCurrentCompany),
      this.store.select(selectUser),
    ]).pipe(take(1), takeUntil(this.destroy$))
      .subscribe(([, company, user]) => {
        this.canEditCompany = company?.role === CompanyRole.OWNER || company?.role === CompanyRole.ADMIN;
        this.companyName    = company?.companyName ?? '';

        const roleMap: Record<string, string> = {
          OWNER: 'Owner', ADMIN: 'Admin', ACCOUNTANT: 'Accountant',
          ACCOUNTING_MANAGER: 'Accounting Manager',
          WORKER: 'Worker', SUBCONTRACTOR: 'Subcontractor',
        };
        const badgeMap: Record<string, string> = {
          OWNER: 'role--owner', ADMIN: 'role--admin',
          ACCOUNTANT: 'role--accountant', ACCOUNTING_MANAGER: 'role--accountant',
          WORKER: 'role--worker',
        };
        this.roleLabel     = roleMap[company?.role ?? ''] ?? (company?.role ?? '');
        this.roleBadgeClass = badgeMap[company?.role ?? ''] ?? '';

        if (user) {
          this.userName     = `${user.firstName} ${user.lastName}`.trim();
          this.userInitials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase();
        }

        this.buildCards();
        this.isLoading = false;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildCards(): void {
    this.cards = [
      {
        route: 'company',
        icon: 'business',
        iconClass: 'icon--blue',
        title: 'Company Details',
        description: 'Name, email, phone, address, logo and website.',
        meta: this.companyName || undefined,
        chevron: true,
        disabled: !this.canEditCompany,
        badge: !this.canEditCompany ? 'Read-only' : undefined,
      },
      {
        route: 'profile',
        icon: 'person',
        iconClass: 'icon--green',
        title: 'My Profile',
        description: 'Your name and personal details.',
        meta: this.userName || undefined,
        chevron: true,
      },
      {
        route: 'quickbooks-customer-mappings',
        icon: 'sync',
        iconClass: 'icon--purple',
        title: 'QuickBooks Mappings',
        description: 'Map clients to QuickBooks customers for invoice sync.',
        chevron: true,
      },
    ];
  }

  navigate(card: SettingsCard): void {
    this.router.navigate(['/settings', card.route]);
  }
}

import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { authGuard, publicGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';
import { CompanyRole } from './shared/models/company-role';
import { SUBCONTRACTORS_FEATURE_KEY, subcontractorsReducer } from './store/subcontractors/subcontractors.reducer';
import { SubcontractorsEffects } from './store/subcontractors/subcontractors.effects';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  // ── Public auth routes ────────────────────────────────────────────────────
  {
    path: 'login',
    canActivate: [publicGuard],
    loadChildren: () => import('./components/login/login.module').then((m) => m.LoginModule),
  },
  {
    path: 'signup',
    canActivate: [publicGuard],
    loadComponent: () =>
      import('./components/signup/signup.component').then((m) => m.SignupComponent),
  },
  {
    path: 'confirm',
    canActivate: [publicGuard],
    loadComponent: () =>
      import('./components/confirm-email/confirm-email.component').then(
        (m) => m.ConfirmEmailComponent,
      ),
  },
  {
    path: 'forgot-password',
    canActivate: [publicGuard],
    loadComponent: () =>
      import('./components/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent,
      ),
  },
  {
    path: 'auth/reset-password',
    loadComponent: () =>
      import('./components/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent,
      ),
  },
  {
    path: 'auth/set-password',
    loadComponent: () =>
      import('./components/set-password/set-password.component').then(
        (m) => m.SetPasswordComponent,
      ),
  },

  // ── Protected routes ──────────────────────────────────────────────────────
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./components/dashboard/dashboard.module').then((m) => m.DashboardModule),
  },
  {
    path: 'shifts',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/shifts.page').then((m) => m.ShiftsPage),
  },
  {
    path: 'team',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./components/team-members/team-members.module').then((m) => m.TeamMembersModule),
  },
  {
    path: 'settings',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/settings.page').then((m) => m.SettingsPage),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/settings/settings.component').then((m) => m.SettingsComponent),
      },
      {
        path: 'company',
        loadComponent: () =>
          import('./components/settings/company/settings-company.component').then(
            (m) => m.SettingsCompanyComponent,
          ),
      },
      {
        path: 'logo',
        loadComponent: () =>
          import('./components/settings/logo/settings-logo.component').then(
            (m) => m.SettingsLogoComponent,
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./components/settings/profile/settings-profile.component').then(
            (m) => m.SettingsProfileComponent,
          ),
      },
    ],
  },
  {
    path: 'work-time',
    canActivate: [authGuard, roleGuard(CompanyRole.ACCOUNTANT)],
    loadChildren: () =>
      import('./components/work-time/work-time.module').then((m) => m.WorkTimeModule),
  },
  {
    path: 'workers',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./components/workers/workers.module').then((m) => m.WorkersModule),
  },
  {
    path: 'jobsites',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./components/jobsites/jobsites.module').then((m) => m.JobsitesModule),
  },
  {
    path: 'clients',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./components/clients/clients.module').then((m) => m.ClientsModule),
  },
  {
    path: 'notifications',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/notifications/notifications.component').then(
        (m) => m.NotificationsComponent,
      ),
  },
  {
    path: 'select-company',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./components/company-selection/company-selection.module').then(
        (m) => m.CompanySelectionModule,
      ),
  },
  {
    path: 'create-company',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/create-company/create-company.component').then(
        (m) => m.CreateCompanyComponent,
      ),
  },
  {
    path: 'accept-invite',
    loadComponent: () =>
      import('./components/accept-invite/accept-invite.component').then((m) => m.AcceptInviteComponent),
  },
  // ── Subcontractor invite (public landing) ─────────────────────────────────
  {
    path: 'subcontractor-invite',
    providers: [
      provideState(SUBCONTRACTORS_FEATURE_KEY, subcontractorsReducer),
      provideEffects(SubcontractorsEffects),
    ],
    loadComponent: () =>
      import('./components/subcontractors/subcontractor-accept-invite/subcontractor-accept-invite.component').then(
        (m) => m.SubcontractorAcceptInviteComponent,
      ),
  },
  // ── Owner: subcontractors list + detail ───────────────────────────────────
  {
    path: 'subcontractors',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./components/subcontractors/subcontractors-routing.module').then(
        (m) => m.SUBCONTRACTORS_ROUTES,
      ),
  },
  // ── Subcontractor owner: principal companies + manage workers ─────────────
  {
    path: 'principal-companies',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./components/subcontractors/principal-companies-routing.module').then(
        (m) => m.PRINCIPAL_COMPANIES_ROUTES,
      ),
  },
  {
    path: 'companies/:companyId',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/company-redirect.page').then((m) => m.CompanyRedirectPage),
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found.page').then((m) => m.NotFoundPage),
  },
];

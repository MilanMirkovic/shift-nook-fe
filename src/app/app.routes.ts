import { Routes } from '@angular/router';
import { authGuard, publicGuard } from './core/auth/auth.guard';

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
  },
  {
    path: 'work-time',
    canActivate: [authGuard],
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

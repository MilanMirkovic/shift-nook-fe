import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { authGuard, publicGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';
import { platformAdminGuard } from './core/auth/platform-admin.guard';
import { CompanyRole } from './shared/models/company-role';

// Feature stores and effects for lazy loading
// Import reducers
import { reducer as timesheetsReducer } from './store/timesheets/timesheets.reducer';
import { reducer as jobsitesReducer } from './store/jobsites/jobsites.reducer';
import { reducer as jobsiteTasksReducer } from './store/jobsite-tasks/jobsite-tasks.reducer';
import { reducer as companyMembersReducer } from './store/company-members/company-members.reducer';
import { reducer as clientsReducer } from './store/clients/clients.reducer';
import { estimatesReducer } from './store/estimates/estimates.reducer';
import { invoicesReducer } from './store/invoices/invoices.reducer';
import { notificationsReducer } from './store/notifications/notifications.reducer';
import { invitationsReducer } from './store/invitations/invitations.reducer';
import { companyWorkSessionsReducer } from './store/company-work-sessions/company-work-sessions.reducer';
import { subcontractorsReducer } from './store/subcontractors/subcontractors.reducer';
import { adminDashboardReducer } from './store/admin-dashboard/admin-dashboard.reducer';
import { adminUsersReducer } from './store/admin-users/admin-users.reducer';
import { adminCompaniesReducer } from './store/admin-companies/admin-companies.reducer';
import { accountantTeamReducer } from './store/accountant-team/accountant-team.reducer';

// Import feature keys from selectors
import { TIMESHEETS_FEATURE_KEY } from './store/timesheets/timesheets.selectors';
import { JOBSITES_FEATURE_KEY } from './store/jobsites/jobsites.selectors';
import { JOBSITE_TASKS_FEATURE_KEY } from './store/jobsite-tasks/jobsite-tasks.selectors';
import { COMPANY_MEMBERS_FEATURE_KEY } from './store/company-members/company-members.selectors';
import { CLIENTS_FEATURE_KEY } from './store/clients/clients.selectors';
import { ESTIMATES_FEATURE_KEY } from './store/estimates/estimates.selectors';
import { INVOICES_FEATURE_KEY } from './store/invoices/invoices.selectors';
import { NOTIFICATIONS_FEATURE_KEY } from './store/notifications/notifications.selectors';
import { INVITATIONS_FEATURE_KEY } from './store/invitations/invitations.reducer';
import { SUBCONTRACTORS_FEATURE_KEY } from './store/subcontractors/subcontractors.reducer';
import { ADMIN_DASHBOARD_FEATURE_KEY } from './store/admin-dashboard/admin-dashboard.reducer';
import { ADMIN_USERS_FEATURE_KEY } from './store/admin-users/admin-users.reducer';
import { ADMIN_COMPANIES_FEATURE_KEY } from './store/admin-companies/admin-companies.reducer';
import { ACCOUNTANT_TEAM_FEATURE_KEY } from './store/accountant-team/accountant-team.models';

// Import effects
import { TimesheetsEffects } from './store/timesheets/timesheets.effects';
import { JobsitesEffects } from './store/jobsites/jobsites.effects';
import { JobsiteTasksEffects } from './store/jobsite-tasks/jobsite-tasks.effects';
import { CompanyMembersEffects } from './store/company-members/company-members.effects';
import { ClientsEffects } from './store/clients/clients.effects';
import { EstimatesEffects } from './store/estimates/estimates.effects';
import { InvoicesEffects } from './store/invoices/invoices.effects';
import { NotificationsEffects } from './store/notifications/notifications.effects';
import { InvitationsEffects } from './store/invitations/invitations.effects';
import { CompanyWorkSessionsEffects } from './store/company-work-sessions/company-work-sessions.effects';
import { SubcontractorsEffects } from './store/subcontractors/subcontractors.effects';
import { AdminDashboardEffects } from './store/admin-dashboard/admin-dashboard.effects';
import { AdminUsersEffects } from './store/admin-users/admin-users.effects';
import { AdminCompaniesEffects } from './store/admin-companies/admin-companies.effects';
import { AccountantTeamEffects } from './store/accountant-team/accountant-team.effects';

// Define COMPANY_WORK_SESSIONS_FEATURE_KEY if not exported from elsewhere
export const COMPANY_WORK_SESSIONS_FEATURE_KEY = 'companyWorkSessions';

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
    data: { preload: true },
    providers: [
      provideState(TIMESHEETS_FEATURE_KEY, timesheetsReducer),
      provideState(JOBSITES_FEATURE_KEY, jobsitesReducer),
      provideState(CLIENTS_FEATURE_KEY, clientsReducer),
      provideState(COMPANY_MEMBERS_FEATURE_KEY, companyMembersReducer),
      provideState(ESTIMATES_FEATURE_KEY, estimatesReducer),
      provideState(INVOICES_FEATURE_KEY, invoicesReducer),
      provideEffects(TimesheetsEffects, JobsitesEffects, ClientsEffects, CompanyMembersEffects, EstimatesEffects, InvoicesEffects),
    ],
    loadChildren: () =>
      import('./components/dashboard/dashboard.module').then((m) => m.DashboardModule),
  },
  {
    path: 'shifts',
    canActivate: [authGuard],
    data: { preload: true },
    loadComponent: () => import('./pages/shifts.page').then((m) => m.ShiftsPage),
  },
  {
    path: 'team',
    canActivate: [authGuard],
    data: { preload: true },
    providers: [
      provideState(COMPANY_MEMBERS_FEATURE_KEY, companyMembersReducer),
      provideEffects(CompanyMembersEffects),
    ],
    loadChildren: () =>
      import('./components/team-members/team-members.module').then((m) => m.TeamMembersModule),
  },
  {
    path: 'settings',
    canActivate: [authGuard],
    data: { preload: true },
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
    data: { preload: true },
    providers: [
      provideState(TIMESHEETS_FEATURE_KEY, timesheetsReducer),
      provideState(COMPANY_WORK_SESSIONS_FEATURE_KEY, companyWorkSessionsReducer),
      provideEffects(TimesheetsEffects, CompanyWorkSessionsEffects),
    ],
    loadChildren: () =>
      import('./components/work-time/work-time.module').then((m) => m.WorkTimeModule),
  },
  {
    path: 'workers',
    canActivate: [authGuard],
    data: { preload: true },
    providers: [
      provideState(COMPANY_MEMBERS_FEATURE_KEY, companyMembersReducer),
      provideEffects(CompanyMembersEffects),
    ],
    loadChildren: () =>
      import('./components/workers/workers.module').then((m) => m.WorkersModule),
  },
  {
    path: 'jobsites',
    canActivate: [authGuard],
    data: { preload: true },
    providers: [
      provideState(JOBSITES_FEATURE_KEY, jobsitesReducer),
      provideState(JOBSITE_TASKS_FEATURE_KEY, jobsiteTasksReducer),
      provideEffects(JobsitesEffects, JobsiteTasksEffects),
    ],
    loadChildren: () =>
      import('./components/jobsites/jobsites.module').then((m) => m.JobsitesModule),
  },
  {
    path: 'clients',
    canActivate: [authGuard],
    data: { preload: true },
    providers: [
      provideState(CLIENTS_FEATURE_KEY, clientsReducer),
      provideState(ESTIMATES_FEATURE_KEY, estimatesReducer),
      provideState(INVOICES_FEATURE_KEY, invoicesReducer),
      provideEffects(ClientsEffects, EstimatesEffects, InvoicesEffects),
    ],
    loadChildren: () =>
      import('./components/clients/clients.module').then((m) => m.ClientsModule),
  },
  {
    path: 'financials',
    canActivate: [authGuard, roleGuard(CompanyRole.OWNER, CompanyRole.ACCOUNTANT)],
    data: { preload: true },
    providers: [
      provideState(INVOICES_FEATURE_KEY, invoicesReducer),
      provideState(ESTIMATES_FEATURE_KEY, estimatesReducer),
      provideEffects(InvoicesEffects, EstimatesEffects),
    ],
    loadComponent: () =>
      import('./components/financials/financials.component').then((m) => m.FinancialsComponent),
  },
  {
    path: 'notifications',
    canActivate: [authGuard],
    data: { preload: true },
    providers: [
      provideState(NOTIFICATIONS_FEATURE_KEY, notificationsReducer),
      provideEffects(NotificationsEffects),
    ],
    loadComponent: () =>
      import('./components/notifications/notifications.component').then(
        (m) => m.NotificationsComponent,
      ),
  },
  {
    path: 'select-company',
    canActivate: [authGuard],
    providers: [
      provideState(INVITATIONS_FEATURE_KEY, invitationsReducer),
      provideState(COMPANY_WORK_SESSIONS_FEATURE_KEY, companyWorkSessionsReducer),
      provideEffects(InvitationsEffects, CompanyWorkSessionsEffects),
    ],
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
  // ── My Accountants: accountant team management ────────────────────────────
  {
    path: 'my-accountants',
    canActivate: [authGuard, roleGuard(CompanyRole.ACCOUNTING_MANAGER)],
    data: { preload: true },
    providers: [
      provideState(ACCOUNTANT_TEAM_FEATURE_KEY, accountantTeamReducer),
      provideEffects(AccountantTeamEffects),
    ],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/my-accountants/my-accountants.component').then(
            (m) => m.MyAccountantsComponent
          ),
      },
      {
        path: ':userId',
        loadComponent: () =>
          import('./components/my-accountants/accountant-detail/accountant-detail.component').then(
            (m) => m.AccountantDetailComponent
          ),
      },
    ],
  },
  // ── Platform Admin: user management ───────────────────────────────────────
  {
    path: 'admin/dashboard',
    canActivate: [authGuard, platformAdminGuard],
    providers: [
      provideState(ADMIN_DASHBOARD_FEATURE_KEY, adminDashboardReducer),
      provideEffects(AdminDashboardEffects),
    ],
    loadComponent: () =>
      import('./components/admin-dashboard/admin-dashboard.component').then(
        (m) => m.AdminDashboardComponent,
      ),
  },
  {
    path: 'admin/companies',
    canActivate: [authGuard, platformAdminGuard],
    providers: [
      provideState(ADMIN_COMPANIES_FEATURE_KEY, adminCompaniesReducer),
      provideEffects(AdminCompaniesEffects),
    ],
    loadChildren: () =>
      import('./components/admin-companies/admin-companies-routing.module').then(
        (m) => m.ADMIN_COMPANIES_ROUTES,
      ),
  },
  {
    path: 'admin/users',
    canActivate: [authGuard, platformAdminGuard],
    providers: [
      provideState(ADMIN_USERS_FEATURE_KEY, adminUsersReducer),
      provideEffects(AdminUsersEffects),
    ],
    loadChildren: () =>
      import('./components/admin-users/admin-users-routing.module').then(
        (m) => m.ADMIN_USERS_ROUTES,
      ),
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found.page').then((m) => m.NotFoundPage),
  },
];

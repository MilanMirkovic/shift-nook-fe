import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    loadChildren: () => import('./components/dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  {
    path: 'shifts',
    loadComponent: () => import('./pages/shifts.page').then((m) => m.ShiftsPage)
  },
  {
    path: 'team',
    loadChildren: () => import('./components/team-members/team-members.module').then(m => m.TeamMembersModule)
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings.page').then((m) => m.SettingsPage)
  },
  {
    path: 'work-time',
    loadChildren: () => import('./components/work-time/work-time.module').then(m => m.WorkTimeModule)
  },

  {
    path: 'workers',
    loadChildren: () => import('./components/workers/workers.module').then(m => m.WorkersModule)
  },

  {
    path: 'jobsites',
    loadChildren: () => import('./components/jobsites/jobsites.module').then(m => m.JobsitesModule)
  },

  {
    path: 'clients',
    loadChildren: () => import('./components/clients/clients.module').then(m => m.ClientsModule)
  },

  {
    path: 'notifications',
    loadComponent: () => import('./components/notifications/notifications.component').then(m => m.NotificationsComponent)
  },

  {
    path: 'login',
    loadChildren: () => import('./components/login/login.module').then((m) => m.LoginModule)
  },

  {
    path: 'select-company',
    loadChildren: () => import('./components/company-selection/company-selection.module').then((m) => m.CompanySelectionModule)
  },

  {
    path: '**',
    loadComponent: () => import('./pages/not-found.page').then((m) => m.NotFoundPage)
  }
];

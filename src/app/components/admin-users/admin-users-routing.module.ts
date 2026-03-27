import { Routes } from '@angular/router';

export const ADMIN_USERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./admin-users-list/admin-users.component').then(
        (m) => m.AdminUsersComponent
      ),
  },
  {
    path: ':userId',
    loadComponent: () =>
      import('./admin-user-detail/admin-user-detail.component').then(
        (m) => m.AdminUserDetailComponent
      ),
  },
];


import { Routes } from '@angular/router';

export const ADMIN_COMPANIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./admin-companies-list/admin-companies.component').then(
        (m) => m.AdminCompaniesComponent
      ),
  },
  {
    path: ':companyId',
    loadComponent: () =>
      import('./admin-company-detail/admin-company-detail.component').then(
        (m) => m.AdminCompanyDetailComponent
      ),
  },
];


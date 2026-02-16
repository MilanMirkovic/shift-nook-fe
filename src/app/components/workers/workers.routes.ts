import { Routes } from '@angular/router';


export const WORKERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./workers.component').then((m) => m.WorkersComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('./worker-details/worker-details.component').then((m) => m.WorkerDetailsComponent),
  }
];

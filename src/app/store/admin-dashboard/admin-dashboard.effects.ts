import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, map, catchError, of } from 'rxjs';
import { AdminDashboardApiService } from './admin-dashboard.api';
import * as DashboardActions from './admin-dashboard.actions';

@Injectable()
export class AdminDashboardEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(AdminDashboardApiService);

  loadDashboard$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardActions.loadAdminDashboard),
      switchMap(() =>
        this.api.loadDashboardData().pipe(
          map(({ stats, recentUsers, recentCompanies }) =>
            DashboardActions.loadAdminDashboardSuccess({ stats, recentUsers, recentCompanies })
          ),
          catchError((err) =>
            of(DashboardActions.loadAdminDashboardFailure({ error: err?.message ?? 'Failed to load dashboard' }))
          )
        )
      )
    )
  );
}

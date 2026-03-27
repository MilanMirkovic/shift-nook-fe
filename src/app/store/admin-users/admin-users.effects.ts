import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import * as AdminActions from './admin-users.actions';
import { AdminUsersApiService } from './admin-users.api';

@Injectable()
export class AdminUsersEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(AdminUsersApiService);

  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.loadAdminUsers),
      switchMap(({ page, size, role, q }) =>
        this.api.listUsers(page, size, role, q).pipe(
          map((res) =>
            AdminActions.loadAdminUsersSuccess({
              users: res.content,
              total: res.totalElements,
              page: res.number,
              size: res.size,
            })
          ),
          catchError((err) =>
            of(AdminActions.loadAdminUsersFailure({ error: this.toErrorMessage(err) }))
          )
        )
      )
    )
  );

  loadUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.loadAdminUser),
      switchMap(({ userId }) =>
        this.api.getUser(userId).pipe(
          map((user) => AdminActions.loadAdminUserSuccess({ user })),
          catchError((err) =>
            of(AdminActions.loadAdminUserFailure({ error: this.toErrorMessage(err) }))
          )
        )
      )
    )
  );

  createUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.createAdminUser),
      switchMap(({ request }) =>
        this.api.createUser(request).pipe(
          map((user) => AdminActions.createAdminUserSuccess({ user })),
          catchError((err) =>
            of(AdminActions.createAdminUserFailure({ error: this.toErrorMessage(err) }))
          )
        )
      )
    )
  );

  updateRole$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.updateAdminUserRole),
      switchMap(({ userId, role }) =>
        this.api.updateRole(userId, { role }).pipe(
          map((user) => AdminActions.updateAdminUserRoleSuccess({ user })),
          catchError((err) =>
            of(AdminActions.updateAdminUserRoleFailure({ error: this.toErrorMessage(err) }))
          )
        )
      )
    )
  );

  assignCompany$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.assignAdminUserCompany),
      switchMap(({ userId, request }) =>
        this.api.assignCompany(userId, request).pipe(
          map((user) => AdminActions.assignAdminUserCompanySuccess({ user })),
          catchError((err) =>
            of(AdminActions.assignAdminUserCompanyFailure({ error: this.toErrorMessage(err) }))
          )
        )
      )
    )
  );

  removeFromCompany$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.removeAdminUserFromCompany),
      switchMap(({ userId, companyId }) =>
        this.api.removeFromCompany(userId, companyId).pipe(
          map(() =>
            AdminActions.removeAdminUserFromCompanySuccess({ userId, companyId })
          ),
          catchError((err) =>
            of(AdminActions.removeAdminUserFromCompanyFailure({ error: this.toErrorMessage(err) }))
          )
        )
      )
    )
  );

  private toErrorMessage(err: unknown): string {
    if (typeof err === 'string') return err;
    const e = err as any;
    return e?.error?.message || e?.error?.error || e?.message || 'Request failed';
  }
}


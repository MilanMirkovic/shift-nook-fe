import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { AccountantTeamApiService } from './accountant-team.api';
import * as AccountantTeamActions from './accountant-team.actions';

@Injectable()
export class AccountantTeamEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(AccountantTeamApiService);

  // ─── Load Accountants ───────────────────────────────────────────────────────
  loadAccountants$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountantTeamActions.loadAccountants),
      switchMap(({ companyId, page, size, q }) =>
        this.api.listAccountants(companyId, { page, size, q }).pipe(
          map((response) =>
            AccountantTeamActions.loadAccountantsSuccess({ response })
          ),
          catchError((err) =>
            of(
              AccountantTeamActions.loadAccountantsFailure({
                error: this.toErrorMessage(err),
              })
            )
          )
        )
      )
    )
  );

  // ─── Load Accountant Detail ─────────────────────────────────────────────────
  loadAccountantDetail$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountantTeamActions.loadAccountantDetail),
      switchMap(({ companyId, userId }) =>
        this.api.getAccountantDetail(companyId, userId).pipe(
          map((accountant) =>
            AccountantTeamActions.loadAccountantDetailSuccess({ accountant })
          ),
          catchError((err) =>
            of(
              AccountantTeamActions.loadAccountantDetailFailure({
                error: this.toErrorMessage(err),
              })
            )
          )
        )
      )
    )
  );

  // ─── Assign Companies ───────────────────────────────────────────────────────
  assignCompanies$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountantTeamActions.assignCompanies),
      switchMap(({ companyId, userId, request }) =>
        this.api.assignCompanies(companyId, userId, request).pipe(
          map(() => AccountantTeamActions.assignCompaniesSuccess()),
          catchError((err) =>
            of(
              AccountantTeamActions.assignCompaniesFailure({
                error: this.toErrorMessage(err),
              })
            )
          )
        )
      )
    )
  );

  // ─── Remove Company Assignment ──────────────────────────────────────────────
  removeCompanyAssignment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountantTeamActions.removeCompanyAssignment),
      switchMap(({ companyId, userId, assignedCompanyId }) =>
        this.api.removeCompanyAssignment(companyId, userId, assignedCompanyId).pipe(
          map(() =>
            AccountantTeamActions.removeCompanyAssignmentSuccess({
              assignedCompanyId,
            })
          ),
          catchError((err) =>
            of(
              AccountantTeamActions.removeCompanyAssignmentFailure({
                error: this.toErrorMessage(err),
              })
            )
          )
        )
      )
    )
  );

  // ─── Load Stats ─────────────────────────────────────────────────────────────
  loadStats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AccountantTeamActions.loadStats),
      switchMap(({ companyId }) =>
        this.api.getStats(companyId).pipe(
          map((stats) =>
            AccountantTeamActions.loadStatsSuccess({ stats })
          ),
          catchError((err) =>
            of(
              AccountantTeamActions.loadStatsFailure({
                error: this.toErrorMessage(err),
              })
            )
          )
        )
      )
    )
  );

  // ─── Helpers ────────────────────────────────────────────────────────────────
  private toErrorMessage(err: any): string {
    if (typeof err === 'string') return err;
    if (err?.error?.message) return err.error.message;
    if (err?.message) return err.message;
    return 'An unexpected error occurred';
  }
}

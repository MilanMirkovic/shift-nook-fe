import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, switchMap, withLatestFrom, filter } from 'rxjs/operators';

import {
  loadMembers,
  loadMembersSuccess,
  loadMembersFailure,
  updateFilters,
  updatePage,
  loadMemberById,
  loadMemberByIdSuccess,
  loadMemberByIdFailure,
  removeMember,
  removeMemberSuccess,
  removeMemberFailure,
  updateMemberHourlyRate,
  updateMemberHourlyRateSuccess,
  updateMemberHourlyRateFailure
} from './company-members.actions';

import { CompanyMembersApi } from './company-members.api';
import { CompanyMembersState } from './company-members.models';
import {
  selectFilters,
  selectPage,
  selectSize
} from './company-members.selectors';

@Injectable()
export class CompanyMembersEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(CompanyMembersApi);
  private readonly store = inject<Store<CompanyMembersState>>(Store);

  /**
   * Main effect: perform the HTTP call when loadMembers is dispatched.
   */
  loadMembers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadMembers),
      switchMap(({ companyId, page, size, role, q }) =>
        this.api.listMembers(companyId, { page, size, role, q }).pipe(
          map((response) => loadMembersSuccess({ response })),
          catchError((err) => of(loadMembersFailure({ error: this.toErrorMessage(err) })))
        )
      )
    )
  );

  /**
   * Optional auto-reload effect (currently disabled via filter).
   */
  autoReloadOnUiChange$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateFilters, updatePage),
      withLatestFrom(
        this.store.select(selectFilters),
        this.store.select(selectPage),
        this.store.select(selectSize)
      ),
      filter(() => false),
      map(([, filters, page, size]) =>
        loadMembers({
          companyId: '',
          page,
          size,
          role: filters.role,
          q: filters.q
        })
      )
    )
  );

  /**
   * Load single member by ID effect
   */
  loadMemberById$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadMemberById),
      switchMap(({ companyId, userId }) =>
        this.api.getMemberById(companyId, userId).pipe(
          map((member) => loadMemberByIdSuccess({ member })),
          catchError((err) => of(loadMemberByIdFailure({ error: this.toErrorMessage(err) })))
        )
      )
    )
  );

  /**
   * Remove member effect
   */
  removeMember$ = createEffect(() =>
    this.actions$.pipe(
      ofType(removeMember),
      switchMap(({ companyId, userId }) =>
        this.api.removeMember(companyId, userId).pipe(
          map(() => removeMemberSuccess({ userId })),
          catchError((err) => of(removeMemberFailure({ error: this.toErrorMessage(err) })))
        )
      )
    )
  );

  /**
   * Update member hourly rate effect
   */
  updateMemberHourlyRate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateMemberHourlyRate),
      switchMap(({ companyId, userId, hourlyRate }) =>
        this.api.updateMemberHourlyRate(companyId, userId, hourlyRate).pipe(
          map((member) => updateMemberHourlyRateSuccess({ member })),
          catchError((err) => of(updateMemberHourlyRateFailure({ error: this.toErrorMessage(err) })))
        )
      )
    )
  );

  private toErrorMessage(err: unknown): string {
    if (typeof err === 'string') return err;

    const anyErr = err as any;

    const backendMessage = anyErr?.error?.message || anyErr?.error?.error || anyErr?.message;
    if (backendMessage && typeof backendMessage === 'string') return backendMessage;

    const status = anyErr?.status;
    const statusText = anyErr?.statusText;

    if (status) return `Request failed (${status}${statusText ? ` ${statusText}` : ''})`;

    return 'Request failed';
  }
}

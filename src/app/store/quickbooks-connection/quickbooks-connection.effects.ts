import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import * as QuickBooksConnectionActions from './quickbooks-connection.actions';
import { QuickBooksConnectionApi } from './quickbooks-connection.api';

@Injectable()
export class QuickBooksConnectionEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(QuickBooksConnectionApi);

  loadConnectionStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(QuickBooksConnectionActions.loadConnectionStatus),
      switchMap(({ companyId }) =>
        this.api.getConnectionStatus(companyId).pipe(
          map((connection) =>
            QuickBooksConnectionActions.loadConnectionStatusSuccess({ connection })
          ),
          catchError((error) => {
            // 404 means not connected yet - this is not an error state
            if (error.status === 404) {
              return of(QuickBooksConnectionActions.loadConnectionStatusNotFound());
            }
            return of(
              QuickBooksConnectionActions.loadConnectionStatusFailure({
                error: this.toErrorMessage(error),
              })
            );
          })
        )
      )
    )
  );

  connectToQuickBooks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(QuickBooksConnectionActions.connectToQuickBooks),
      switchMap(({ companyId }) =>
        this.api.getAuthorizationUrl(companyId).pipe(
          map(({ url }) =>
            QuickBooksConnectionActions.connectToQuickBooksSuccess({ authUrl: url })
          ),
          catchError((error) =>
            of(
              QuickBooksConnectionActions.connectToQuickBooksFailure({
                error: this.toErrorMessage(error),
              })
            )
          )
        )
      )
    )
  );

  connectToQuickBooksSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(QuickBooksConnectionActions.connectToQuickBooksSuccess),
        tap(({ authUrl }) => {
          // Redirect to QuickBooks authorization URL
          window.location.href = authUrl;
        })
      ),
    { dispatch: false }
  );

  disconnectQuickBooks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(QuickBooksConnectionActions.disconnectQuickBooks),
      switchMap(({ companyId }) =>
        this.api.disconnect(companyId).pipe(
          map(() => QuickBooksConnectionActions.disconnectQuickBooksSuccess()),
          catchError((error) =>
            of(
              QuickBooksConnectionActions.disconnectQuickBooksFailure({
                error: this.toErrorMessage(error),
              })
            )
          )
        )
      )
    )
  );

  private toErrorMessage(error: any): string {
    if (error.error?.message) {
      return error.error.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  }
}

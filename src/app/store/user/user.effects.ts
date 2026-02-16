import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import {
  loadUser,
  loadUserSuccess,
  loadUserFailure
} from './user.actions';
import { UserApi } from './user.api';

@Injectable()
export class UserEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(UserApi);

  /**
   * Load user profile when loadUser action is dispatched
   */
  loadUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadUser),
      switchMap(() =>
        this.api.getCurrentUser().pipe(
          map((user) => loadUserSuccess({ user })),
          catchError((err) => of(loadUserFailure({ error: this.toErrorMessage(err) })))
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


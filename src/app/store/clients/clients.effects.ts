import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import {
  loadClientById,
  loadClientByIdSuccess,
  loadClientByIdFailure
} from './clients.actions';

import {
  loadClients,
  loadClientsSuccess,
  loadClientsFailure, createClient, createClientSuccess, createClientFailure
} from './clients.actions';

import { ClientsApiService } from './clients.api';

@Injectable()
export class ClientsEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(ClientsApiService);

  loadClients$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadClients),
      switchMap(({ companyId, page, size }) =>
        this.api.loadClients(companyId, page, size).pipe(
          map((response) => loadClientsSuccess({ response })),
          catchError((err) =>
            of(loadClientsFailure({ error: this.toErrorMessage(err) }))
          )
        )
      )
    )
  );

  createClient$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createClient),
      switchMap(({ companyId, client }) =>
        this.api.createClient(companyId, client).pipe(
          map((client) => createClientSuccess({ client })),
          catchError((err) =>
            of(createClientFailure({ error: this.toErrorMessage(err) }))
          )
        )
      )
    )
  );

  loadClientById$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadClientById),
      switchMap(({ companyId, clientId }) =>
        this.api.getClientById(companyId, clientId).pipe(
          map((client) => loadClientByIdSuccess({ client })),
          catchError((err) =>
            of(loadClientByIdFailure({ error: this.toErrorMessage(err) }))
          )
        )
      )
    )
  );

  private toErrorMessage(err: unknown): string {
    if (typeof err === 'string') return err;
    const e: any = err;
    return e?.error?.message || e?.message || 'Request failed';
  }
}

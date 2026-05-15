import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import * as QBCustomerMappingsActions from './qb-customer-mappings.actions';
import { QBCustomerMappingsApiService } from './qb-customer-mappings.api';

@Injectable()
export class QBCustomerMappingsEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(QBCustomerMappingsApiService);

  loadQuickBooksCustomers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(QBCustomerMappingsActions.loadQuickBooksCustomers),
      switchMap(({ companyId }) =>
        this.api.listQuickBooksCustomers(companyId).pipe(
          map((customers) =>
            QBCustomerMappingsActions.loadQuickBooksCustomersSuccess({ customers })
          ),
          catchError((err) =>
            of(
              QBCustomerMappingsActions.loadQuickBooksCustomersFailure({
                error: this.toErrorMessage(err),
              })
            )
          )
        )
      )
    )
  );

  loadMappings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(QBCustomerMappingsActions.loadMappings),
      switchMap(({ companyId }) =>
        this.api.listMappings(companyId).pipe(
          map((mappings) =>
            QBCustomerMappingsActions.loadMappingsSuccess({ mappings })
          ),
          catchError((err) =>
            of(
              QBCustomerMappingsActions.loadMappingsFailure({
                error: this.toErrorMessage(err),
              })
            )
          )
        )
      )
    )
  );

  createMapping$ = createEffect(() =>
    this.actions$.pipe(
      ofType(QBCustomerMappingsActions.createMapping),
      switchMap(({ companyId, request }) =>
        this.api.createMapping(companyId, request).pipe(
          map((mapping) =>
            QBCustomerMappingsActions.createMappingSuccess({ mapping })
          ),
          catchError((err) =>
            of(
              QBCustomerMappingsActions.createMappingFailure({
                error: this.toErrorMessage(err),
              })
            )
          )
        )
      )
    )
  );

  deleteMapping$ = createEffect(() =>
    this.actions$.pipe(
      ofType(QBCustomerMappingsActions.deleteMapping),
      switchMap(({ companyId, mappingId }) =>
        this.api.deleteMapping(companyId, mappingId).pipe(
          map(() =>
            QBCustomerMappingsActions.deleteMappingSuccess({ mappingId })
          ),
          catchError((err) =>
            of(
              QBCustomerMappingsActions.deleteMappingFailure({
                error: this.toErrorMessage(err),
              })
            )
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

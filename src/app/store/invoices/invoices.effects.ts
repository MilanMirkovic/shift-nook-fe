import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import * as InvoicesActions from './invoices.actions';
import { InvoicesApiService } from './invoices.api';

@Injectable()
export class InvoicesEffects {
  private readonly actions$ = inject(Actions);
  private readonly invoicesApi = inject(InvoicesApiService);

  loadInvoices$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InvoicesActions.loadInvoices),
      switchMap(({ companyId, page = 0, size = 20, sort, clientId }) =>
        this.invoicesApi.loadInvoices(companyId, page, size, sort, clientId).pipe(
          map((response) => InvoicesActions.loadInvoicesSuccess({ invoices: response.content, total: response.totalElements })),
          catchError((error: HttpErrorResponse) => {
            if (error?.status === 404) {
              return of(InvoicesActions.loadInvoicesSuccess({ invoices: [], total: 0 }));
            }
            return of(InvoicesActions.loadInvoicesFailure({ error: error?.message || 'Failed to load invoices' }));
          })
        )
      )
    )
  );

  loadInvoiceById$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InvoicesActions.loadInvoiceById),
      switchMap(({ companyId, invoiceId }) =>
        this.invoicesApi.getInvoiceById(companyId, invoiceId).pipe(
          map((invoice) => InvoicesActions.loadInvoiceByIdSuccess({ invoice })),
          catchError((error) => of(InvoicesActions.loadInvoiceByIdFailure({ error: error?.message || 'Failed to load invoice' })))
        )
      )
    )
  );

  createInvoice$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InvoicesActions.createInvoice),
      switchMap(({ companyId, invoice }) =>
        this.invoicesApi.createInvoice(companyId, invoice).pipe(
          map((newInvoice) => InvoicesActions.createInvoiceSuccess({ invoice: newInvoice })),
          catchError((error) => of(InvoicesActions.createInvoiceFailure({ error: error?.message || 'Failed to create invoice' })))
        )
      )
    )
  );

  updateInvoice$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InvoicesActions.updateInvoice),
      switchMap(({ companyId, invoiceId, invoice }) =>
        this.invoicesApi.updateInvoice(companyId, invoiceId, invoice).pipe(
          map((updated) => InvoicesActions.updateInvoiceSuccess({ invoice: updated })),
          catchError((error) => of(InvoicesActions.updateInvoiceFailure({ error: error?.message || 'Failed to update invoice' })))
        )
      )
    )
  );

  updateInvoiceStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InvoicesActions.updateInvoiceStatus),
      switchMap(({ companyId, invoiceId, statusUpdate }) =>
        this.invoicesApi.updateInvoiceStatus(companyId, invoiceId, statusUpdate).pipe(
          map((updated) => InvoicesActions.updateInvoiceStatusSuccess({ invoice: updated })),
          catchError((error) => of(InvoicesActions.updateInvoiceStatusFailure({ error: error?.message || 'Failed to update invoice status' })))
        )
      )
    )
  );

  deleteInvoice$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InvoicesActions.deleteInvoice),
      switchMap(({ companyId, invoiceId }) =>
        this.invoicesApi.deleteInvoice(companyId, invoiceId).pipe(
          map(() => InvoicesActions.deleteInvoiceSuccess({ invoiceId, companyId })),
          catchError((error) => of(InvoicesActions.deleteInvoiceFailure({ error: error?.message || 'Failed to delete invoice' })))
        )
      )
    )
  );
}

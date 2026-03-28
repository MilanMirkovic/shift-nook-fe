import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { AdminCompaniesApiService } from './admin-companies.api';
import {
  loadAdminCompanies, loadAdminCompaniesSuccess, loadAdminCompaniesFailure,
  loadAdminCompany, loadAdminCompanySuccess, loadAdminCompanyFailure,
  createAdminCompany, createAdminCompanySuccess, createAdminCompanyFailure,
  updateAdminCompany, updateAdminCompanySuccess, updateAdminCompanyFailure,
  deleteAdminCompany, deleteAdminCompanySuccess, deleteAdminCompanyFailure,
} from './admin-companies.actions';

@Injectable()
export class AdminCompaniesEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(AdminCompaniesApiService);

  loadCompanies$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadAdminCompanies),
      switchMap(({ page, size, q }) =>
        this.api.listCompanies(page, size, q).pipe(
          map((res) =>
            loadAdminCompaniesSuccess({
              companies: res.content,
              total: res.totalElements,
              page: res.pageable.pageNumber,
              size: res.pageable.pageSize,
            })
          ),
          catchError((err) =>
            of(loadAdminCompaniesFailure({ error: err?.error?.message ?? 'Failed to load companies' }))
          )
        )
      )
    )
  );

  loadCompany$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadAdminCompany),
      switchMap(({ companyId }) =>
        this.api.getCompany(companyId).pipe(
          map((company) => loadAdminCompanySuccess({ company })),
          catchError((err) =>
            of(loadAdminCompanyFailure({ error: err?.error?.message ?? 'Failed to load company' }))
          )
        )
      )
    )
  );

  createCompany$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createAdminCompany),
      mergeMap(({ request }) =>
        this.api.createCompany(request).pipe(
          map((company) => createAdminCompanySuccess({ company })),
          catchError((err) =>
            of(createAdminCompanyFailure({ error: err?.error?.message ?? 'Failed to create company' }))
          )
        )
      )
    )
  );

  updateCompany$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateAdminCompany),
      mergeMap(({ companyId, request }) =>
        this.api.updateCompany(companyId, request).pipe(
          map((company) => updateAdminCompanySuccess({ company })),
          catchError((err) =>
            of(updateAdminCompanyFailure({ error: err?.error?.message ?? 'Failed to update company' }))
          )
        )
      )
    )
  );

  deleteCompany$ = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteAdminCompany),
      mergeMap(({ companyId }) =>
        this.api.deleteCompany(companyId).pipe(
          map(() => deleteAdminCompanySuccess({ companyId })),
          catchError((err) =>
            of(deleteAdminCompanyFailure({ error: err?.error?.message ?? 'Failed to delete company' }))
          )
        )
      )
    )
  );
}

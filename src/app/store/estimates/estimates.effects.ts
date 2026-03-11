import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { map, catchError, switchMap, withLatestFrom } from 'rxjs/operators';
import * as EstimatesActions from './estimates.actions';
import { EstimatesApiService } from './estimates.api';
import { selectEstimatesFilters } from './estimates.selectors';

@Injectable()
export class EstimatesEffects {
  private readonly actions$ = inject(Actions);
  private readonly estimatesApi = inject(EstimatesApiService);
  private readonly store = inject(Store);

  loadEstimates$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EstimatesActions.loadEstimates),
      switchMap(({ companyId, page = 0, size = 20, sort, clientId }) =>
        this.estimatesApi.loadEstimates(companyId, page, size, sort, clientId).pipe(
          map((response) =>
            EstimatesActions.loadEstimatesSuccess({
              estimates: response.content,
              total: response.totalElements
            })
          ),
          catchError((error) =>
            of(EstimatesActions.loadEstimatesFailure({
              error: error?.message || 'Failed to load estimates'
            }))
          )
        )
      )
    )
  );

  loadEstimateById$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EstimatesActions.loadEstimateById),
      switchMap(({ companyId, estimateId }) =>
        this.estimatesApi.getEstimateById(companyId, estimateId).pipe(
          map((estimate) =>
            EstimatesActions.loadEstimateByIdSuccess({ estimate })
          ),
          catchError((error) =>
            of(EstimatesActions.loadEstimateByIdFailure({
              error: error?.message || 'Failed to load estimate'
            }))
          )
        )
      )
    )
  );

  createEstimate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EstimatesActions.createEstimate),
      switchMap(({ companyId, estimate }) =>
        this.estimatesApi.createEstimate(companyId, estimate).pipe(
          map((newEstimate) =>
            EstimatesActions.createEstimateSuccess({ estimate: newEstimate })
          ),
          catchError((error) =>
            of(EstimatesActions.createEstimateFailure({
              error: error?.message || 'Failed to create estimate'
            }))
          )
        )
      )
    )
  );

  updateEstimate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EstimatesActions.updateEstimate),
      switchMap(({ companyId, estimateId, estimate }) =>
        this.estimatesApi.updateEstimate(companyId, estimateId, estimate).pipe(
          map((updatedEstimate) =>
            EstimatesActions.updateEstimateSuccess({ estimate: updatedEstimate })
          ),
          catchError((error) =>
            of(EstimatesActions.updateEstimateFailure({
              error: error?.message || 'Failed to update estimate'
            }))
          )
        )
      )
    )
  );

  updateEstimateStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EstimatesActions.updateEstimateStatus),
      switchMap(({ companyId, estimateId, statusUpdate }) =>
        this.estimatesApi.updateEstimateStatus(companyId, estimateId, statusUpdate).pipe(
          map((updatedEstimate) =>
            EstimatesActions.updateEstimateStatusSuccess({ estimate: updatedEstimate })
          ),
          catchError((error) =>
            of(EstimatesActions.updateEstimateStatusFailure({
              error: error?.message || 'Failed to update estimate status'
            }))
          )
        )
      )
    )
  );

  deleteEstimate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EstimatesActions.deleteEstimate),
      switchMap(({ companyId, estimateId }) =>
        this.estimatesApi.deleteEstimate(companyId, estimateId).pipe(
          map(() =>
            EstimatesActions.deleteEstimateSuccess({ estimateId, companyId })
          ),
          catchError((error) =>
            of(EstimatesActions.deleteEstimateFailure({
              error: error?.message || 'Failed to delete estimate'
            }))
          )
        )
      )
    )
  );

  reloadAfterDelete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EstimatesActions.deleteEstimateSuccess),
      withLatestFrom(this.store.select(selectEstimatesFilters)),
      map(([{ companyId }, filters]) =>
        EstimatesActions.loadEstimates({
          companyId,
          page: filters.page,
          size: filters.size,
          sort: filters.sort,
          clientId: filters.clientId
        })
      )
    )
  );
}


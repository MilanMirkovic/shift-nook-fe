import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { map, catchError, switchMap, withLatestFrom } from 'rxjs/operators';
import * as JobsitesActions from './jobsites.actions';
import { JobsitesApiService } from './jobsites.api';
import { selectFilters } from './jobsites.selectors';

@Injectable()
export class JobsitesEffects {
  private readonly actions$ = inject(Actions);
  private readonly jobsitesApi = inject(JobsitesApiService);
  private readonly store = inject(Store);

  loadJobsites$ = createEffect(() =>
    this.actions$.pipe(
      ofType(JobsitesActions.loadJobsites),
      switchMap(({ companyId, page = 0, size = 20, sort, search }) =>
        this.jobsitesApi.loadJobsites(companyId, page, size, sort, search).pipe(
          map((response) =>
            JobsitesActions.loadJobsitesSuccess({
              jobsites: response.content,
              total: response.totalElements
            })
          ),
          catchError((error) =>
            of(
              JobsitesActions.loadJobsitesFailure({
                error: error?.message || 'Failed to load jobsites'
              })
            )
          )
        )
      )
    )
  );

  createJobsite$ = createEffect(() =>
    this.actions$.pipe(
      ofType(JobsitesActions.createJobsite),
      switchMap(({ companyId, jobsite }) =>
        this.jobsitesApi.createJobsite(companyId, jobsite).pipe(
          map((newJobsite) => {
            console.log('Created jobsite from API:', newJobsite);
            return JobsitesActions.createJobsiteSuccess({ jobsite: newJobsite });
          }),
          catchError((error) =>
            of(
              JobsitesActions.createJobsiteFailure({
                error: error?.message || 'Failed to create jobsite'
              })
            )
          )
        )
      )
    )
  );

  loadJobsiteById$ = createEffect(() =>
    this.actions$.pipe(
      ofType(JobsitesActions.loadJobsiteById),
      switchMap(({ companyId, jobsiteId }) =>
        this.jobsitesApi.getJobsiteById(companyId, jobsiteId).pipe(
          map((jobsite) =>
            JobsitesActions.loadJobsiteByIdSuccess({ jobsite })
          ),
          catchError((error) =>
            of(
              JobsitesActions.loadJobsiteByIdFailure({
                error: error?.message || 'Failed to load jobsite'
              })
            )
          )
        )
      )
    )
  );

  deleteJobsite$ = createEffect(() =>
    this.actions$.pipe(
      ofType(JobsitesActions.deleteJobsite),
      switchMap(({ companyId, jobsiteId }) =>
        this.jobsitesApi.deleteJobsite(companyId, jobsiteId).pipe(
          map(() =>
            JobsitesActions.deleteJobsiteSuccess({ jobsiteId, companyId })
          ),
          catchError((error) =>
            of(
              JobsitesActions.deleteJobsiteFailure({
                error: error?.message || 'Failed to delete jobsite'
              })
            )
          )
        )
      )
    )
  );

  reloadAfterDelete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(JobsitesActions.deleteJobsiteSuccess),
      withLatestFrom(this.store.select(selectFilters)),
      map(([{ companyId }, filters]) =>
        JobsitesActions.loadJobsites({
          companyId,
          page: filters.page,
          size: filters.size,
          sort: filters.sort
        })
      )
    )
  );

  updateJobsite$ = createEffect(() =>
    this.actions$.pipe(
      ofType(JobsitesActions.updateJobsite),
      switchMap(({ companyId, jobsiteId, jobsite }) =>
        this.jobsitesApi.updateJobsite(companyId, jobsiteId, jobsite).pipe(
          map((updatedJobsite) =>
            JobsitesActions.updateJobsiteSuccess({ jobsite: updatedJobsite })
          ),
          catchError((error) =>
            of(
              JobsitesActions.updateJobsiteFailure({
                error: error?.message || 'Failed to update jobsite'
              })
            )
          )
        )
      )
    )
  );
}

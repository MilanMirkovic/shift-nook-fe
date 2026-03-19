import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap, filter, withLatestFrom } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

import { SubcontractorsApi } from './subcontractors.api';
import { NotificationService } from '../../shared/services/notification.service';
import { selectSelectedCompanyId } from '../user/user.selectors';
import {
  loadSubcontractors, loadSubcontractorsSuccess, loadSubcontractorsFailure,
  loadSubcontractorDetail, loadSubcontractorDetailSuccess, loadSubcontractorDetailFailure,
  inviteSubcontractor, inviteSubcontractorSuccess, inviteSubcontractorFailure,
  revokeSubcontractor, revokeSubcontractorSuccess, revokeSubcontractorFailure,
  addWorkerToLink, addWorkerToLinkSuccess, addWorkerToLinkFailure,
  removeWorkerFromLink, removeWorkerFromLinkSuccess, removeWorkerFromLinkFailure,
  loadPrincipalCompanies, loadPrincipalCompaniesSuccess, loadPrincipalCompaniesFailure,
  previewSubcontractorInvite, previewSubcontractorInviteSuccess, previewSubcontractorInviteFailure,
  acceptSubcontractorInvite, acceptSubcontractorInviteSuccess, acceptSubcontractorInviteFailure,
  loadWorkerStatuses, loadWorkerStatusesSuccess, loadWorkerStatusesFailure,
} from './subcontractors.actions';

@Injectable()
export class SubcontractorsEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(SubcontractorsApi);
  private readonly notifications = inject(NotificationService);
  private readonly store = inject(Store);

  loadSubcontractors$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadSubcontractors),
      switchMap(({ companyId }) =>
        this.api.listSubcontractors(companyId).pipe(
          map(links => loadSubcontractorsSuccess({ links })),
          catchError(err => of(loadSubcontractorsFailure({ error: this.toMessage(err) })))
        )
      )
    )
  );

  loadSubcontractorDetail$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadSubcontractorDetail),
      switchMap(({ companyId, linkId }) =>
        this.api.getSubcontractorDetail(companyId, linkId).pipe(
          map(detail => loadSubcontractorDetailSuccess({ detail })),
          catchError(err => of(loadSubcontractorDetailFailure({ error: this.toMessage(err) })))
        )
      )
    )
  );

  inviteSubcontractor$ = createEffect(() =>
    this.actions$.pipe(
      ofType(inviteSubcontractor),
      switchMap(({ companyId, request }) =>
        this.api.inviteSubcontractor(companyId, request).pipe(
          map(({ linkId }) => inviteSubcontractorSuccess({ linkId })),
          catchError((err: HttpErrorResponse) => {
            const error = err.status === 400
              ? (err.error?.message ?? 'An invitation has already been sent to this address.')
              : err.status === 403
                ? 'You do not have permission to invite subcontractors.'
                : this.toMessage(err);
            return of(inviteSubcontractorFailure({ error }));
          })
        )
      )
    )
  );

  inviteSubcontractorSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(inviteSubcontractorSuccess),
      tap(() => this.notifications.success('Subcontractor invitation sent.')),
      switchMap(({ linkId: _ }) => of(/* no further dispatch */))
    ), { dispatch: false }
  );

  revokeSubcontractor$ = createEffect(() =>
    this.actions$.pipe(
      ofType(revokeSubcontractor),
      switchMap(({ companyId, linkId }) =>
        this.api.revokeSubcontractor(companyId, linkId).pipe(
          map(() => revokeSubcontractorSuccess({ linkId })),
          catchError(err => of(revokeSubcontractorFailure({ error: this.toMessage(err) })))
        )
      )
    )
  );

  revokeSubcontractorSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(revokeSubcontractorSuccess),
      tap(() => this.notifications.success('Subcontractor access revoked.')),
    ), { dispatch: false }
  );

  addWorker$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addWorkerToLink),
      switchMap(({ ownerCompanyId, subcontractorCompanyId, workerUserId, linkId }) =>
        this.api.addWorker(ownerCompanyId, subcontractorCompanyId, workerUserId).pipe(
          map(() => addWorkerToLinkSuccess({ ownerCompanyId, linkId })),
          catchError((err: HttpErrorResponse) => {
            const error = err.status === 400
              ? (err.error?.message ?? 'Worker cannot be added to this link.')
              : this.toMessage(err);
            return of(addWorkerToLinkFailure({ error }));
          })
        )
      )
    )
  );

  addWorkerSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addWorkerToLinkSuccess),
      tap(() => this.notifications.success('Worker added successfully.')),
      map(({ ownerCompanyId, linkId }) => loadSubcontractorDetail({ companyId: ownerCompanyId, linkId }))
    )
  );

  /** After adding a worker, refresh the worker-statuses list so the available dropdown updates */
  addWorkerSuccessRefreshStatuses$ = createEffect(() =>
    this.actions$.pipe(
      ofType(addWorkerToLinkSuccess),
      withLatestFrom(this.store.select(selectSelectedCompanyId)),
      filter(([, companyId]) => !!companyId),
      map(([, companyId]) => loadWorkerStatuses({ subcontractorCompanyId: companyId! }))
    )
  );

  /** After removing a worker, refresh the worker-statuses list */
  removeWorkerSuccessRefreshStatuses$ = createEffect(() =>
    this.actions$.pipe(
      ofType(removeWorkerFromLinkSuccess),
      withLatestFrom(this.store.select(selectSelectedCompanyId)),
      filter(([, companyId]) => !!companyId),
      map(([, companyId]) => loadWorkerStatuses({ subcontractorCompanyId: companyId! }))
    )
  );

  removeWorker$ = createEffect(() =>
    this.actions$.pipe(
      ofType(removeWorkerFromLink),
      switchMap(({ ownerCompanyId, subcontractorCompanyId, workerUserId }) =>
        this.api.removeWorker(ownerCompanyId, subcontractorCompanyId, workerUserId).pipe(
          map(() => removeWorkerFromLinkSuccess({ workerUserId })),
          catchError(err => of(removeWorkerFromLinkFailure({ error: this.toMessage(err) })))
        )
      )
    )
  );

  removeWorkerSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(removeWorkerFromLinkSuccess),
      tap(() => this.notifications.success('Worker removed.')),
    ), { dispatch: false }
  );

  loadPrincipalCompanies$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadPrincipalCompanies),
      switchMap(({ companyId }) =>
        this.api.listPrincipalCompanies(companyId).pipe(
          map(links => loadPrincipalCompaniesSuccess({ links })),
          catchError(err => of(loadPrincipalCompaniesFailure({ error: this.toMessage(err) })))
        )
      )
    )
  );

  previewInvite$ = createEffect(() =>
    this.actions$.pipe(
      ofType(previewSubcontractorInvite),
      switchMap(({ token }) =>
        this.api.previewInvite(token).pipe(
          map(preview => previewSubcontractorInviteSuccess({ preview })),
          catchError(err => of(previewSubcontractorInviteFailure({ error: this.toMessage(err) })))
        )
      )
    )
  );

  acceptInvite$ = createEffect(() =>
    this.actions$.pipe(
      ofType(acceptSubcontractorInvite),
      switchMap(({ token }) =>
        this.api.acceptInvite(token).pipe(
          map(() => acceptSubcontractorInviteSuccess()),
          catchError((err: HttpErrorResponse) => {
            const error = err.status === 400
              ? (err.error?.message ?? 'This invitation is expired or already accepted.')
              : err.status === 403
                ? 'You must be the owner of a company to accept this invitation.'
                : this.toMessage(err);
            return of(acceptSubcontractorInviteFailure({ error }));
          })
        )
      )
    )
  );

  acceptInviteSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(acceptSubcontractorInviteSuccess),
      tap(() => this.notifications.success('You have successfully joined as a subcontractor.')),
    ), { dispatch: false }
  );

  loadWorkerStatuses$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadWorkerStatuses),
      switchMap(({ subcontractorCompanyId }) =>
        this.api.listMyWorkersWithAssignmentStatus(subcontractorCompanyId).pipe(
          map(workers => loadWorkerStatusesSuccess({ workers })),
          catchError(err => of(loadWorkerStatusesFailure({ error: this.toMessage(err) })))
        )
      )
    )
  );

  private toMessage(err: HttpErrorResponse | any): string {
    return err?.error?.message ?? err?.message ?? 'An unexpected error occurred.';
  }
}

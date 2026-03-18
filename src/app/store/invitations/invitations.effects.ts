import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

import { InvitationsApi } from './invitations.api';
import { NotificationService } from '../../shared/services/notification.service';
import {
  loadInvitations, loadInvitationsSuccess, loadInvitationsFailure,
  sendInvitation, sendInvitationSuccess, sendInvitationFailure,
  revokeInvitation, revokeInvitationSuccess, revokeInvitationFailure,
  previewInvitation, previewInvitationSuccess, previewInvitationFailure,
  acceptInvitation, acceptInvitationSuccess, acceptInvitationFailure,
} from './invitations.actions';

@Injectable()
export class InvitationsEffects {
  private readonly actions$ = inject(Actions);
  private readonly api = inject(InvitationsApi);
  private readonly notifications = inject(NotificationService);

  loadInvitations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadInvitations),
      switchMap(({ companyId }) =>
        this.api.list(companyId).pipe(
          map(items => loadInvitationsSuccess({ items })),
          catchError(err => of(loadInvitationsFailure({ error: this.toMessage(err) })))
        )
      )
    )
  );

  sendInvitation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(sendInvitation),
      switchMap(({ companyId, request }) =>
        this.api.send(companyId, request).pipe(
          map(() => sendInvitationSuccess()),
          catchError((err: HttpErrorResponse) => {
            const error = err.status === 409
              ? 'An invitation has already been sent to this address.'
              : err.status === 403
                ? 'You do not have permission to invite members.'
                : this.toMessage(err);
            return of(sendInvitationFailure({ error }));
          })
        )
      )
    )
  );

  sendInvitationSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(sendInvitationSuccess),
      tap(() => this.notifications.success('Invitation sent successfully.')),
      switchMap(() => of())
    ), { dispatch: false }
  );

  revokeInvitation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(revokeInvitation),
      switchMap(({ companyId, inviteId }) =>
        this.api.revoke(companyId, inviteId).pipe(
          map(() => revokeInvitationSuccess({ inviteId })),
          catchError(err => of(revokeInvitationFailure({ error: this.toMessage(err) })))
        )
      )
    )
  );

  revokeInvitationSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(revokeInvitationSuccess),
      tap(() => this.notifications.success('Invitation revoked.')),
    ), { dispatch: false }
  );

  previewInvitation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(previewInvitation),
      switchMap(({ token }) =>
        this.api.preview(token).pipe(
          map(preview => previewInvitationSuccess({ preview })),
          catchError(err => of(previewInvitationFailure({ error: this.toMessage(err) })))
        )
      )
    )
  );

  acceptInvitation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(acceptInvitation),
      switchMap(({ companyId, token }) =>
        this.api.accept(companyId, token).pipe(
          map(result => acceptInvitationSuccess({ result, companyId })),
          catchError(err => of(acceptInvitationFailure({ error: this.toMessage(err) })))
        )
      )
    )
  );

  acceptInvitationSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(acceptInvitationSuccess),
      map(({ companyId }) => loadInvitations({ companyId }))
    )
  );

  private toMessage(err: HttpErrorResponse | any): string {
    return err?.error?.message ?? err?.message ?? 'An unexpected error occurred.';
  }
}

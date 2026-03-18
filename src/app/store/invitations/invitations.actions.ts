import { createAction, props } from '@ngrx/store';
import { Invitation, InviteRequest, AcceptInviteResponse, InvitationPreview } from './invitations.models';

// ── List pending invitations ──────────────────────────────────────────────────
export const loadInvitations = createAction(
  '[Invitations] Load',
  props<{ companyId: string }>()
);
export const loadInvitationsSuccess = createAction(
  '[Invitations] Load Success',
  props<{ items: Invitation[] }>()
);
export const loadInvitationsFailure = createAction(
  '[Invitations] Load Failure',
  props<{ error: string }>()
);

// ── Send invitation ───────────────────────────────────────────────────────────
export const sendInvitation = createAction(
  '[Invitations] Send',
  props<{ companyId: string; request: InviteRequest }>()
);
export const sendInvitationSuccess = createAction('[Invitations] Send Success');
export const sendInvitationFailure = createAction(
  '[Invitations] Send Failure',
  props<{ error: string }>()
);
export const resetSendState = createAction('[Invitations] Reset Send State');

// ── Revoke invitation ─────────────────────────────────────────────────────────
export const revokeInvitation = createAction(
  '[Invitations] Revoke',
  props<{ companyId: string; inviteId: string }>()
);
export const revokeInvitationSuccess = createAction(
  '[Invitations] Revoke Success',
  props<{ inviteId: string }>()
);
export const revokeInvitationFailure = createAction(
  '[Invitations] Revoke Failure',
  props<{ error: string }>()
);

// ── Preview invitation (public — no auth) ─────────────────────────────────────
export const previewInvitation = createAction(
  '[Invitations] Preview',
  props<{ token: string }>()
);
export const previewInvitationSuccess = createAction(
  '[Invitations] Preview Success',
  props<{ preview: InvitationPreview }>()
);
export const previewInvitationFailure = createAction(
  '[Invitations] Preview Failure',
  props<{ error: string }>()
);

// ── Accept invitation ─────────────────────────────────────────────────────────
export const acceptInvitation = createAction(
  '[Invitations] Accept',
  props<{ companyId: string; token: string }>()
);
export const acceptInvitationSuccess = createAction(
  '[Invitations] Accept Success',
  props<{ result: AcceptInviteResponse }>()
);
export const acceptInvitationFailure = createAction(
  '[Invitations] Accept Failure',
  props<{ error: string }>()
);
export const resetAcceptState = createAction('[Invitations] Reset Accept State');

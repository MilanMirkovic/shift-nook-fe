import { createFeatureSelector, createSelector } from '@ngrx/store';
import { InvitationsState } from './invitations.models';
import { INVITATIONS_FEATURE_KEY } from './invitations.reducer';

export const selectInvitationsState =
  createFeatureSelector<InvitationsState>(INVITATIONS_FEATURE_KEY);

export const selectInvitations = createSelector(selectInvitationsState, s => s.items);
export const selectInvitationsListLoading = createSelector(selectInvitationsState, s => s.listLoading);
export const selectInvitationsListError = createSelector(selectInvitationsState, s => s.listError);

export const selectInvitationsSending = createSelector(selectInvitationsState, s => s.sending);
export const selectInvitationsSendError = createSelector(selectInvitationsState, s => s.sendError);
export const selectInvitationsSendSuccess = createSelector(selectInvitationsState, s => s.sendSuccess);

export const selectInvitationsRevoking = createSelector(selectInvitationsState, s => s.revoking);
export const selectInvitationsRevokeError = createSelector(selectInvitationsState, s => s.revokeError);

export const selectInvitationsPreviewing = createSelector(selectInvitationsState, s => s.previewing);
export const selectInvitationsPreviewResult = createSelector(selectInvitationsState, s => s.previewResult);
export const selectInvitationsPreviewError = createSelector(selectInvitationsState, s => s.previewError);

export const selectInvitationsAccepting = createSelector(selectInvitationsState, s => s.accepting);
export const selectInvitationsAcceptError = createSelector(selectInvitationsState, s => s.acceptError);
export const selectInvitationsAcceptResult = createSelector(selectInvitationsState, s => s.acceptResult);

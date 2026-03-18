import { createReducer, on } from '@ngrx/store';
import { InvitationsState } from './invitations.models';
import {
  loadInvitations, loadInvitationsSuccess, loadInvitationsFailure,
  sendInvitation, sendInvitationSuccess, sendInvitationFailure, resetSendState,
  revokeInvitation, revokeInvitationSuccess, revokeInvitationFailure,
  previewInvitation, previewInvitationSuccess, previewInvitationFailure,
  acceptInvitation, acceptInvitationSuccess, acceptInvitationFailure, resetAcceptState
} from './invitations.actions';

export const INVITATIONS_FEATURE_KEY = 'invitations';

export const initialState: InvitationsState = {
  items: [],
  listLoading: false,
  listError: null,
  sending: false,
  sendError: null,
  sendSuccess: false,
  revoking: false,
  revokeError: null,
  previewing: false,
  previewResult: null,
  previewError: null,
  accepting: false,
  acceptError: null,
  acceptResult: null,
};

export const invitationsReducer = createReducer(
  initialState,

  on(loadInvitations, state => ({ ...state, listLoading: true, listError: null })),
  on(loadInvitationsSuccess, (state, { items }) => ({ ...state, listLoading: false, items })),
  on(loadInvitationsFailure, (state, { error }) => ({ ...state, listLoading: false, listError: error })),

  on(sendInvitation, state => ({ ...state, sending: true, sendError: null, sendSuccess: false })),
  on(sendInvitationSuccess, state => ({ ...state, sending: false, sendSuccess: true })),
  on(sendInvitationFailure, (state, { error }) => ({ ...state, sending: false, sendError: error })),
  on(resetSendState, state => ({ ...state, sending: false, sendError: null, sendSuccess: false })),

  on(revokeInvitation, state => ({ ...state, revoking: true, revokeError: null })),
  on(revokeInvitationSuccess, (state, { inviteId }) => ({
    ...state,
    revoking: false,
    items: state.items.filter(i => i.id !== inviteId),
  })),
  on(revokeInvitationFailure, (state, { error }) => ({ ...state, revoking: false, revokeError: error })),

  on(previewInvitation, state => ({ ...state, previewing: true, previewError: null, previewResult: null })),
  on(previewInvitationSuccess, (state, { preview }) => ({ ...state, previewing: false, previewResult: preview })),
  on(previewInvitationFailure, (state, { error }) => ({ ...state, previewing: false, previewError: error })),

  on(acceptInvitation, state => ({ ...state, accepting: true, acceptError: null, acceptResult: null })),
  on(acceptInvitationSuccess, (state, { result }) => ({ ...state, accepting: false, acceptResult: result })),
  on(acceptInvitationFailure, (state, { error }) => ({ ...state, accepting: false, acceptError: error })),
  on(resetAcceptState, state => ({ ...state, accepting: false, acceptError: null, acceptResult: null })),
);

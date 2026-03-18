import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SubcontractorsState } from './subcontractors.models';
import { SUBCONTRACTORS_FEATURE_KEY } from './subcontractors.reducer';

export const selectSubcontractorsState =
  createFeatureSelector<SubcontractorsState>(SUBCONTRACTORS_FEATURE_KEY);

// Owner — list
export const selectSubcontractorLinks = createSelector(selectSubcontractorsState, s => s.links);
export const selectSubcontractorLinksLoading = createSelector(selectSubcontractorsState, s => s.linksLoading);
export const selectSubcontractorLinksError = createSelector(selectSubcontractorsState, s => s.linksError);

// Owner — detail
export const selectSubcontractorDetail = createSelector(selectSubcontractorsState, s => s.selectedDetail);
export const selectSubcontractorDetailLoading = createSelector(selectSubcontractorsState, s => s.detailLoading);
export const selectSubcontractorDetailError = createSelector(selectSubcontractorsState, s => s.detailError);

// Invite
export const selectSubcontractorInviting = createSelector(selectSubcontractorsState, s => s.inviting);
export const selectSubcontractorInviteError = createSelector(selectSubcontractorsState, s => s.inviteError);
export const selectSubcontractorInviteSuccess = createSelector(selectSubcontractorsState, s => s.inviteSuccess);

// Revoke
export const selectSubcontractorRevoking = createSelector(selectSubcontractorsState, s => s.revoking);
export const selectSubcontractorRevokeError = createSelector(selectSubcontractorsState, s => s.revokeError);

// Add worker
export const selectAddingWorker = createSelector(selectSubcontractorsState, s => s.addingWorker);
export const selectAddWorkerError = createSelector(selectSubcontractorsState, s => s.addWorkerError);

// Remove worker
export const selectRemovingWorker = createSelector(selectSubcontractorsState, s => s.removingWorker);
export const selectRemoveWorkerError = createSelector(selectSubcontractorsState, s => s.removeWorkerError);

// Principal companies
export const selectPrincipalLinks = createSelector(selectSubcontractorsState, s => s.principalLinks);
export const selectPrincipalLinksLoading = createSelector(selectSubcontractorsState, s => s.principalLinksLoading);
export const selectPrincipalLinksError = createSelector(selectSubcontractorsState, s => s.principalLinksError);

// Preview invite
export const selectSubcontractorInvitePreview = createSelector(selectSubcontractorsState, s => s.preview);
export const selectSubcontractorInvitePreviewLoading = createSelector(selectSubcontractorsState, s => s.previewLoading);
export const selectSubcontractorInvitePreviewError = createSelector(selectSubcontractorsState, s => s.previewError);

// Accept invite
export const selectSubcontractorAccepting = createSelector(selectSubcontractorsState, s => s.accepting);
export const selectSubcontractorAcceptError = createSelector(selectSubcontractorsState, s => s.acceptError);
export const selectSubcontractorAcceptSuccess = createSelector(selectSubcontractorsState, s => s.acceptSuccess);


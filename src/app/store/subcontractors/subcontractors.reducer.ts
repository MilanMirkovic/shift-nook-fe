import { createReducer, on } from '@ngrx/store';
import { SubcontractorsState } from './subcontractors.models';
import {
  loadSubcontractors, loadSubcontractorsSuccess, loadSubcontractorsFailure,
  loadSubcontractorDetail, loadSubcontractorDetailSuccess, loadSubcontractorDetailFailure,
  inviteSubcontractor, inviteSubcontractorSuccess, inviteSubcontractorFailure, resetInviteState,
  revokeSubcontractor, revokeSubcontractorSuccess, revokeSubcontractorFailure,
  addWorkerToLink, addWorkerToLinkSuccess, addWorkerToLinkFailure,
  removeWorkerFromLink, removeWorkerFromLinkSuccess, removeWorkerFromLinkFailure,
  loadPrincipalCompanies, loadPrincipalCompaniesSuccess, loadPrincipalCompaniesFailure,
  previewSubcontractorInvite, previewSubcontractorInviteSuccess, previewSubcontractorInviteFailure,
  acceptSubcontractorInvite, acceptSubcontractorInviteSuccess, acceptSubcontractorInviteFailure, resetAcceptInviteState,
} from './subcontractors.actions';

export const SUBCONTRACTORS_FEATURE_KEY = 'subcontractors';

export const initialState: SubcontractorsState = {
  links: [],
  linksLoading: false,
  linksError: null,

  selectedDetail: null,
  detailLoading: false,
  detailError: null,

  inviting: false,
  inviteError: null,
  inviteSuccess: false,

  revoking: false,
  revokeError: null,

  addingWorker: false,
  addWorkerError: null,

  removingWorker: false,
  removeWorkerError: null,

  principalLinks: [],
  principalLinksLoading: false,
  principalLinksError: null,

  preview: null,
  previewLoading: false,
  previewError: null,

  accepting: false,
  acceptError: null,
  acceptSuccess: false,
};

export const subcontractorsReducer = createReducer(
  initialState,

  // Load subcontractors
  on(loadSubcontractors, state => ({ ...state, linksLoading: true, linksError: null })),
  on(loadSubcontractorsSuccess, (state, { links }) => ({ ...state, linksLoading: false, links })),
  on(loadSubcontractorsFailure, (state, { error }) => ({ ...state, linksLoading: false, linksError: error })),

  // Load detail
  on(loadSubcontractorDetail, state => ({ ...state, detailLoading: true, detailError: null, selectedDetail: null })),
  on(loadSubcontractorDetailSuccess, (state, { detail }) => ({ ...state, detailLoading: false, selectedDetail: detail })),
  on(loadSubcontractorDetailFailure, (state, { error }) => ({ ...state, detailLoading: false, detailError: error })),

  // Invite
  on(inviteSubcontractor, state => ({ ...state, inviting: true, inviteError: null, inviteSuccess: false })),
  on(inviteSubcontractorSuccess, state => ({ ...state, inviting: false, inviteSuccess: true })),
  on(inviteSubcontractorFailure, (state, { error }) => ({ ...state, inviting: false, inviteError: error })),
  on(resetInviteState, state => ({ ...state, inviting: false, inviteError: null, inviteSuccess: false })),

  // Revoke
  on(revokeSubcontractor, state => ({ ...state, revoking: true, revokeError: null })),
  on(revokeSubcontractorSuccess, (state, { linkId }) => ({
    ...state,
    revoking: false,
    links: state.links.map(l => l.id === linkId ? { ...l, status: 'REVOKED' as const } : l),
  })),
  on(revokeSubcontractorFailure, (state, { error }) => ({ ...state, revoking: false, revokeError: error })),

  // Add worker
  on(addWorkerToLink, state => ({ ...state, addingWorker: true, addWorkerError: null })),
  on(addWorkerToLinkSuccess, state => ({ ...state, addingWorker: false })),
  on(addWorkerToLinkFailure, (state, { error }) => ({ ...state, addingWorker: false, addWorkerError: error })),

  // Remove worker
  on(removeWorkerFromLink, state => ({ ...state, removingWorker: true, removeWorkerError: null })),
  on(removeWorkerFromLinkSuccess, (state, { workerUserId }) => ({
    ...state,
    removingWorker: false,
    selectedDetail: state.selectedDetail
      ? { ...state.selectedDetail, workers: state.selectedDetail.workers.filter(w => w.userId !== workerUserId) }
      : null,
  })),
  on(removeWorkerFromLinkFailure, (state, { error }) => ({ ...state, removingWorker: false, removeWorkerError: error })),

  // Principal companies
  on(loadPrincipalCompanies, state => ({ ...state, principalLinksLoading: true, principalLinksError: null })),
  on(loadPrincipalCompaniesSuccess, (state, { links }) => ({ ...state, principalLinksLoading: false, principalLinks: links })),
  on(loadPrincipalCompaniesFailure, (state, { error }) => ({ ...state, principalLinksLoading: false, principalLinksError: error })),

  // Preview invite
  on(previewSubcontractorInvite, state => ({ ...state, previewLoading: true, previewError: null, preview: null })),
  on(previewSubcontractorInviteSuccess, (state, { preview }) => ({ ...state, previewLoading: false, preview })),
  on(previewSubcontractorInviteFailure, (state, { error }) => ({ ...state, previewLoading: false, previewError: error })),

  // Accept invite
  on(acceptSubcontractorInvite, state => ({ ...state, accepting: true, acceptError: null, acceptSuccess: false })),
  on(acceptSubcontractorInviteSuccess, state => ({ ...state, accepting: false, acceptSuccess: true })),
  on(acceptSubcontractorInviteFailure, (state, { error }) => ({ ...state, accepting: false, acceptError: error })),
  on(resetAcceptInviteState, state => ({ ...state, accepting: false, acceptError: null, acceptSuccess: false })),
);


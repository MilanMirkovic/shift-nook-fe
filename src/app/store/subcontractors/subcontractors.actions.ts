import { createAction, props } from '@ngrx/store';
import {
  SubcontractorLinkResponse,
  SubcontractorDetailResponse,
  SubcontractorInvitePreviewResponse,
  SubcontractorInviteRequest,
} from './subcontractors.models';

// ── Load subcontractor links (owner view) ─────────────────────────────────────
export const loadSubcontractors = createAction(
  '[Subcontractors] Load',
  props<{ companyId: string }>()
);
export const loadSubcontractorsSuccess = createAction(
  '[Subcontractors] Load Success',
  props<{ links: SubcontractorLinkResponse[] }>()
);
export const loadSubcontractorsFailure = createAction(
  '[Subcontractors] Load Failure',
  props<{ error: string }>()
);

// ── Load subcontractor detail ─────────────────────────────────────────────────
export const loadSubcontractorDetail = createAction(
  '[Subcontractors] Load Detail',
  props<{ companyId: string; linkId: string }>()
);
export const loadSubcontractorDetailSuccess = createAction(
  '[Subcontractors] Load Detail Success',
  props<{ detail: SubcontractorDetailResponse }>()
);
export const loadSubcontractorDetailFailure = createAction(
  '[Subcontractors] Load Detail Failure',
  props<{ error: string }>()
);

// ── Invite subcontractor ──────────────────────────────────────────────────────
export const inviteSubcontractor = createAction(
  '[Subcontractors] Invite',
  props<{ companyId: string; request: SubcontractorInviteRequest }>()
);
export const inviteSubcontractorSuccess = createAction(
  '[Subcontractors] Invite Success',
  props<{ linkId: string }>()
);
export const inviteSubcontractorFailure = createAction(
  '[Subcontractors] Invite Failure',
  props<{ error: string }>()
);
export const resetInviteState = createAction('[Subcontractors] Reset Invite State');

// ── Revoke subcontractor link ─────────────────────────────────────────────────
export const revokeSubcontractor = createAction(
  '[Subcontractors] Revoke',
  props<{ companyId: string; linkId: string }>()
);
export const revokeSubcontractorSuccess = createAction(
  '[Subcontractors] Revoke Success',
  props<{ linkId: string }>()
);
export const revokeSubcontractorFailure = createAction(
  '[Subcontractors] Revoke Failure',
  props<{ error: string }>()
);

// ── Add worker to link ────────────────────────────────────────────────────────
export const addWorkerToLink = createAction(
  '[Subcontractors] Add Worker',
  props<{ ownerCompanyId: string; linkId: string; workerUserId: string }>()
);
export const addWorkerToLinkSuccess = createAction(
  '[Subcontractors] Add Worker Success',
  props<{ ownerCompanyId: string; linkId: string }>()
);
export const addWorkerToLinkFailure = createAction(
  '[Subcontractors] Add Worker Failure',
  props<{ error: string }>()
);

// ── Remove worker from link ───────────────────────────────────────────────────
export const removeWorkerFromLink = createAction(
  '[Subcontractors] Remove Worker',
  props<{ ownerCompanyId: string; linkId: string; workerUserId: string }>()
);
export const removeWorkerFromLinkSuccess = createAction(
  '[Subcontractors] Remove Worker Success',
  props<{ workerUserId: string }>()
);
export const removeWorkerFromLinkFailure = createAction(
  '[Subcontractors] Remove Worker Failure',
  props<{ error: string }>()
);

// ── Load principal companies (subcontractor view) ─────────────────────────────
export const loadPrincipalCompanies = createAction(
  '[Subcontractors] Load Principal Companies',
  props<{ companyId: string }>()
);
export const loadPrincipalCompaniesSuccess = createAction(
  '[Subcontractors] Load Principal Companies Success',
  props<{ links: SubcontractorLinkResponse[] }>()
);
export const loadPrincipalCompaniesFailure = createAction(
  '[Subcontractors] Load Principal Companies Failure',
  props<{ error: string }>()
);

// ── Preview subcontractor invite (public) ─────────────────────────────────────
export const previewSubcontractorInvite = createAction(
  '[Subcontractors] Preview Invite',
  props<{ token: string }>()
);
export const previewSubcontractorInviteSuccess = createAction(
  '[Subcontractors] Preview Invite Success',
  props<{ preview: SubcontractorInvitePreviewResponse }>()
);
export const previewSubcontractorInviteFailure = createAction(
  '[Subcontractors] Preview Invite Failure',
  props<{ error: string }>()
);

// ── Accept subcontractor invite ───────────────────────────────────────────────
export const acceptSubcontractorInvite = createAction(
  '[Subcontractors] Accept Invite',
  props<{ token: string }>()
);
export const acceptSubcontractorInviteSuccess = createAction(
  '[Subcontractors] Accept Invite Success'
);
export const acceptSubcontractorInviteFailure = createAction(
  '[Subcontractors] Accept Invite Failure',
  props<{ error: string }>()
);
export const resetAcceptInviteState = createAction('[Subcontractors] Reset Accept Invite State');


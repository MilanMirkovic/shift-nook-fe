export type SubcontractorLinkStatus = 'PENDING' | 'ACTIVE' | 'REVOKED';

export interface SubcontractorLinkResponse {
  id: string;
  ownerCompanyId: string;
  subcontractorCompanyId: string | null;
  subcontractorCompanyName: string | null;
  invitedEmail: string;
  status: SubcontractorLinkStatus;
  createdAt: string;
  acceptedAt: string | null;
  revokedAt: string | null;
  expiresAt: string;
}

export interface SubcontractorWorker {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'ACCOUNTANT' | 'WORKER' | 'SUBCONTRACTOR';
}

export interface SubcontractorDetailResponse {
  linkId: string;
  subcontractorCompanyId: string | null;
  subcontractorCompanyName: string | null;
  invitedEmail: string;
  workers: SubcontractorWorker[];
}

export interface SubcontractorInvitePreviewResponse {
  linkId: string;
  ownerCompanyId: string;
  ownerCompanyName: string;
  invitedEmail: string;
  acceptorStatus: 'NOT_AUTHENTICATED' | 'NO_COMPANY' | 'READY' | 'ALREADY_LINKED';
}

export interface SubcontractorInviteRequest {
  email: string;
  subcontractorCompanyName?: string;
}

export interface SubcontractorsState {
  /** Owner view — list of subcontractor links */
  links: SubcontractorLinkResponse[];
  linksLoading: boolean;
  linksError: string | null;

  /** Owner view — detail of a single link */
  selectedDetail: SubcontractorDetailResponse | null;
  detailLoading: boolean;
  detailError: string | null;

  /** Inviting a subcontractor */
  inviting: boolean;
  inviteError: string | null;
  inviteSuccess: boolean;

  /** Revoking a link */
  revoking: boolean;
  revokeError: string | null;

  /** Adding a worker to a link */
  addingWorker: boolean;
  addWorkerError: string | null;

  /** Removing a worker from a link */
  removingWorker: boolean;
  removeWorkerError: string | null;

  /** Subcontractor view — principal companies */
  principalLinks: SubcontractorLinkResponse[];
  principalLinksLoading: boolean;
  principalLinksError: string | null;

  /** Accept invite preview (public) */
  preview: SubcontractorInvitePreviewResponse | null;
  previewLoading: boolean;
  previewError: string | null;

  /** Accept invite */
  accepting: boolean;
  acceptError: string | null;
  acceptSuccess: boolean;
}

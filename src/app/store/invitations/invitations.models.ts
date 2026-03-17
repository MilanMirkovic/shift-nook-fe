import { CompanyRole } from '../../shared/models/company-role';

export interface Invitation {
  id: string;
  email: string;
  role: CompanyRole;
  status: 'PENDING' | 'ACCEPTED' | 'REVOKED';
  createdAt: string;
}

export interface InviteRequest {
  email: string;
  role: CompanyRole;
}

export interface AcceptInviteResponse {
  companyId: string;
  membershipCreated: boolean;
}

export interface InvitationPreview {
  companyId: string;
  companyName: string;
  invitedEmail: string;
  role: CompanyRole;
}

export interface InvitationsState {
  /** Pending invitations list */
  items: Invitation[];
  listLoading: boolean;
  listError: string | null;

  /** Sending an invitation */
  sending: boolean;
  sendError: string | null;
  sendSuccess: boolean;

  /** Revoking an invitation */
  revoking: boolean;
  revokeError: string | null;

  /** Previewing an invitation (public, no auth) */
  previewing: boolean;
  previewResult: InvitationPreview | null;
  previewError: string | null;

  /** Accepting an invitation */
  accepting: boolean;
  acceptError: string | null;
  acceptResult: AcceptInviteResponse | null;
}


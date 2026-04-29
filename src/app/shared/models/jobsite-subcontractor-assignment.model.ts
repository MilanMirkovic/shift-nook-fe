/**
 * Represents the assignment of a subcontractor company to a jobsite
 */
export interface JobsiteSubcontractorAssignment {
  id: string;
  jobsiteId: string;
  subcontractorCompanyId: string;
  subcontractorCompanyName: string;
  ownerCompanyId: string;
  subcontractorLinkId: string;
  assignedBy: string;
  assignedByName: string;
  assignedAt: string;
  revokedBy: string | null;
  revokedByName: string | null;
  revokedAt: string | null;
  notes: string | null;
  active: boolean;
}

/**
 * Request payload for assigning a subcontractor to a jobsite
 */
export interface AssignSubcontractorToJobsiteRequest {
  subcontractorCompanyId: string;
  notes?: string;
}

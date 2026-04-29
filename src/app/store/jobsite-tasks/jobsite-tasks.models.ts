export type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'PENDING_REVIEW' | 'COMPLETED' | 'CANCELLED';

export interface JobsiteTask {
  id: string;
  companyId: string;
  jobsiteId: string;
  name: string;
  description?: string;
  status: TaskStatus;
  createdAt: string; // ISO 8601 date string
  assignedToSubcontractorCompanyId?: string; // Subcontractor company assigned to this task
  workDescription?: string; // Work description submitted by worker
  assignedWorkerUserId?: string;
  assignedWorkerName?: string;
  reviewNotes?: string; // Feedback from owner when requesting more work
}

export interface TaskTimesheet {
  id: string;
  workerUserId: string;
  workerName: string;
  checkInTime: string;
  checkOutTime?: string;
  durationMinutes?: number;
  workDescription?: string;
}

export interface TaskReviewDetails {
  task: JobsiteTask;
  timesheets: TaskTimesheet[];
  totalDurationMinutes: number;
}

export interface CreateJobsiteTaskRequest {
  jobsiteId: string;
  name: string;
  description?: string;
  assignedToSubcontractorCompanyId?: string;
}

export interface UpdateJobsiteTaskRequest {
  name?: string;
  description?: string;
  status?: TaskStatus;
  assignedToSubcontractorCompanyId?: string;
  reviewNotes?: string; // Notes from owner when approving/rejecting
}

export interface ApproveTaskRequest {
  approvalNotes?: string;
  markAsCompleted?: boolean;
}

export interface RejectTaskRequest {
  rejectionReason: string;
}

export interface JobsiteTasksState {
  tasks: JobsiteTask[];
  selectedTask: JobsiteTask | null;
  loading: boolean;
  loadingById: boolean;
  creating: boolean;
  updating: boolean;
  error: string | null;
  total: number;
  page: number;
  size: number;
}

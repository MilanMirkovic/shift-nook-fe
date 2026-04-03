export interface Timesheet {
  id: string;
  companyId: string;
  userId?: string; // Keep for backward compatibility
  workerUserId: string; // The actual field from the API
  workerName?: string; // Display name of the worker
  jobsiteId: string;
  jobsiteName?: string;
  jobsiteTaskName?: string;// The jobsite name from the API
  jobsiteTaskId: string;
  checkInTime: string; // ISO 8601 date string
  checkInLat: number;
  checkInLng: number;
  checkInAccuracy: number;
  checkOutTime?: string | null; // ISO 8601 date string
  checkOutLat?: number | null;
  checkOutLng?: number | null;
  checkOutAccuracy?: number | null;
  status?: 'OPEN' | 'CLOSED';
  clientEventId: string;
  createdAt?: string; // ISO 8601 date string
  updatedAt?: string; // ISO 8601 date string
  durationMinutes?: number | null;
}

export interface CreateTimesheetRequest {
  jobsiteId: string;
  /**
   * ID of an existing task to check in against.
   * Mutually exclusive with newTaskName / newTaskDescription.
   */
  jobsiteTaskId?: string;
  /**
   * Name of a new task to create on-the-fly at check-in (max 255 chars).
   * Required when not providing jobsiteTaskId.
   */
  newTaskName?: string;
  /**
   * Optional description for the new task being created inline at check-in (max 2000 chars).
   */
  newTaskDescription?: string;
  checkInTime: string;
  checkInLat: number;
  checkInLng: number;
  checkInAccuracy: number;
  clientEventId: string;
}

export interface UpdateTimesheetRequest {
  status: 'CLOSED';
  checkOutTime: string;
  checkOutLat: number;
  checkOutLng: number;
  checkOutAccuracy: number;
  workDescription?: string;
  lunchtimeDurationMinutes?: number;
  markTaskAsComplete?: boolean;
}

export interface TimesheetState {
  timesheets: Timesheet[];
  selectedTimesheet: Timesheet | null;
  loading: boolean;
  loadingById: boolean;
  creating: boolean;
  updating: boolean;
  error: string | null;
  total: number;
  page: number;
  size: number;
}

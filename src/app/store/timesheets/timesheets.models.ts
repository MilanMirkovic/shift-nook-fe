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
  jobsiteTaskId: string;
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

export interface WorkSession {
  id: string;
  companyId: string;
  companyName: string;
  startTime: string; // ISO 8601
  endTime: string | null;
  durationMinutes: number | null;
  isActive: boolean;
}

export interface StartWorkSessionRequest {
  companyId: string;
}

export interface StopWorkSessionRequest {
  description?: string;
}

export interface WorkSessionStatistics {
  periodStart: string;
  periodEnd: string;
  periodType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  totalMinutes: number;
  byCompany: CompanyWorkTime[];
}

export interface CompanyWorkTime {
  companyId: string;
  companyName: string;
  totalMinutes: number;
  sessionCount: number;
}

export interface WorkSessionsState {
  activeSession: WorkSession | null;
  activeSessionLoading: boolean;
  activeSessionError: string | null;

  statistics: WorkSessionStatistics | null;
  statisticsLoading: boolean;
  statisticsError: string | null;

  // Track elapsed time for UI updates
  elapsedMinutes: number;
}

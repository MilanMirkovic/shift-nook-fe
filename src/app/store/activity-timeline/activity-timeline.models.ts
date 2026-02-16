import { Activity, ActivityTimelineResponse } from '../../shared/models/activity.models';

export interface ActivityTimelineState {
  // Keyed by entityType:entityId (e.g., "JOBSITE_TASK:38ac4ff6-25f0-47b3-b4e1-5da0833b9614")
  activities: Record<string, Activity[]>;
  loading: Record<string, boolean>;
  error: Record<string, string | null>;
  pagination: Record<string, {
    currentPage: number;
    totalItems: number;
    pageSize: number;
    hasMore: boolean;
  }>;
}

export interface LoadActivitiesParams {
  companyId: string;
  entityType: string;
  entityId: string;
  page?: number;
  size?: number;
  type?: string;
  startDate?: string;
  endDate?: string;
  reset?: boolean;
}


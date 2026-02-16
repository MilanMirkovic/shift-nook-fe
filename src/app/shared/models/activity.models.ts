export enum ActivityCategory {
  SUCCESS = 'SUCCESS',
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR'
}

export interface ActivityActor {
  userId: string;
  name: string;
  role: string;
}

export interface Activity {
  id: string;
  type: string;
  category: ActivityCategory;
  timestamp: string;
  actor: ActivityActor;
  title: string;
  description: string;
  metadata: Record<string, any>;
}

export interface ActivityTimelineResponse {
  items: Activity[];
  total: number;
  page: number;
  size: number;
}


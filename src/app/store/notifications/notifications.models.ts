/**
 * Notification type enum
 */
export enum NotificationType {
  TASK_APPROVED = 'TASK_APPROVED',
  TASK_NEEDS_WORK = 'TASK_NEEDS_WORK',
  TASK_SUBMITTED_FOR_REVIEW = 'TASK_SUBMITTED_FOR_REVIEW',
  GENERAL = 'GENERAL'
}

/**
 * Related entity type for navigation
 */
export enum RelatedEntityType {
  JOBSITE_TASK = 'JOBSITE_TASK'
}

/**
 * Notification metadata for additional context
 */
export interface NotificationMetadata {
  jobsiteId?: string;
  workerName?: string;
  workerUserId?: string;
  [key: string]: string | undefined;
}

/**
 * Single notification model
 */
export interface Notification {
  id: string;
  companyId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityType?: RelatedEntityType;
  relatedEntityId?: string;
  metadata?: NotificationMetadata;
  read: boolean;
  createdAt: string;
}

/**
 * Paginated notifications response
 */
export interface NotificationsPageResponse {
  content: Notification[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

/**
 * Unread count response
 */
export interface UnreadCountResponse {
  count: number;
}

/**
 * Notifications state
 */
export interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasMore: boolean;
}

import { ActivityCategory } from '../../../shared/models/activity.models';

export class JobsiteDetailsHelpers {
  static getCategoryClass(category: ActivityCategory): string {
    const categoryClassMap: Record<ActivityCategory, string> = {
      [ActivityCategory.SUCCESS]: 'activity-item--success',
      [ActivityCategory.INFO]: 'activity-item--info',
      [ActivityCategory.WARNING]: 'activity-item--warning',
      [ActivityCategory.ERROR]: 'activity-item--danger'
    };
    return categoryClassMap[category] || 'activity-item--info';
  }

  static getBadgeClass(category: ActivityCategory): string {
    const badgeClassMap: Record<ActivityCategory, string> = {
      [ActivityCategory.SUCCESS]: 'activity-badge--success',
      [ActivityCategory.INFO]: 'activity-badge--info',
      [ActivityCategory.WARNING]: 'activity-badge--warning',
      [ActivityCategory.ERROR]: 'activity-badge--danger'
    };
    return badgeClassMap[category] || 'activity-badge--info';
  }

  static getActivityIcon(type: string): string {
    const iconMap: Record<string, string> = {
      'JOBSITE_CREATED': 'add_location',
      'JOBSITE_UPDATED': 'edit_location',
      'JOBSITE_DELETED': 'location_off',
      'CLIENT_LINKED': 'person_add',
      'WORKER_ASSIGNED': 'person_add',
      'WORKER_REMOVED': 'person_remove',
      'TASK_CREATED': 'task',
      'TASK_COMPLETED': 'task_alt',
      'TASK_DELETED': 'delete',
      'TIMESHEET_CREATED': 'schedule',
      'TIMESHEET_APPROVED': 'check_circle',
      'TIMESHEET_REJECTED': 'cancel',
      'NOTE_ADDED': 'note_add',
      'DOCUMENT_UPLOADED': 'upload_file',
      'STATUS_CHANGED': 'swap_horiz',
      'JOBSITE_TASK_CREATED': 'task'
    };
    return iconMap[type] || 'info';
  }

  static getTaskCategoryClass(status: string): string {
    const statusCategoryMap: Record<string, string> = {
      'OPEN': 'activity-item--warning',
      'IN_PROGRESS': 'activity-item--info',
      'PENDING_REVIEW': 'activity-item--pending',
      'COMPLETED': 'activity-item--success',
      'CANCELLED': 'activity-item--danger'
    };
    return statusCategoryMap[status] || 'activity-item--info';
  }

  static getTaskBadgeClass(status: string): string {
    const statusBadgeMap: Record<string, string> = {
      'OPEN': 'activity-badge--warning',
      'IN_PROGRESS': 'activity-badge--info',
      'PENDING_REVIEW': 'activity-badge--pending',
      'COMPLETED': 'activity-badge--success',
      'CANCELLED': 'activity-badge--danger'
    };
    return statusBadgeMap[status] || 'activity-badge--info';
  }

  static getTaskIcon(status: string): string {
    const statusIconMap: Record<string, string> = {
      'OPEN': 'radio_button_unchecked',
      'IN_PROGRESS': 'pending',
      'PENDING_REVIEW': 'rate_review',
      'COMPLETED': 'check_circle',
      'CANCELLED': 'cancel'
    };
    return statusIconMap[status] || 'task';
  }

  static getStatusLabel(status: string): string {
    const statusLabelMap: Record<string, string> = {
      'OPEN': 'Open',
      'IN_PROGRESS': 'In Progress',
      'PENDING_REVIEW': 'Pending Review',
      'COMPLETED': 'Completed',
      'CANCELLED': 'Cancelled',

    };
    return statusLabelMap[status] || status;
  }
}

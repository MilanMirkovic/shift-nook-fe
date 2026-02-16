import { CompanyMember } from '../../../store/company-members/company-members.models';
import { Timesheet } from '../../../store/timesheets/timesheets.models';
import { ActivityCategory } from '../../../shared/models/activity.models';

/**
 * Helper functions for worker details component
 */
export class WorkerDetailsHelper {
  /**
   * Get worker initials from first and last name
   */
  static getWorkerInitials(worker: CompanyMember | null): string {
    if (!worker) return '??';
    const firstInitial = worker.firstName.charAt(0).toUpperCase();
    const lastInitial = worker.lastName.charAt(0).toUpperCase();
    return `${firstInitial}${lastInitial}`;
  }

  /**
   * Get worker full name
   */
  static getWorkerFullName(worker: CompanyMember | null): string {
    if (!worker) return '';
    return `${worker.firstName} ${worker.lastName}`;
  }

  /**
   * Get role badge CSS class
   */
  static getRoleBadgeColor(worker: CompanyMember | null): string {
    if (!worker) return '';

    switch (worker.role) {
      case 'OWNER':
        return 'role-owner';
      case 'ACCOUNTANT':
        return 'role-accountant';
      case 'WORKER':
        return 'role-worker';
      default:
        return '';
    }
  }

  /**
   * Format role string (capitalize first letter)
   */
  static formatRole(role: string): string {
    return role.charAt(0) + role.slice(1).toLowerCase();
  }

  /**
   * Format timesheet duration
   */
  static formatDuration(timesheet: Timesheet): string {
    if (!timesheet.checkInTime) return 'N/A';

    const checkIn = new Date(timesheet.checkInTime);
    const checkOut = timesheet.checkOutTime ? new Date(timesheet.checkOutTime) : new Date();

    const diffMs = checkOut.getTime() - checkIn.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  }

  /**
   * Check if timesheet is active (not checked out)
   */
  static isActiveTimesheet(timesheet: Timesheet): boolean {
    return !timesheet.checkOutTime;
  }

  /**
   * Get timesheet status CSS class
   */
  static getTimesheetStatusClass(timesheet: Timesheet): string {
    if (!timesheet.checkOutTime) {
      return 'timesheet-status--active';
    }
    return 'timesheet-status--completed';
  }

  /**
   * Get timesheet status label
   */
  static getTimesheetStatusLabel(timesheet: Timesheet): string {
    if (!timesheet.checkOutTime) {
      return 'Active';
    }
    return 'Completed';
  }

  /**
   * Get activity category CSS class
   */
  static getCategoryClass(category: ActivityCategory): string {
    switch (category) {
      case ActivityCategory.SUCCESS:
        return 'activity-item--success';
      case ActivityCategory.INFO:
        return 'activity-item--info';
      case ActivityCategory.WARNING:
        return 'activity-item--warning';
      case ActivityCategory.ERROR:
        return 'activity-item--danger';
      default:
        return 'activity-item--info';
    }
  }

  /**
   * Get activity badge CSS class
   */
  static getBadgeClass(category: ActivityCategory): string {
    switch (category) {
      case ActivityCategory.SUCCESS:
        return 'activity-badge--success';
      case ActivityCategory.INFO:
        return 'activity-badge--info';
      case ActivityCategory.WARNING:
        return 'activity-badge--warning';
      case ActivityCategory.ERROR:
        return 'activity-badge--danger';
      default:
        return 'activity-badge--info';
    }
  }

  /**
   * Get activity icon based on event type
   */
  static getActivityIcon(type: string): string {
    const iconMap: Record<string, string> = {
      'MEMBER_ADDED': 'person_add',
      'MEMBER_UPDATED': 'edit',
      'MEMBER_ROLE_CHANGED': 'admin_panel_settings',
      'MEMBER_REMOVED': 'person_remove',
      'TIMESHEET_CREATED': 'schedule',
      'TIMESHEET_APPROVED': 'check_circle',
      'TIMESHEET_REJECTED': 'cancel',
      'TASK_CREATED': 'task',
      'TASK_COMPLETED': 'task_alt',
      'NOTE_ADDED': 'note_add',
      'DOCUMENT_UPLOADED': 'upload_file',
      'STATUS_CHANGED': 'swap_horiz',
    };
    return iconMap[type] || 'info';
  }
}


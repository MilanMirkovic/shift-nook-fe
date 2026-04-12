import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Activity, ActivityCategory } from '../../../../../shared/models/activity.models';
import { JobsiteDetailsHelpers } from '../../jobsite-details.helpers';

export interface ActivityFilters {
  startDate: Date | null;
  endDate: Date | null;
}

@Component({
  selector: 'app-jobsite-activity',
  standalone: false,
  templateUrl: './jobsite-activity.component.html',
  styleUrls: ['./jobsite-activity.component.scss']
})
export class JobsiteActivityComponent {
  @Input() jobsiteName: string = '';
  @Input() activities: Activity[] = [];
  @Input() activitiesLoading: boolean = false;
  @Input() activitiesError: string | null = null;
  @Input() hasMoreActivities: boolean = false;
  @Input() totalActivities: number = 0;
  @Input() loadingMore: boolean = false;

  @Output() loadMore = new EventEmitter<void>();
  @Output() applyFilters = new EventEmitter<ActivityFilters>();
  @Output() clearFilters = new EventEmitter<void>();

  showFilters = false;
  startDate: Date | null = null;
  endDate: Date | null = null;

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  onApplyFilters(): void {
    this.applyFilters.emit({
      startDate: this.startDate,
      endDate: this.endDate
    });
  }

  onClearFilters(): void {
    this.startDate = null;
    this.endDate = null;
    this.clearFilters.emit();
  }

  onLoadMore(): void {
    this.loadMore.emit();
  }

  getCategoryClass(category: ActivityCategory): string {
    return JobsiteDetailsHelpers.getCategoryClass(category);
  }

  getBadgeClass(category: ActivityCategory): string {
    return JobsiteDetailsHelpers.getBadgeClass(category);
  }

  getActivityIcon(type: string): string {
    return JobsiteDetailsHelpers.getActivityIcon(type);
  }

  trackById(index: number, item: Activity): string {
    return item.id;
  }
}



import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Jobsite } from '../../../../../store/jobsites/jobsites.models';

@Component({
  selector: 'app-jobsite-timesheets',
  standalone: false,
  templateUrl: './jobsite-timesheets.component.html',
  styleUrls: ['./jobsite-timesheets.component.scss']
})
export class JobsiteTimesheetsComponent {
  @Input() jobsite!: Jobsite;
  @Output() createTimesheet = new EventEmitter<void>();

  onCreateTimesheet(): void {
    this.createTimesheet.emit();
  }
}


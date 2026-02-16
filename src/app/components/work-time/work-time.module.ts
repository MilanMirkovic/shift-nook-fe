import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkTimeComponent } from './work-time.component';
import { WorkTimeRoutingModule } from './work-time-routing.module';
import { WorkSessionStatisticsModule } from '../../shared/components/work-session-statistics/work-session-statistics.module';

@NgModule({
  declarations: [
    WorkTimeComponent
  ],
  imports: [
    CommonModule,
    WorkTimeRoutingModule,
    WorkSessionStatisticsModule
  ],
  exports: [
    WorkTimeComponent
  ]
})
export class WorkTimeModule { }

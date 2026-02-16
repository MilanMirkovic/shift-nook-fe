import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkSessionStatisticsComponent } from './work-session-statistics.component';

@NgModule({
  declarations: [
    WorkSessionStatisticsComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    WorkSessionStatisticsComponent
  ]
})
export class WorkSessionStatisticsModule { }

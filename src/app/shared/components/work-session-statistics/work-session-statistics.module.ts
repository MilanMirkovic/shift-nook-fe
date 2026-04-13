import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { WorkSessionStatisticsComponent } from './work-session-statistics.component';

@NgModule({
  declarations: [
    WorkSessionStatisticsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule
  ],
  exports: [
    WorkSessionStatisticsComponent
  ]
})
export class WorkSessionStatisticsModule { }

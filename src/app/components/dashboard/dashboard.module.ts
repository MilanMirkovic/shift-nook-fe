import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { PageLayoutComponent } from '../../layout/page-layout/page-layout.component';

@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    DashboardRoutingModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    PageLayoutComponent
  ]
})
export class DashboardModule {}


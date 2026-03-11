import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { dashboardRoleGuard } from './dashboard-role.guard';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    canActivate: [dashboardRoleGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {}

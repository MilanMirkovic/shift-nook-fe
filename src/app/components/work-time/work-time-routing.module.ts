import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WorkTimeComponent } from './work-time.component';

const routes: Routes = [
  {
    path: '',
    component: WorkTimeComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkTimeRoutingModule {}

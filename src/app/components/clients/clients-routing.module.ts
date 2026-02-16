import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientsComponent } from './clients.component';
import { ClientDetailsComponent } from './client-details/client-details.component';
import {CommonModule} from '@angular/common';

const routes: Routes = [
  {
    path: '',
    component: ClientsComponent
  },
  {
    path: ':id',
    component: ClientDetailsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes), CommonModule],
  exports: [RouterModule]
})
export class ClientsRoutingModule {}

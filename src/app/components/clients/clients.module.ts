import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';

import { ClientsComponent } from './clients.component';
import { ListPageComponent } from '../../layout/list-page/list-page.component';
import {ClientsRoutingModule} from './clients-routing.module';

const routes: Routes = [
  {
    path: '',
    component: ClientsComponent
  },
  {
    path: ':id',
    loadComponent: () => import('./client-details/client-details.component').then(m => m.ClientDetailsComponent)
  }
];

@NgModule({
  declarations: [
    ClientsComponent
  ],
  imports: [
    ClientsRoutingModule,
    CommonModule,
    MatButtonModule,
    MatTableModule,
    ListPageComponent,
    RouterModule.forChild(routes)
  ]
})
export class ClientsModule {}

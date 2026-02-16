import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';

import { WorkersComponent } from './workers.component';
import { WorkerDetailsComponent } from './worker-details/worker-details.component';
import { ListPageComponent } from '../../layout/list-page/list-page.component';

const routes: Routes = [
  {
    path: '',
    component: WorkersComponent
  },
  {
    path: ':id',
    component: WorkerDetailsComponent
  }
];

@NgModule({
  declarations: [
    WorkersComponent,
    WorkerDetailsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatInputModule,
    ListPageComponent,
    RouterModule.forChild(routes)
  ]
})
export class WorkersModule {}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';

import { CompanySelectionComponent } from './company-selection.component';

const routes: Routes = [
  {
    path: '',
    component: CompanySelectionComponent
  }
];

@NgModule({
  declarations: [CompanySelectionComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    RouterModule.forChild(routes)
  ]
})
export class CompanySelectionModule {}

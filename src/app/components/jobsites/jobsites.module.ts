import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';

import { JobsitesComponent } from './jobsites.component';
import { JobsiteDetailsComponent } from './jobsite-details/jobsite-details.component';
import { JobsiteDetailsStateService } from './jobsite-details/jobsite-details-state.service';
import { JobsiteTimesheetsComponent } from './jobsite-details/tabs/jobsite-timesheets/jobsite-timesheets.component';
import { JobsiteTasksComponent } from './jobsite-details/tabs/jobsite-tasks/jobsite-tasks.component';
import { JobsiteInfoComponent } from './jobsite-details/tabs/jobsite-info/jobsite-info.component';
import { JobsiteActivityComponent } from './jobsite-details/tabs/jobsite-activity/jobsite-activity.component';
import { JobsiteInvoicesComponent } from './jobsite-details/tabs/jobsite-invoices/jobsite-invoices.component';
import { ListPageComponent } from '../../layout/list-page/list-page.component';
import { CreateInvoiceFromTimesheetsDialogComponent } from '../../shared/components/create-invoice-from-timesheets-dialog/create-invoice-from-timesheets-dialog.component';

const routes: Routes = [
  {
    path: '',
    component: JobsitesComponent
  },
  {
    path: ':id',
    component: JobsiteDetailsComponent
  }
];

@NgModule({
  declarations: [
    JobsitesComponent,
    JobsiteDetailsComponent,
    JobsiteTimesheetsComponent,
    JobsiteTasksComponent,
    JobsiteInfoComponent,
    JobsiteActivityComponent,
    JobsiteInvoicesComponent,
    CreateInvoiceFromTimesheetsDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatInputModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTableModule,
    ListPageComponent,
    RouterModule.forChild(routes)
  ],
  providers: [JobsiteDetailsStateService]
})
export class JobsitesModule {}

import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { PageLayoutComponent } from '../layout/page-layout/page-layout.component';

@Component({
  selector: 'app-shifts-page',
  standalone: true,
  imports: [PageLayoutComponent, MatButtonModule],
  template: `
    <app-page-layout
      title="Shifts"
      subtitle="Create, edit, and publish schedules."
    >
      <ng-container pageActions>
        <button mat-flat-button color="primary" type="button">New shift</button>
      </ng-container>

      <div class="sn-card">
        <strong>Coming soon</strong>
        <div class="muted">Shift list, filters, and publishing workflow.</div>
      </div>
    </app-page-layout>
  `
})
export class ShiftsPage {}

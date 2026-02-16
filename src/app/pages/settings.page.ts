import { Component } from '@angular/core';
import { PageLayoutComponent } from '../layout/page-layout/page-layout.component';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [PageLayoutComponent],
  template: `
    <app-page-layout
      title="Settings"
      subtitle="Configure locations, rules, and notifications."
    >
      <div class="sn-card">
        <strong>Coming soon</strong>
        <div class="muted">Settings screens will live here.</div>
      </div>
    </app-page-layout>
  `
})
export class SettingsPage {}

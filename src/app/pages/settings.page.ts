import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`
})
export class SettingsPage {}

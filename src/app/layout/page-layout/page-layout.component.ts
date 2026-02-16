import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-page-layout',
  standalone: true,
  templateUrl: './page-layout.component.html',
  styleUrls: ['./page-layout.component.scss']
})
export class PageLayoutComponent {
  @Input({ required: true }) title!: string;
  @Input() subtitle?: string;
  @Input() maxWidth: 'md' | 'lg' | 'xl' = 'lg';
  @Input() padded = true;
}


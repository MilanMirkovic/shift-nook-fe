import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AccountantMetrics } from '../../../store/accountant-team/accountant-team.models';

@Component({
  selector: 'app-accountant-metrics-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './accountant-metrics-card.component.html',
  styleUrls: ['./accountant-metrics-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountantMetricsCardComponent {
  @Input() metrics!: AccountantMetrics;
}

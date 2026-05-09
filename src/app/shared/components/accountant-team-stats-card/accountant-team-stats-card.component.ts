import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AccountantTeamStats } from '../../../store/accountant-team/accountant-team.models';

@Component({
  selector: 'app-accountant-team-stats-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './accountant-team-stats-card.component.html',
  styleUrls: ['./accountant-team-stats-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountantTeamStatsCardComponent {
  @Input() stats: AccountantTeamStats | null = null;
  @Input() loading = false;
}

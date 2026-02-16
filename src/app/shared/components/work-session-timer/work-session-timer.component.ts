import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, interval, takeUntil, map, combineLatest } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CompanyWorkSessionsStoreService } from '../../../store/company-work-sessions/company-work-sessions-store.service';

@Component({
  selector: 'app-work-session-timer',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './work-session-timer.component.html',
  styleUrl: './work-session-timer.component.scss'
})
export class WorkSessionTimerComponent implements OnInit, OnDestroy {
  private readonly workSessionStore = inject(CompanyWorkSessionsStoreService);
  private readonly destroy$ = new Subject<void>();
  private lastMinutes = -1;

  activeSession$ = this.workSessionStore.getActiveSession();
  isWorking$ = this.workSessionStore.isWorkingOnCompany();
  companyName$ = this.workSessionStore.getCurrentWorkingCompanyName();

  // Create a real-time elapsed time observable that updates every second
  elapsedTimeFormatted$ = combineLatest([
    this.activeSession$,
    interval(1000).pipe(takeUntil(this.destroy$))
  ]).pipe(
    map(([session, _]) => {
      if (!session?.isActive) {
        return '0h 0m';
      }

      const start = new Date(session.startTime).getTime();
      const now = new Date().getTime();
      const elapsedSeconds = Math.floor((now - start) / 1000);
      const hours = Math.floor(elapsedSeconds / 3600);
      const minutes = Math.floor((elapsedSeconds % 3600) / 60);

      // Update store only when minutes change (not every second)
      const totalMinutes = Math.floor(elapsedSeconds / 60);
      if (totalMinutes !== this.lastMinutes) {
        this.lastMinutes = totalMinutes;
        this.workSessionStore.updateElapsedTime(totalMinutes);
      }

      return `${hours}h ${minutes}m`;
    })
  );

  ngOnInit(): void {
    // Timer logic is now handled by the elapsedTimeFormatted$ observable
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}

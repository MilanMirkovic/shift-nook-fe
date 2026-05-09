import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, filter } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  selectSelectedAccountant,
  selectSelectedAccountantLoading,
  loadAccountantDetail,
  clearSelectedAccountant,
} from '../../../store/accountant-team';
import { selectSelectedCompanyId } from '../../../store/user/user.selectors';
import { AccountantMetricsCardComponent } from '../../../shared/components/accountant-metrics-card/accountant-metrics-card.component';

@Component({
  selector: 'app-accountant-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    AccountantMetricsCardComponent,
  ],
  templateUrl: './accountant-detail.component.html',
  styleUrls: ['./accountant-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountantDetailComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  readonly accountant$ = this.store.select(selectSelectedAccountant);
  readonly loading$ = this.store.select(selectSelectedAccountantLoading);
  readonly selectedCompanyId$ = this.store.select(selectSelectedCompanyId);

  private userId: string | null = null;
  private companyId: string | null = null;

  ngOnInit(): void {
    // Get userId from route params
    this.userId = this.route.snapshot.paramMap.get('userId');

    if (!this.userId) {
      this.router.navigate(['/my-accountants']);
      return;
    }

    // Get company ID and load accountant details
    this.selectedCompanyId$
      .pipe(
        filter((id): id is string => id !== null),
        takeUntil(this.destroy$)
      )
      .subscribe((companyId) => {
        this.companyId = companyId;

        if (this.userId) {
          this.store.dispatch(
            loadAccountantDetail({
              companyId,
              userId: this.userId,
            })
          );
        }
      });
  }

  ngOnDestroy(): void {
    this.store.dispatch(clearSelectedAccountant());
    this.destroy$.next();
    this.destroy$.complete();
  }

  goBack(): void {
    this.router.navigate(['/my-accountants']);
  }
}

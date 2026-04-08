import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, take, shareReplay, tap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';

import { loadClientById } from '../../../store/clients/clients.actions';
import { selectClientById } from '../../../store/clients/clients.selectors';
import { selectSelectedCompanyId } from '../../../store/user/user.selectors';
import { Client } from '../../../store/clients/clients.models';
import { AsyncPipe, DatePipe, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { ClientEstimatesComponent } from './client-estimates/client-estimates.component';
import { ClientJobsitesComponent } from './client-jobsites/client-jobsites.component';
import { ClientActivityComponent } from './client-activity/client-activity.component';
import { ClientInvoicesComponent } from './client-invoices/client-invoices.component';
import { ClientDetailsInfoComponent } from './client-details-info/client-details-info.component';
import { EditClientDialogComponent, EditClientDialogData } from './edit-client-dialog/edit-client-dialog.component';

@Component({
  selector: 'app-client-details',
  standalone: true,
  templateUrl: './client-details.component.html',
  imports: [
    AsyncPipe,
    DatePipe,
    NgIf,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    RouterLink,
    ClientEstimatesComponent,
    ClientJobsitesComponent,
    ClientActivityComponent,
    ClientInvoicesComponent,
    ClientDetailsInfoComponent,
  ],
  styleUrls: ['./client-details.component.scss']
})
export class ClientDetailsComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private readonly destroy$ = new Subject<void>();

  private readonly clientSubject$ = new BehaviorSubject<Client | null>(null);
  client$: Observable<Client | null> = this.clientSubject$.asObservable();

  protected currentClientId: string | null = null;
  protected currentCompanyId: string | null = null;
  protected selectedTabIndex = 0;

  ngOnInit(): void {
    const clientId = this.route.snapshot.paramMap.get('id');
    if (!clientId) return;

    this.currentClientId = clientId;

    this.store.select(selectClientById(clientId)).pipe(
      filter(client => client !== null),
      tap(client => this.clientSubject$.next(client)),
      shareReplay({ bufferSize: 1, refCount: true })
    ).subscribe();

    this.store
      .select(selectSelectedCompanyId)
      .pipe(
        filter((id): id is string => !!id),
        take(1)
      )
      .subscribe((companyId) => {
        this.currentCompanyId = companyId;
        this.store.dispatch(loadClientById({ companyId, clientId }));
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected getClientInitials(client: Client | null): string {
    if (!client) return 'C';
    const nameParts = client.name.trim().split(' ');
    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    }
    return client.name.substring(0, 2).toUpperCase();
  }

  protected formatPhone(phone: string | undefined): string {
    if (!phone) return 'Not provided';
    return phone;
  }

  protected formatAddress(address: string | undefined): string {
    if (!address) return 'Not provided';
    return address;
  }

  onEditClient(client: Client): void {
    if (!this.currentCompanyId) return;
    this.dialog.open(EditClientDialogComponent, {
      width: '520px',
      maxWidth: '95vw',
      data: { client, companyId: this.currentCompanyId } satisfies EditClientDialogData,
      panelClass: 'sn-dialog',
    });
  }
}

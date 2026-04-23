import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { InvoiceStatus } from '../../../store/invoices/invoices.models';

export interface InvoiceFilter {
  jobsiteId?: string;
  status?: InvoiceStatus;
}

@Injectable()
export class ClientDetailsNavigationService {
  private readonly selectedTabIndexSubject = new BehaviorSubject<number>(0);
  private readonly invoiceFilterSubject = new BehaviorSubject<InvoiceFilter | null>(null);

  selectedTabIndex$ = this.selectedTabIndexSubject.asObservable();
  invoiceFilter$ = this.invoiceFilterSubject.asObservable();

  navigateToInvoicesTab(filter?: InvoiceFilter): void {
    if (filter) {
      this.invoiceFilterSubject.next(filter);
    }
    this.selectedTabIndexSubject.next(0); // Invoices tab is at index 0
  }

  setTabIndex(index: number): void {
    this.selectedTabIndexSubject.next(index);
  }

  clearInvoiceFilter(): void {
    this.invoiceFilterSubject.next(null);
  }
}

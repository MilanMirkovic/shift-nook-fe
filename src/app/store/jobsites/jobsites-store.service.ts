import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import {
  selectJobsites,
  selectSelectedJobsite,
  selectJobsitesLoading,
  selectJobsiteLoadingById,
  selectJobsiteCreating,
  selectJobsitesError,
  selectJobsitesTotal,
  selectJobsitesPage,
  selectJobsitesSize,
  selectJobsiteById
} from './jobsites.selectors';
import {
  loadJobsites,
  loadJobsiteById,
  createJobsite,
  deleteJobsite,
  updateJobsite,
  updatePage,
  clearJobsites
} from './jobsites.actions';
import { Jobsite, CreateJobsiteInput, UpdateJobsiteInput } from './jobsites.models';

@Injectable({ providedIn: 'root' })
export class JobsitesStoreService {
  private readonly store = inject(Store);

  // Observables
  readonly jobsites$ = this.store.select(selectJobsites);
  readonly selectedJobsite$ = this.store.select(selectSelectedJobsite);
  readonly loading$ = this.store.select(selectJobsitesLoading);
  readonly loadingById$ = this.store.select(selectJobsiteLoadingById);
  readonly creating$ = this.store.select(selectJobsiteCreating);
  readonly error$ = this.store.select(selectJobsitesError);
  readonly total$ = this.store.select(selectJobsitesTotal);
  readonly page$ = this.store.select(selectJobsitesPage);
  readonly size$ = this.store.select(selectJobsitesSize);

  /**
   * Load jobsites for a specific company
   */
  loadJobsites(companyId: string, page = 0, size = 20): void {
    this.store.dispatch(loadJobsites({ companyId, page, size }));
  }

  /**
   * Load a single jobsite by ID
   */
  loadJobsiteById(companyId: string, jobsiteId: string): void {
    this.store.dispatch(loadJobsiteById({ companyId, jobsiteId }));
  }

  /**
   * Create a new jobsite
   */
  createJobsite(companyId: string, jobsite: CreateJobsiteInput): void {
    this.store.dispatch(createJobsite({ companyId, jobsite }));
  }

  /**
   * Delete a jobsite
   */
  deleteJobsite(companyId: string, jobsiteId: string): void {
    this.store.dispatch(deleteJobsite({ companyId, jobsiteId }));
  }

  /**
   * Update a jobsite
   */
  updateJobsite(companyId: string, jobsiteId: string, jobsite: UpdateJobsiteInput): void {
    this.store.dispatch(updateJobsite({ companyId, jobsiteId, jobsite }));
  }

  /**
   * Update pagination
   */
  updatePage(page: number, size: number): void {
    this.store.dispatch(updatePage({ page, size }));
  }

  /**
   * Clear jobsites from state
   */
  clearJobsites(): void {
    this.store.dispatch(clearJobsites());
  }

  /**
   * Get a specific jobsite by ID from the list (returns Observable)
   */
  getJobsiteById(id: string): Observable<Jobsite | undefined> {
    return this.store.select(selectJobsiteById(id));
  }

  /**
   * Get all jobsites
   */
  getJobsites(): Observable<Jobsite[]> {
    return this.jobsites$;
  }

  /**
   * Get the currently selected/loaded jobsite
   */
  getSelectedJobsite(): Observable<Jobsite | undefined> {
    return this.selectedJobsite$;
  }
}

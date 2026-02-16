import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, take, map } from 'rxjs/operators';

import { Jobsite } from '../../../store/jobsites/jobsites.models';
import { Client } from '../../../store/clients/clients.models';
import { Activity } from '../../../shared/models/activity.models';
import { JobsiteTask } from '../../../store/jobsite-tasks/jobsite-tasks.models';
import { loadJobsiteById } from '../../../store/jobsites/jobsites.actions';
import { loadJobsiteTasks } from '../../../store/jobsite-tasks/jobsite-tasks.actions';
import { loadActivities } from '../../../store/activity-timeline/activity-timeline.actions';
import { selectJobsiteById } from '../../../store/jobsites/jobsites.selectors';
import { selectClientById } from '../../../store/clients/clients.selectors';
import { selectSelectedCompanyId } from '../../../store/user/user.selectors';
import { selectTasksByJobsiteId, selectJobsiteTasksLoading } from '../../../store/jobsite-tasks/jobsite-tasks.selectors';
import {
  selectActivitiesByKey,
  selectActivitiesLoading,
  selectActivitiesError,
  selectActivitiesPagination
} from '../../../store/activity-timeline/activity-timeline.selectors';

@Injectable()
export class JobsiteDetailsStateService {
  private readonly store = inject(Store);

  getJobsite$(jobsiteId: string): Observable<Jobsite | null> {
    return this.store.select(selectJobsiteById(jobsiteId)).pipe(
      map(jobsite => jobsite ?? null)
    );
  }

  getClient$(clientId: string): Observable<Client | null> {
    return this.store.select(selectClientById(clientId)).pipe(
      map(client => client ?? null)
    );
  }

  getTasks$(jobsiteId: string): Observable<JobsiteTask[]> {
    return this.store.select(selectTasksByJobsiteId(jobsiteId));
  }

  getTasksLoading$(): Observable<boolean> {
    return this.store.select(selectJobsiteTasksLoading);
  }

  getActivities$(activityKey: string): Observable<Activity[]> {
    return this.store.select(selectActivitiesByKey(activityKey));
  }

  getActivitiesLoading$(activityKey: string): Observable<boolean> {
    return this.store.select(selectActivitiesLoading(activityKey));
  }

  getActivitiesError$(activityKey: string): Observable<string | null> {
    return this.store.select(selectActivitiesError(activityKey));
  }

  getActivitiesPagination$(activityKey: string): Observable<any> {
    return this.store.select(selectActivitiesPagination(activityKey));
  }

  getCompanyId$(): Observable<string> {
    return this.store.select(selectSelectedCompanyId).pipe(
      filter((id): id is string => !!id),
      take(1)
    );
  }

  loadJobsiteData(companyId: string, jobsiteId: string): void {
    this.store.dispatch(loadJobsiteById({ companyId, jobsiteId }));
    this.store.dispatch(loadJobsiteTasks({ companyId, jobsiteId }));
    this.store.dispatch(loadActivities({
      companyId,
      entityType: 'JOBSITE_TASK',
      entityId: jobsiteId,
      reset: true
    }));
  }

  loadActivities(params: {
    companyId: string;
    entityType: string;
    entityId: string;
    page?: number;
    reset?: boolean;
    startDate?: string;
    endDate?: string;
  }): void {
    this.store.dispatch(loadActivities(params));
  }
}

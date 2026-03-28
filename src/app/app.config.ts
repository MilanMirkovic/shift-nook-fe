import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth.interceptor';

// Import reducers
import { reducer as userReducer } from './store/user/user.reducer';
import { reducer as timesheetsReducer } from './store/timesheets/timesheets.reducer';
import { reducer as jobsitesReducer } from './store/jobsites/jobsites.reducer';
import { reducer as jobsiteTasksReducer } from './store/jobsite-tasks/jobsite-tasks.reducer';
import {reducer as companyMembersReducer} from './store/company-members/company-members.reducer';
import {reducer as clientsReducer} from './store/clients/clients.reducer';
import {activityTimelineReducer} from './store/activity-timeline/activity-timeline.reducer';
import { companyWorkSessionsReducer } from './store/company-work-sessions/company-work-sessions.reducer';
import { notificationsReducer } from './store/notifications/notifications.reducer';
import { estimatesReducer } from './store/estimates/estimates.reducer';
import { invoicesReducer } from './store/invoices/invoices.reducer';
import { invitationsReducer, INVITATIONS_FEATURE_KEY } from './store/invitations/invitations.reducer';
import { subcontractorsReducer, SUBCONTRACTORS_FEATURE_KEY } from './store/subcontractors/subcontractors.reducer';
import { adminUsersReducer, ADMIN_USERS_FEATURE_KEY } from './store/admin-users/admin-users.reducer';
import { adminCompaniesReducer, ADMIN_COMPANIES_FEATURE_KEY } from './store/admin-companies/admin-companies.reducer';

// Import effects
import { UserEffects } from './store/user/user.effects';
import { TimesheetsEffects } from './store/timesheets/timesheets.effects';
import { JobsitesEffects } from './store/jobsites/jobsites.effects';
import { JobsiteTasksEffects } from './store/jobsite-tasks/jobsite-tasks.effects';
import { CompanyMembersEffects } from './store/company-members/company-members.effects';
import { ClientsEffects } from './store/clients/clients.effects';
import { ActivityTimelineEffects } from './store/activity-timeline/activity-timeline.effects';
import { CompanyWorkSessionsEffects } from './store/company-work-sessions/company-work-sessions.effects';
import { NotificationsEffects } from './store/notifications/notifications.effects';
import { EstimatesEffects } from './store/estimates/estimates.effects';
import { InvoicesEffects } from './store/invoices/invoices.effects';
import { InvitationsEffects } from './store/invitations/invitations.effects';
import { SubcontractorsEffects } from './store/subcontractors/subcontractors.effects';
import { AdminUsersEffects } from './store/admin-users/admin-users.effects';
import { AdminCompaniesEffects } from './store/admin-companies/admin-companies.effects';

// Import feature keys
import { USER_FEATURE_KEY } from './store/user/user.selectors';
import { TIMESHEETS_FEATURE_KEY } from './store/timesheets/timesheets.selectors';
import { JOBSITES_FEATURE_KEY } from './store/jobsites/jobsites.selectors';
import { JOBSITE_TASKS_FEATURE_KEY } from './store/jobsite-tasks/jobsite-tasks.selectors';
import {COMPANY_MEMBERS_FEATURE_KEY} from './store/company-members/company-members.selectors';
import { CLIENTS_FEATURE_KEY } from './store/clients/clients.selectors';
import { ACTIVITY_TIMELINE_FEATURE_KEY } from './store/activity-timeline/activity-timeline.selectors';
import { NOTIFICATIONS_FEATURE_KEY } from './store/notifications/notifications.selectors';
import { ESTIMATES_FEATURE_KEY } from './store/estimates/estimates.selectors';
import { INVOICES_FEATURE_KEY } from './store/invoices/invoices.selectors';

export const COMPANY_WORK_SESSIONS_FEATURE_KEY = 'companyWorkSessions';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimationsAsync(),
    provideStore({
      [USER_FEATURE_KEY]: userReducer,
      [TIMESHEETS_FEATURE_KEY]: timesheetsReducer,
      [JOBSITES_FEATURE_KEY]: jobsitesReducer,
      [JOBSITE_TASKS_FEATURE_KEY]: jobsiteTasksReducer,
      [COMPANY_MEMBERS_FEATURE_KEY] : companyMembersReducer,
      [CLIENTS_FEATURE_KEY]: clientsReducer,
      [ACTIVITY_TIMELINE_FEATURE_KEY]: activityTimelineReducer,
      [COMPANY_WORK_SESSIONS_FEATURE_KEY]: companyWorkSessionsReducer,
      [NOTIFICATIONS_FEATURE_KEY]: notificationsReducer,
      [ESTIMATES_FEATURE_KEY]: estimatesReducer,
      [INVOICES_FEATURE_KEY]: invoicesReducer,
      [INVITATIONS_FEATURE_KEY]: invitationsReducer,
      [SUBCONTRACTORS_FEATURE_KEY]: subcontractorsReducer,
      [ADMIN_USERS_FEATURE_KEY]: adminUsersReducer,
      [ADMIN_COMPANIES_FEATURE_KEY]: adminCompaniesReducer,
    }),
    provideEffects([
      UserEffects,
      TimesheetsEffects,
      JobsitesEffects,
      JobsiteTasksEffects,
      CompanyMembersEffects,
      ClientsEffects,
      ActivityTimelineEffects,
      CompanyWorkSessionsEffects,
      NotificationsEffects,
      EstimatesEffects,
      InvoicesEffects,
      InvitationsEffects,
      SubcontractorsEffects,
      AdminUsersEffects,
      AdminCompaniesEffects,
    ]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: false,
      autoPause: true,
      trace: false,
      traceLimit: 75
    })
  ],
};

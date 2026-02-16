# Activity Timeline - Backend Implementation Guide

## ✅ Status: **IMPLEMENTED & READY**

The Activity Timeline feature has been fully implemented on the backend. This document provides answers to all your questions and usage instructions.

---

## 📋 Backend Response Summary

### ✅ What's Ready:
- **Audit Log Table**: Exists and is indexed for performance
- **API Endpoints**: Created for clients, workers (members), and jobsites
- **Event Types**: Pre-defined enum with 20+ event types and categories
- **Response Format**: Matches our frontend requirements perfectly
- **Performance**: Optimized with database indexes and pagination

### ⚠️ Action Required:
- Backend team needs to **integrate audit logging** into existing services
- Currently, the infrastructure is ready but events aren't being logged yet
- Frontend can proceed with integration - sample data will work until logging is added

---

## 🎯 Available API Endpoints

### **Client Activity Timeline**
```
GET /api/companies/{companyId}/clients/{clientId}/activity
```

### **Worker/Member Activity Timeline**
```
GET /api/companies/{companyId}/members/{userId}/activity
```

### **Jobsite Activity Timeline**
```
GET /api/companies/{companyId}/jobsites/{jobsiteId}/activity
```

**Query Parameters** (all optional):
- `type` - Filter by event type (e.g., "CLIENT_CREATED")
- `startDate` - Filter by start date (ISO 8601 format)
- `endDate` - Filter by end date (ISO 8601 format)
- `page` - Page number (default: 0)
- `size` - Items per page (default: 20)
- `sort` - Sort field (default: createdAt)

---

## 📦 Response Format

```json
{
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "type": "CLIENT_CREATED",
      "category": "SUCCESS",
      "timestamp": "2026-01-14T10:30:00Z",
      "actor": {
        "userId": "660e8400-e29b-41d4-a716-446655440000",
        "name": "John Smith",
        "role": "OWNER"
      },
      "title": "Client Created",
      "description": "John Smith added this client to the system",
      "metadata": {}
    }
  ],
  "total": 45,
  "page": 0,
  "size": 20
}
```

---

## 🎨 Event Categories (for UI Styling)

The backend returns a `category` field that maps to our frontend colors:

- **SUCCESS** (green icons): `CLIENT_CREATED`, `MEMBER_ADDED`, `TASK_COMPLETED`, `TIMESHEET_APPROVED`
- **INFO** (blue icons): `CLIENT_UPDATED`, `MEMBER_UPDATED`, `JOBSITE_LINKED`, `NOTE_ADDED`
- **WARNING** (orange icons): `CLIENT_DELETED`, `MEMBER_REMOVED`, `TIMESHEET_REJECTED`
- **ERROR** (red icons): Reserved for failures and system errors

---

## 🚀 Frontend Integration Steps

### 1. Create TypeScript Models

Create `src/app/shared/models/activity.models.ts`:

```typescript
export enum ActivityCategory {
  SUCCESS = 'SUCCESS',
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR'
}

export interface ActivityActor {
  userId: string;
  name: string;
  role: string;
}

export interface Activity {
  id: string;
  type: string;
  category: ActivityCategory;
  timestamp: string;
  actor: ActivityActor;
  title: string;
  description: string;
  metadata: Record<string, any>;
}

export interface ActivityTimelineResponse {
  items: Activity[];
  total: number;
  page: number;
  size: number;
}
```

### 2. Create API Service

Create `src/app/api/activity-timeline.service.ts`:

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ActivityTimelineResponse } from '../shared/models/activity.models';

@Injectable({
  providedIn: 'root'
})
export class ActivityTimelineService {
  constructor(private http: HttpClient) {}

  getClientActivity(
    companyId: string,
    clientId: string,
    params?: {
      page?: number;
      size?: number;
      type?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Observable<ActivityTimelineResponse> {
    let httpParams = new HttpParams();
    
    if (params?.page !== undefined) httpParams = httpParams.set('page', params.page);
    if (params?.size !== undefined) httpParams = httpParams.set('size', params.size);
    if (params?.type) httpParams = httpParams.set('type', params.type);
    if (params?.startDate) httpParams = httpParams.set('startDate', params.startDate);
    if (params?.endDate) httpParams = httpParams.set('endDate', params.endDate);

    return this.http.get<ActivityTimelineResponse>(
      `/api/companies/${companyId}/clients/${clientId}/activity`,
      { params: httpParams }
    );
  }

  getMemberActivity(
    companyId: string,
    userId: string,
    params?: {
      page?: number;
      size?: number;
      type?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Observable<ActivityTimelineResponse> {
    let httpParams = new HttpParams();
    
    if (params?.page !== undefined) httpParams = httpParams.set('page', params.page);
    if (params?.size !== undefined) httpParams = httpParams.set('size', params.size);
    if (params?.type) httpParams = httpParams.set('type', params.type);
    if (params?.startDate) httpParams = httpParams.set('startDate', params.startDate);
    if (params?.endDate) httpParams = httpParams.set('endDate', params.endDate);

    return this.http.get<ActivityTimelineResponse>(
      `/api/companies/${companyId}/members/${userId}/activity`,
      { params: httpParams }
    );
  }
}
```

### 3. Update Client Details Component

Update `client-details.component.ts` to fetch real data:

```typescript
// Add to imports
import { ActivityTimelineService } from '../../../api/activity-timeline.service';
import { Activity, ActivityCategory } from '../../../shared/models/activity.models';

// Add to component
export class ClientDetailsComponent implements OnInit, OnDestroy {
  // ... existing code ...
  
  private readonly activityService = inject(ActivityTimelineService);
  
  protected activities: Activity[] = [];
  protected activitiesLoading = false;
  protected activitiesError: string | null = null;

  ngOnInit(): void {
    // ... existing code ...
    
    // Load activities when client is loaded
    this.client$.pipe(takeUntil(this.destroy$)).subscribe(client => {
      if (client) {
        this.loadActivities(client.id);
      }
    });
  }

  private loadActivities(clientId: string): void {
    this.store.select(selectSelectedCompanyId)
      .pipe(
        filter(companyId => companyId !== null),
        takeUntil(this.destroy$)
      )
      .subscribe(companyId => {
        if (companyId) {
          this.activitiesLoading = true;
          this.activityService.getClientActivity(companyId, clientId, { size: 50 })
            .subscribe({
              next: (response) => {
                this.activities = response.items;
                this.activitiesLoading = false;
              },
              error: (error) => {
                this.activitiesError = 'Failed to load activity timeline';
                this.activitiesLoading = false;
                console.error('Activity load error:', error);
              }
            });
        }
      });
  }

  protected getCategoryClass(category: ActivityCategory): string {
    switch (category) {
      case ActivityCategory.SUCCESS:
        return 'activity-item--success';
      case ActivityCategory.INFO:
        return 'activity-item--info';
      case ActivityCategory.WARNING:
        return 'activity-item--warning';
      case ActivityCategory.ERROR:
        return 'activity-item--danger';
      default:
        return 'activity-item--info';
    }
  }

  protected getBadgeClass(category: ActivityCategory): string {
    switch (category) {
      case ActivityCategory.SUCCESS:
        return 'activity-badge--success';
      case ActivityCategory.INFO:
        return 'activity-badge--info';
      case ActivityCategory.WARNING:
        return 'activity-badge--warning';
      case ActivityCategory.ERROR:
        return 'activity-badge--danger';
      default:
        return 'activity-badge--info';
    }
  }

  protected getActivityIcon(type: string): string {
    // Map event types to Material icons
    const iconMap: Record<string, string> = {
      'CLIENT_CREATED': 'person_add',
      'CLIENT_UPDATED': 'edit',
      'CLIENT_DELETED': 'delete',
      'JOBSITE_LINKED': 'location_on',
      'NOTE_ADDED': 'note_add',
      'DOCUMENT_UPLOADED': 'upload_file',
      // Add more mappings as needed
    };
    return iconMap[type] || 'info';
  }
}
```

### 4. Update Template to Use Real Data

Update `client-details.component.html` Activity tab:

```html
<mat-tab>
  <ng-template mat-tab-label>
    <mat-icon class="tab-icon">history</mat-icon>
    Activity
  </ng-template>
  <ng-template matTabContent>
    <div class="tab-content">
      <div class="activity-header">
        <h2>Activity Timeline</h2>
        <p class="activity-subtitle">Track all interactions and changes for this client</p>
      </div>

      @if (activitiesLoading) {
        <div class="loading-state">
          <mat-spinner diameter="48"></mat-spinner>
          <p>Loading activity timeline...</p>
        </div>
      } @else if (activitiesError) {
        <div class="empty-state">
          <mat-icon class="empty-state__icon">error</mat-icon>
          <h3 class="empty-state__title">Error Loading Activities</h3>
          <p class="empty-state__description">{{ activitiesError }}</p>
        </div>
      } @else if (activities.length === 0) {
        <div class="empty-state">
          <mat-icon class="empty-state__icon">history</mat-icon>
          <h3 class="empty-state__title">No activity yet</h3>
          <p class="empty-state__description">
            Activity timeline will appear here as you interact with this client
          </p>
        </div>
      } @else {
        <div class="activity-timeline">
          @for (activity of activities; track activity.id) {
            <div class="activity-item" [ngClass]="getCategoryClass(activity.category)">
              <div class="activity-item__icon">
                <mat-icon>{{ getActivityIcon(activity.type) }}</mat-icon>
              </div>
              <div class="activity-item__content">
                <div class="activity-item__header">
                  <h4 class="activity-item__title">{{ activity.title }}</h4>
                  <span class="activity-item__time">
                    {{ activity.timestamp | date:'MMM d, yyyy • h:mm a' }}
                  </span>
                </div>
                <p class="activity-item__description">{{ activity.description }}</p>
                <div class="activity-item__meta">
                  <span class="activity-badge" [ngClass]="getBadgeClass(activity.category)">
                    {{ activity.category }}
                  </span>
                  @if (activity.metadata?.amount) {
                    <span class="activity-amount">{{ activity.metadata.amount | currency }}</span>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  </ng-template>
</mat-tab>
```

---

## 📊 Current Status

### ✅ Backend Ready:
- API endpoints created and tested
- Database schema in place with indexes
- Event type enums defined
- Response format standardized

### ⚠️ Backend TODO:
- Integrate `auditLogService.logActivity()` calls into:
  - Client service (create, update, delete)
  - Member service (add, update, remove, role changes)
  - Jobsite service (create, link, unlink)
  - Timesheet service (create, approve, reject)

### 🎯 Frontend TODO:
1. Create TypeScript models (Activity, ActivityCategory, etc.)
2. Create ActivityTimelineService
3. Update Client Details component to fetch real data
4. Update Worker Details component to fetch real data
5. Test with mock data until backend logging is integrated
6. Add "Load More" pagination button
7. Add date range filters (optional)

---

## 🧪 Testing Plan

### Phase 1: Frontend Integration (Now)
- [ ] Create models and service
- [ ] Update client details to fetch from API
- [ ] Handle loading/error states
- [ ] Test with empty response (no activities yet)

### Phase 2: Backend Integration (Backend Team)
- [ ] Add audit logging to client service
- [ ] Add audit logging to member service
- [ ] Verify events appear in timeline
- [ ] Test metadata is populated correctly

### Phase 3: Polish (After Data Flows)
- [ ] Add pagination ("Load More" button)
- [ ] Add filtering by event type
- [ ] Add date range picker
- [ ] Add relative timestamps ("2 hours ago")
- [ ] Add activity type icons mapping

---

## 💡 Icon Mapping Reference

Map backend event types to Material icons:

```typescript
const ACTIVITY_ICONS: Record<string, string> = {
  // Client events
  'CLIENT_CREATED': 'person_add',
  'CLIENT_UPDATED': 'edit',
  'CLIENT_DELETED': 'delete',
  
  // Member events
  'MEMBER_ADDED': 'person_add',
  'MEMBER_UPDATED': 'edit',
  'MEMBER_ROLE_CHANGED': 'admin_panel_settings',
  'MEMBER_REMOVED': 'person_remove',
  
  // Jobsite events
  'JOBSITE_CREATED': 'add_location',
  'JOBSITE_LINKED': 'location_on',
  'JOBSITE_DELETED': 'location_off',
  
  // Timesheet events
  'TIMESHEET_CREATED': 'schedule',
  'TIMESHEET_APPROVED': 'check_circle',
  'TIMESHEET_REJECTED': 'cancel',
  
  // Other events
  'NOTE_ADDED': 'note_add',
  'DOCUMENT_UPLOADED': 'upload_file',
  'TASK_CREATED': 'task',
  'TASK_COMPLETED': 'task_alt',
  
  // Default
  'default': 'info'
};
```

---

## 📞 Contact

- **Backend Team**: Ready to help with API questions
- **Frontend Team**: Proceed with integration
- **Timeline**: Backend infrastructure is ready NOW, logging integration in progress

---

**Status**: ✅ Ready for Frontend Integration  
**Last Updated**: January 14, 2026  
**Next Review**: After frontend integration complete

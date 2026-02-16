# Company Work Time Tracking - Frontend Implementation Guide

## Overview

This feature automatically tracks the time accountants spend working on different companies. When an accountant selects a company, a timer starts automatically. The system provides real-time tracking and comprehensive statistics.

## Features Implemented

### 1. **Automatic Time Tracking**
- Timer starts automatically when selecting a company
- Switching companies automatically stops the previous timer and starts a new one
- Timer persists across page reloads
- Floating timer widget shows current work session

### 2. **Visual Timer Component**
- Fixed position timer in bottom-right corner
- Shows company name and elapsed time
- Animated pulsing icon
- Stop button to end work session
- Beautiful gradient design

### 3. **Statistics Dashboard**
- Daily, weekly, monthly, and yearly views
- Time breakdown by company
- Percentage visualization with progress bars
- Date navigation controls
- Total hours summary card

### 4. **NgRx State Management**
- Full Redux pattern implementation
- Actions, reducers, effects, and selectors
- Automatic state persistence
- Loading and error states

## File Structure

```
src/app/
├── store/
│   └── company-work-sessions/
│       ├── company-work-sessions.models.ts          # TypeScript interfaces
│       ├── company-work-sessions.api.ts             # API service
│       ├── company-work-sessions.actions.ts         # NgRx actions
│       ├── company-work-sessions.reducer.ts         # NgRx reducer
│       ├── company-work-sessions.selectors.ts       # NgRx selectors
│       ├── company-work-sessions.effects.ts         # NgRx effects
│       └── company-work-sessions-store.service.ts   # Store facade service
├── shared/
│   └── components/
│       ├── work-session-timer/                      # Floating timer widget
│       │   ├── work-session-timer.component.ts
│       │   ├── work-session-timer.component.html
│       │   └── work-session-timer.component.scss
│       └── work-session-statistics/                 # Statistics dashboard
│           ├── work-session-statistics.component.ts
│           ├── work-session-statistics.component.html
│           ├── work-session-statistics.component.scss
│           └── work-session-statistics.module.ts
└── pages/
    ├── work-time.page.ts                            # Work time statistics page
    ├── work-time.module.ts
    └── work-time-routing.module.ts
```

## Usage Guide

### For Developers

#### 1. Starting a Work Session

The work session starts automatically when a company is selected:

```typescript
// In company-selection.component.ts
selectCompany(company: CompanyMembership): void {
  this.userStore.selectCompany(company.companyId);
  this.workSessionStore.startWorkSession(company.companyId); // Automatic tracking
  this.router.navigate(['/dashboard']);
}
```

#### 2. Using the Store Service

```typescript
import { CompanyWorkSessionsStoreService } from '@/store/company-work-sessions/company-work-sessions-store.service';

constructor(private workSessionStore: CompanyWorkSessionsStoreService) {}

// Start work session
this.workSessionStore.startWorkSession(companyId);

// Stop work session
this.workSessionStore.stopWorkSession();

// Get active session
this.workSessionStore.getActiveSession().subscribe(session => {
  if (session) {
    console.log('Working on:', session.companyName);
    console.log('Started at:', session.startTime);
  }
});

// Load statistics
this.workSessionStore.loadDailyStatistics('2026-01-18');
this.workSessionStore.loadMonthlyStatistics(2026, 1);
```

#### 3. Accessing State with Selectors

```typescript
// Check if user is currently working
this.workSessionStore.isWorkingOnCompany().subscribe(isWorking => {
  console.log('Is working:', isWorking);
});

// Get elapsed time (formatted)
this.workSessionStore.getElapsedTimeFormatted().subscribe(time => {
  console.log('Elapsed:', time); // "2h 30m"
});

// Get statistics
this.workSessionStore.getStatistics().subscribe(stats => {
  console.log('Total minutes:', stats?.totalMinutes);
  console.log('Companies:', stats?.byCompany);
});
```

### For Users

#### 1. Starting Work Tracking

1. Navigate to the company selection page
2. Click on a company card
3. Timer automatically starts and appears in bottom-right corner
4. You can now work on that company

#### 2. Switching Companies

1. Select a different company from the company selection
2. Previous timer stops automatically
3. New timer starts for the selected company
4. No manual action needed

#### 3. Stopping Work

1. Click the stop button (⏹) on the timer widget
2. Timer stops and disappears
3. Time is saved to the database

#### 4. Viewing Statistics

1. Navigate to `/work-time` in the application
2. Select period type: Daily, Weekly, Monthly, or Yearly
3. Use navigation arrows to browse different dates
4. View time breakdown by company
5. See total hours worked

## API Integration

### Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/company-work-sessions/start` | POST | Start work session |
| `/api/company-work-sessions/stop` | POST | Stop work session |
| `/api/company-work-sessions/current` | GET | Get active session |
| `/api/company-work-sessions/statistics/daily` | GET | Daily stats |
| `/api/company-work-sessions/statistics/weekly` | GET | Weekly stats |
| `/api/company-work-sessions/statistics/monthly` | GET | Monthly stats |
| `/api/company-work-sessions/statistics/yearly` | GET | Yearly stats |

### Request/Response Examples

**Start Session:**
```typescript
POST /api/company-work-sessions/start
Body: { companyId: "123e4567-e89b-12d3-a456-426614174001" }

Response (201):
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "companyId": "123e4567-e89b-12d3-a456-426614174001",
  "companyName": "ABC Construction",
  "startTime": "2026-01-18T14:30:00Z",
  "endTime": null,
  "durationMinutes": null,
  "isActive": true
}
```

**Get Statistics:**
```typescript
GET /api/company-work-sessions/statistics/daily?date=2026-01-18&timezone=America/New_York

Response (200):
{
  "periodStart": "2026-01-18T00:00:00Z",
  "periodEnd": "2026-01-19T00:00:00Z",
  "periodType": "DAILY",
  "totalMinutes": 480,
  "byCompany": [
    {
      "companyId": "123e4567...",
      "companyName": "ABC Construction",
      "totalMinutes": 300,
      "sessionCount": 3
    }
  ]
}
```

## State Management

### State Shape

```typescript
interface WorkSessionsState {
  activeSession: WorkSession | null;
  activeSessionLoading: boolean;
  activeSessionError: string | null;
  statistics: WorkSessionStatistics | null;
  statisticsLoading: boolean;
  statisticsError: string | null;
  elapsedMinutes: number;
}
```

### Key Actions

- `loadCurrentSession` - Load active session on app init
- `startWorkSession` - Start tracking for a company
- `stopWorkSession` - Stop current tracking
- `updateElapsedTime` - Update timer display
- `loadDailyStatistics` - Load daily stats
- `loadWeeklyStatistics` - Load weekly stats
- `loadMonthlyStatistics` - Load monthly stats
- `loadYearlyStatistics` - Load yearly stats

## Styling

### Timer Widget
- Fixed position: `bottom: 24px; right: 24px`
- Gradient background: `#667eea` to `#764ba2`
- Animated pulse effect on icon
- Slide-in animation on appearance
- Z-index: 1000 (above most content)

### Statistics Dashboard
- Responsive design
- Material Design components
- Progress bars with gradient fills
- Empty states for no data
- Loading spinners

## Testing

### Manual Testing Checklist

- [ ] Start a work session by selecting a company
- [ ] Verify timer appears in bottom-right
- [ ] Refresh page - timer should persist
- [ ] Switch to another company - previous stops, new starts
- [ ] Stop work session - timer disappears
- [ ] Navigate to `/work-time`
- [ ] View daily statistics
- [ ] Navigate between different dates
- [ ] Switch to weekly/monthly/yearly views
- [ ] Verify empty state when no data
- [ ] Check loading states
- [ ] Test error handling (network issues)

### Integration Points

1. **App Initialization** (`app.ts`)
   - Loads current session on startup
   - Restores timer if session active

2. **Company Selection** (`company-selection.component.ts`)
   - Starts work session on company selection
   - Automatic timer start

3. **Global Layout** (`app.html`)
   - Timer widget always visible when active
   - Works across all pages

## Future Enhancements

### Possible Additions

1. **Notifications**
   - Notify when switching companies
   - Daily summary notifications
   - Idle time detection

2. **Reports**
   - Export to CSV/Excel
   - PDF reports
   - Email summaries

3. **Analytics**
   - Charts and graphs
   - Productivity insights
   - Company comparison

4. **Settings**
   - Auto-stop after idle time
   - Working hours preferences
   - Timer appearance customization

5. **Mobile**
   - Optimized mobile timer
   - Swipe gestures
   - Push notifications

## Troubleshooting

### Timer Not Appearing

1. Check browser console for errors
2. Verify active session exists: DevTools > Redux
3. Check if work session store is initialized
4. Verify API connection

### Statistics Not Loading

1. Check network tab for API calls
2. Verify timezone parameter
3. Check date format (YYYY-MM-DD)
4. Ensure backend is running

### Session Not Persisting

1. Check if `loadCurrentSession()` is called in app init
2. Verify Redux store is configured
3. Check effects are registered
4. Verify API endpoint returns 200/204

## Support

For questions or issues:
1. Check the API documentation at `/docs/CLIENT_WORK_TRACKING.md`
2. Review backend implementation
3. Check Redux DevTools for state
4. Enable debug logging in effects

## Version History

- **v1.0.0** (2026-01-18)
  - Initial implementation
  - Basic timer functionality
  - Statistics dashboard
  - NgRx integration
  - Material Design UI


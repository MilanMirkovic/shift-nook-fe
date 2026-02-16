# Company Work Time Tracking - Quick Start Guide

## 🚀 Quick Start

### What Was Implemented

A complete company work time tracking system that automatically tracks how much time accountants spend working on different companies.

### Key Features

✅ **Automatic Timer** - Starts when you select a company  
✅ **Beautiful Timer Widget** - Fixed floating timer in bottom-right corner  
✅ **Statistics Dashboard** - View daily, weekly, monthly, and yearly reports  
✅ **Auto-Switch** - Switching companies automatically stops previous timer  
✅ **Persistent** - Timer survives page reloads  
✅ **NgRx State Management** - Full Redux pattern with actions, reducers, effects

---

## 📁 Files Created

### Store (NgRx State Management)
```
src/app/store/company-work-sessions/
├── company-work-sessions.models.ts           # TypeScript interfaces
├── company-work-sessions.api.ts              # API service for all endpoints
├── company-work-sessions.actions.ts          # NgRx actions
├── company-work-sessions.reducer.ts          # NgRx reducer
├── company-work-sessions.selectors.ts        # NgRx selectors
├── company-work-sessions.effects.ts          # NgRx effects (API calls)
└── company-work-sessions-store.service.ts    # Facade service (easy API)
```

### UI Components
```
src/app/shared/components/
├── work-session-timer/                       # Floating timer widget
│   ├── work-session-timer.component.ts
│   ├── work-session-timer.component.html
│   └── work-session-timer.component.scss
└── work-session-statistics/                  # Statistics dashboard
    ├── work-session-statistics.component.ts
    ├── work-session-statistics.component.html
    ├── work-session-statistics.component.scss
    └── work-session-statistics.module.ts
```

### Pages
```
src/app/pages/
├── work-time.page.ts                         # Statistics page component
├── work-time.module.ts                       # Module for lazy loading
└── work-time-routing.module.ts               # Routes
```

### Configuration Updates
- ✅ `app.config.ts` - Added store and effects
- ✅ `app.ts` - Added timer component and initialization
- ✅ `app.html` - Added timer widget to layout
- ✅ `app.routes.ts` - Added `/work-time` route
- ✅ `sidebar.component.html` - Added "Work Time" navigation link
- ✅ `company-selection.component.ts` - Auto-starts timer on company selection

---

## 🎯 How It Works

### User Flow

1. **User selects a company** → Timer starts automatically
2. **Timer appears** in bottom-right corner showing company name and elapsed time
3. **User switches companies** → Previous timer stops, new timer starts
4. **User clicks stop button** → Timer stops and saves data
5. **User visits `/work-time`** → Views statistics and reports

### Technical Flow

```
Company Selected
    ↓
company-selection.component.ts calls:
    workSessionStore.startWorkSession(companyId)
    ↓
Action Dispatched: startWorkSession
    ↓
Effect: startWorkSession$ calls API
    ↓
Backend: POST /api/company-work-sessions/start
    ↓
Response: WorkSession object
    ↓
Action Dispatched: startWorkSessionSuccess
    ↓
Reducer: Updates state.activeSession
    ↓
Component: Timer widget subscribes to state
    ↓
UI: Timer appears and updates every minute
```

---

## 🔧 API Endpoints Integrated

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/company-work-sessions/start` | POST | Start tracking |
| `/api/company-work-sessions/stop` | POST | Stop tracking |
| `/api/company-work-sessions/current` | GET | Get active session |
| `/api/company-work-sessions/statistics/daily` | GET | Daily stats |
| `/api/company-work-sessions/statistics/weekly` | GET | Weekly stats |
| `/api/company-work-sessions/statistics/monthly` | GET | Monthly stats |
| `/api/company-work-sessions/statistics/yearly` | GET | Yearly stats |

---

## 💻 Usage Examples

### Start Work Session (Automatic)
```typescript
// In company-selection.component.ts
selectCompany(company: CompanyMembership): void {
  this.userStore.selectCompany(company.companyId);
  this.workSessionStore.startWorkSession(company.companyId); // ← Auto-starts
  this.router.navigate(['/dashboard']);
}
```

### Stop Work Session
```typescript
// In timer component
stopWorking(): void {
  this.workSessionStore.stopWorkSession();
}
```

### Check Active Session
```typescript
// In any component
this.workSessionStore.getActiveSession().subscribe(session => {
  if (session) {
    console.log('Working on:', session.companyName);
    console.log('Started:', session.startTime);
  }
});
```

### Load Statistics
```typescript
// Load daily statistics for today
const today = new Date().toISOString().split('T')[0]; // "2026-01-18"
this.workSessionStore.loadDailyStatistics(today);

// Subscribe to statistics
this.workSessionStore.getStatistics().subscribe(stats => {
  console.log('Total minutes:', stats?.totalMinutes);
  console.log('Companies:', stats?.byCompany);
});
```

---

## 🎨 UI Components

### Timer Widget
- **Location**: Fixed bottom-right corner
- **Appearance**: Purple gradient with pulsing icon
- **Shows**: Company name, elapsed time, stop button
- **Behavior**: Slides in when session starts, updates every minute

### Statistics Dashboard
- **Location**: `/work-time` route
- **Features**:
  - Period selector (Daily/Weekly/Monthly/Yearly)
  - Date navigation (previous/next/today)
  - Total hours card with gradient
  - Company breakdown with progress bars
  - Empty states and loading spinners

---

## 🧪 Testing

### Manual Test Checklist

1. **Start Session**
   - [ ] Select a company from company selection page
   - [ ] Verify timer appears in bottom-right
   - [ ] Check timer shows correct company name
   - [ ] Verify timer starts at "0h 0m"

2. **Timer Persistence**
   - [ ] Start a session
   - [ ] Refresh the page
   - [ ] Verify timer is still there with correct time

3. **Switch Companies**
   - [ ] Start session for Company A
   - [ ] Switch to Company B
   - [ ] Verify timer updates to Company B
   - [ ] Check Redux DevTools for state change

4. **Stop Session**
   - [ ] Click stop button on timer
   - [ ] Verify timer disappears
   - [ ] Check network tab for API call

5. **Statistics**
   - [ ] Navigate to "Work Time" in sidebar
   - [ ] View daily statistics
   - [ ] Switch between periods (weekly/monthly/yearly)
   - [ ] Navigate between dates
   - [ ] Verify data displays correctly

---

## 🐛 Debugging

### Check Redux State
1. Open Redux DevTools
2. Look for `companyWorkSessions` state
3. Check `activeSession` for current timer
4. Check `statistics` for loaded data

### Check Network Requests
1. Open Browser DevTools → Network tab
2. Look for calls to `/api/company-work-sessions/*`
3. Verify 200/201 responses
4. Check request/response payloads

### Common Issues

**Timer not appearing?**
- Check if `loadCurrentSession()` is called in `app.ts`
- Verify work session effects are registered
- Check browser console for errors

**Statistics not loading?**
- Verify date format is YYYY-MM-DD
- Check timezone parameter
- Ensure backend is running

**Session not persisting?**
- Check if store is properly configured
- Verify effects are registered
- Check Redux DevTools for state

---

## 📊 State Structure

```typescript
companyWorkSessions: {
  activeSession: {
    id: "550e8400-e29b-41d4-a716-446655440000",
    companyId: "123e4567...",
    companyName: "ABC Construction",
    startTime: "2026-01-18T14:30:00Z",
    endTime: null,
    durationMinutes: null,
    isActive: true
  },
  activeSessionLoading: false,
  activeSessionError: null,
  statistics: { ... },
  statisticsLoading: false,
  statisticsError: null,
  elapsedMinutes: 45
}
```

---

## 🚦 Next Steps

### To Start Using

1. **Run the backend** (ensure API endpoints are available)
2. **Start the frontend**: `npm start`
3. **Login and select a company**
4. **Timer starts automatically** ✨
5. **Navigate to "Work Time"** to view statistics

### Optional Enhancements

- Add notifications when switching companies
- Export statistics to CSV/Excel
- Add charts and graphs
- Implement idle time detection
- Add mobile optimizations

---

## 📚 Documentation

- **Full Implementation Guide**: `WORK_TIME_TRACKING_IMPLEMENTATION.md`
- **Backend API Guide**: See the guide provided in your request
- **Redux Pattern**: All actions/reducers/effects follow standard NgRx patterns

---

## ✅ Summary

You now have a fully functional company work time tracking system with:

- ✅ Automatic timer that starts on company selection
- ✅ Beautiful floating timer widget
- ✅ Comprehensive statistics dashboard
- ✅ Full NgRx state management
- ✅ All 7 API endpoints integrated
- ✅ Navigation link in sidebar
- ✅ Persistent sessions across page reloads

**The system is ready to use!** 🎉


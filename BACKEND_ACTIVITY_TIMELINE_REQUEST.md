# Backend Request: Activity Timeline for Jobsite Tasks

## Issue Summary
The frontend is calling the activity timeline API to fetch task-related activities for a jobsite, but the backend is returning empty results because the current implementation doesn't support querying by metadata fields.

## Current Situation

### What's Working
- Task creation successfully creates audit log entries ✅
- Audit logs are being stored with correct structure ✅
- Frontend is properly sending query parameters ✅

### The Problem
When a jobsite task is created, the audit log entry is stored as:
```
entityType: JOBSITE_TASK
entityId: <taskId>  (e.g., d3870e14-58e0-4e90-835b-12d8b1f989a7)
metadata: {"status": "OPEN", "taskName": "...", "jobsiteId": "38ac4ff6-25f0-47b3-b4e1-5da0833b9614"}
```

The current repository queries by `entityId`, but for task activities, we need to query by the `jobsiteId` stored in the **metadata JSON field**, not the `entityId` (which is the task ID).

## Frontend API Call

The frontend is making this request:
```
GET /api/companies/{companyId}/jobsites/{jobsiteId}/activity?entityType=JOBSITE_TASK&page=0&size=20
```

**Parameters:**
- `companyId`: UUID from path
- `jobsiteId`: UUID from path (this is what we need to search for in metadata)
- `entityType`: "JOBSITE_TASK" (query parameter)
- `page`: 0 (pagination)
- `size`: 20 (pagination)

## Required Backend Changes

### 1. Update Controller to Accept `entityType` Parameter

**File:** `ActivityTimelineController.java`

```java
@GetMapping("/jobsites/{jobsiteId}/activity")
public ActivityTimelineResponse getJobsiteActivity(
        @PathVariable UUID companyId,
        @PathVariable UUID jobsiteId,
        @RequestParam(required = false) String type,
        @RequestParam(required = false) String entityType,  // ADD THIS PARAMETER
        @RequestParam(required = false)
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
        @RequestParam(required = false)
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate,
        @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {

    companyAuthorizationService.requireMembership(companyId);

    // Use entityType from request, default to "JOBSITE" if not provided
    String finalEntityType = (entityType != null) ? entityType : "JOBSITE";

    return activityTimelineService.getActivityTimeline(
            companyId, finalEntityType, jobsiteId, type, startDate, endDate, pageable);
}
```

### 2. Add New Repository Method to Query by Metadata

**File:** `AuditLogRepository.java`

Add this method to query audit logs where the jobsiteId is in the metadata:

```java
/**
 * Find audit logs for JOBSITE_TASK entities by jobsite ID (from metadata)
 * This is used to fetch all task activities for a specific jobsite
 */
@Query(value = """
    SELECT * FROM audit_log
    WHERE company_id = :companyId
      AND entity_type = :entityType
      AND metadata->>'jobsiteId' = cast(:jobsiteId as text)
    ORDER BY created_at DESC
    """, nativeQuery = true)
Page<AuditLog> findByEntityTypeAndMetadataJobsiteId(
        UUID companyId,
        String entityType,
        UUID jobsiteId,
        Pageable pageable);
```

**Optional:** If you need to support action/type filtering and date ranges:

```java
/**
 * Find audit logs for JOBSITE_TASK entities by jobsite ID with action filter
 */
@Query(value = """
    SELECT * FROM audit_log
    WHERE company_id = :companyId
      AND entity_type = :entityType
      AND action = :action
      AND metadata->>'jobsiteId' = cast(:jobsiteId as text)
    ORDER BY created_at DESC
    """, nativeQuery = true)
Page<AuditLog> findByEntityTypeActionAndMetadataJobsiteId(
        UUID companyId,
        String entityType,
        String action,
        UUID jobsiteId,
        Pageable pageable);

/**
 * Find audit logs for JOBSITE_TASK entities by jobsite ID with date range
 */
@Query(value = """
    SELECT * FROM audit_log
    WHERE company_id = :companyId
      AND entity_type = :entityType
      AND metadata->>'jobsiteId' = cast(:jobsiteId as text)
      AND created_at >= :startDate
      AND created_at <= :endDate
    ORDER BY created_at DESC
    """, nativeQuery = true)
Page<AuditLog> findByEntityTypeMetadataJobsiteIdAndDateRange(
        UUID companyId,
        String entityType,
        UUID jobsiteId,
        Instant startDate,
        Instant endDate,
        Pageable pageable);
```

### 3. Update Service Layer to Handle JOBSITE_TASK Entity Type

**File:** `ActivityTimelineService.java`

Update the `getActivityTimeline` method to handle the special case when `entityType` is `JOBSITE_TASK`:

```java
public ActivityTimelineResponse getActivityTimeline(
        UUID companyId,
        String entityType,
        UUID entityId, // When entityType is JOBSITE_TASK, this is actually jobsiteId
        String type,
        Instant startDate,
        Instant endDate,
        Pageable pageable) {
    
    Page<AuditLog> auditLogs;
    
    // Special handling for JOBSITE_TASK - query by metadata jobsiteId
    if ("JOBSITE_TASK".equals(entityType)) {
        // For task activities, the entityId parameter is actually the jobsiteId
        // We need to query by metadata->>'jobsiteId' instead of entityId
        
        if (type != null && startDate != null && endDate != null) {
            // With action and date range filters (if you implemented this method)
            auditLogs = auditLogRepository.findByEntityTypeActionMetadataJobsiteIdAndDateRange(
                companyId, entityType, type, entityId, startDate, endDate, pageable);
        } else if (startDate != null && endDate != null) {
            // With date range filter (if you implemented this method)
            auditLogs = auditLogRepository.findByEntityTypeMetadataJobsiteIdAndDateRange(
                companyId, entityType, entityId, startDate, endDate, pageable);
        } else if (type != null) {
            // With action filter (if you implemented this method)
            auditLogs = auditLogRepository.findByEntityTypeActionAndMetadataJobsiteId(
                companyId, entityType, type, entityId, pageable);
        } else {
            // Basic query - just by entityType and jobsiteId
            auditLogs = auditLogRepository.findByEntityTypeAndMetadataJobsiteId(
                companyId, entityType, entityId, pageable);
        }
    } else {
        // Normal flow for other entity types (JOBSITE, CLIENT, MEMBER, etc.)
        // Query by entityId as usual
        if (type != null && startDate != null && endDate != null) {
            auditLogs = auditLogRepository.findByEntityActionAndDateRange(
                companyId, entityType, entityId, type, startDate, endDate, pageable);
        } else if (startDate != null && endDate != null) {
            auditLogs = auditLogRepository.findByEntityAndDateRange(
                companyId, entityType, entityId, startDate, endDate, pageable);
        } else if (type != null) {
            auditLogs = auditLogRepository.findByEntityAndAction(
                companyId, entityType, entityId, type, pageable);
        } else {
            auditLogs = auditLogRepository.findByEntity(
                companyId, entityType, entityId, pageable);
        }
    }
    
    return mapToActivityTimelineResponse(auditLogs);
}
```

## Expected Result

After implementing these changes:

1. Frontend calls: `GET /api/companies/{companyId}/jobsites/{jobsiteId}/activity?entityType=JOBSITE_TASK`
2. Backend receives `entityType=JOBSITE_TASK` and `jobsiteId` from path
3. Backend queries: `WHERE entityType='JOBSITE_TASK' AND metadata->>'jobsiteId' = jobsiteId`
4. Returns all task activities for that jobsite
5. Frontend displays task creation/update/deletion events in the Activity Timeline tab

## Testing

1. Create a task on a jobsite
2. Go to the jobsite details page → Activity tab
3. After 2 seconds, the task creation event should appear in the timeline
4. The activity should show: "Task Created: {taskName}"

## Example Data Flow

**Audit Log Entry (in database):**
```
id: f0e8a37c-48b0-412e-b6be-2f4fdbcf6bc6
company_id: 6cbfbff1-8fb4-46c3-b3ee-2f4bb9a858ed
user_id: 599bc806-9c05-4aab-8799-a9f56d5faff6
action: JOBSITE_TASK_CREATED
entity_type: JOBSITE_TASK
entity_id: d3870e14-58e0-4e90-835b-12d8b1f989a7 (task ID)
metadata: {"status": "OPEN", "taskName": ".plpl", "jobsiteId": "38ac4ff6-25f0-47b3-b4e1-5da0833b9614"}
created_at: 2026-01-14 22:15:05.886581+00
```

**Frontend Request:**
```
GET /api/companies/6cbfbff1-8fb4-46c3-b3ee-2f4bb9a858ed/jobsites/38ac4ff6-25f0-47b3-b4e1-5da0833b9614/activity?entityType=JOBSITE_TASK
```

**Backend Query (what needs to happen):**
```sql
SELECT * FROM audit_log
WHERE company_id = '6cbfbff1-8fb4-46c3-b3ee-2f4bb9a858ed'
  AND entity_type = 'JOBSITE_TASK'
  AND metadata->>'jobsiteId' = '38ac4ff6-25f0-47b3-b4e1-5da0833b9614'
ORDER BY created_at DESC
```

**Expected Response:**
```json
{
  "items": [
    {
      "id": "f0e8a37c-48b0-412e-b6be-2f4fdbcf6bc6",
      "type": "JOBSITE_TASK_CREATED",
      "category": "SUCCESS",
      "timestamp": "2026-01-14T22:15:05.886581Z",
      "actor": {
        "userId": "599bc806-9c05-4aab-8799-a9f56d5faff6",
        "name": "John Doe",
        "role": "ADMIN"
      },
      "title": "Task Created",
      "description": "Created task: .plpl",
      "metadata": {
        "status": "OPEN",
        "taskName": ".plpl",
        "jobsiteId": "38ac4ff6-25f0-47b3-b4e1-5da0833b9614"
      }
    }
  ],
  "total": 1,
  "page": 0,
  "size": 20
}
```

## Notes

- The key insight is that for `JOBSITE_TASK` entities, we store the related `jobsiteId` in metadata, not as the `entityId`
- The `entityId` field contains the task's own ID, which is correct for task-specific queries
- But when fetching "all activities for a jobsite", we need to query the metadata field
- This pattern may apply to other nested entities in the future (e.g., timesheet entries, shift assignments)

## Questions?

If you have any questions about this implementation or need clarification, please let me know!


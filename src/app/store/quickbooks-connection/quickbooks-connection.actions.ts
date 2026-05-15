import { createAction, props } from '@ngrx/store';
import { QuickBooksConnection } from './quickbooks-connection.models';

// Load connection status
export const loadConnectionStatus = createAction(
  '[QuickBooks Connection] Load Connection Status',
  props<{ companyId: string }>()
);

export const loadConnectionStatusSuccess = createAction(
  '[QuickBooks Connection] Load Connection Status Success',
  props<{ connection: QuickBooksConnection }>()
);

export const loadConnectionStatusFailure = createAction(
  '[QuickBooks Connection] Load Connection Status Failure',
  props<{ error: string }>()
);

export const loadConnectionStatusNotFound = createAction(
  '[QuickBooks Connection] Load Connection Status Not Found'
);

// Get authorization URL and redirect
export const connectToQuickBooks = createAction(
  '[QuickBooks Connection] Connect To QuickBooks',
  props<{ companyId: string }>()
);

export const connectToQuickBooksSuccess = createAction(
  '[QuickBooks Connection] Connect To QuickBooks Success',
  props<{ authUrl: string }>()
);

export const connectToQuickBooksFailure = createAction(
  '[QuickBooks Connection] Connect To QuickBooks Failure',
  props<{ error: string }>()
);

// Disconnect
export const disconnectQuickBooks = createAction(
  '[QuickBooks Connection] Disconnect QuickBooks',
  props<{ companyId: string }>()
);

export const disconnectQuickBooksSuccess = createAction(
  '[QuickBooks Connection] Disconnect QuickBooks Success'
);

export const disconnectQuickBooksFailure = createAction(
  '[QuickBooks Connection] Disconnect QuickBooks Failure',
  props<{ error: string }>()
);

// Clear error
export const clearError = createAction(
  '[QuickBooks Connection] Clear Error'
);

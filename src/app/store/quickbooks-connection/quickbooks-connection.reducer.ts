import { createReducer, on } from '@ngrx/store';
import * as QuickBooksConnectionActions from './quickbooks-connection.actions';
import { QuickBooksConnectionState } from './quickbooks-connection.models';

export const initialState: QuickBooksConnectionState = {
  connection: null,
  loading: false,
  connecting: false,
  disconnecting: false,
  error: null,
};

export const quickbooksConnectionReducer = createReducer(
  initialState,

  // Load connection status
  on(QuickBooksConnectionActions.loadConnectionStatus, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(QuickBooksConnectionActions.loadConnectionStatusSuccess, (state, { connection }) => ({
    ...state,
    connection,
    loading: false,
    error: null,
  })),

  on(QuickBooksConnectionActions.loadConnectionStatusNotFound, (state) => ({
    ...state,
    connection: null,
    loading: false,
    error: null,
  })),

  on(QuickBooksConnectionActions.loadConnectionStatusFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Connect to QuickBooks
  on(QuickBooksConnectionActions.connectToQuickBooks, (state) => ({
    ...state,
    connecting: true,
    error: null,
  })),

  on(QuickBooksConnectionActions.connectToQuickBooksSuccess, (state) => ({
    ...state,
    connecting: false,
  })),

  on(QuickBooksConnectionActions.connectToQuickBooksFailure, (state, { error }) => ({
    ...state,
    connecting: false,
    error,
  })),

  // Disconnect
  on(QuickBooksConnectionActions.disconnectQuickBooks, (state) => ({
    ...state,
    disconnecting: true,
    error: null,
  })),

  on(QuickBooksConnectionActions.disconnectQuickBooksSuccess, (state) => ({
    ...state,
    connection: null,
    disconnecting: false,
  })),

  on(QuickBooksConnectionActions.disconnectQuickBooksFailure, (state, { error }) => ({
    ...state,
    disconnecting: false,
    error,
  })),

  // Clear error
  on(QuickBooksConnectionActions.clearError, (state) => ({
    ...state,
    error: null,
  }))
);

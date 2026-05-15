import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QuickBooksConnectionState, QUICKBOOKS_CONNECTION_FEATURE_KEY } from './quickbooks-connection.models';

export const selectQuickBooksConnectionState = createFeatureSelector<QuickBooksConnectionState>(
  QUICKBOOKS_CONNECTION_FEATURE_KEY
);

export const selectConnection = createSelector(
  selectQuickBooksConnectionState,
  (state) => state.connection
);

export const selectIsConnected = createSelector(
  selectConnection,
  (connection) => connection?.isConnected ?? false
);

export const selectLoading = createSelector(
  selectQuickBooksConnectionState,
  (state) => state.loading
);

export const selectConnecting = createSelector(
  selectQuickBooksConnectionState,
  (state) => state.connecting
);

export const selectDisconnecting = createSelector(
  selectQuickBooksConnectionState,
  (state) => state.disconnecting
);

export const selectError = createSelector(
  selectQuickBooksConnectionState,
  (state) => state.error
);

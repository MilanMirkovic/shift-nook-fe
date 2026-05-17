export interface QuickBooksConnection {
  id: string;
  companyId: string;
  realmId: string;
  environment: string;
  connected: boolean;
  connectedAt: string;
  lastTokenRefreshAt: string;
  tokenExpiresAt: string;
  tokenExpiringSoon: boolean;
}

export interface QuickBooksConnectionState {
  connection: QuickBooksConnection | null;
  loading: boolean;
  connecting: boolean;
  disconnecting: boolean;
  error: string | null;
}

export const QUICKBOOKS_CONNECTION_FEATURE_KEY = 'quickbooksConnection';

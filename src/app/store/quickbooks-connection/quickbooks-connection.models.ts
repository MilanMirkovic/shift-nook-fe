export interface QuickBooksConnection {
  companyId: string;
  realmId: string;
  connectedAt: string;
  isConnected: boolean;
}

export interface QuickBooksConnectionState {
  connection: QuickBooksConnection | null;
  loading: boolean;
  connecting: boolean;
  disconnecting: boolean;
  error: string | null;
}

export const QUICKBOOKS_CONNECTION_FEATURE_KEY = 'quickbooksConnection';

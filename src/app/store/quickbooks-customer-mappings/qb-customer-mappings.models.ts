export interface QuickBooksCustomer {
  id: string;
  displayName: string;
  companyName?: string;
  givenName?: string;
  familyName?: string;
  primaryEmailAddr?: {
    address: string;
  };
  active: boolean;
}

export interface QuickBooksCustomerMapping {
  id: string;
  companyId: string;
  clientId: string;
  quickbooksCustomerId: string;
  quickbooksCustomerName: string;
  quickbooksDisplayName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMappingRequest {
  clientId: string;
  quickbooksCustomerId: string;
  quickbooksCustomerName: string;
  quickbooksDisplayName?: string;
}

export interface QuickBooksCustomerMappingsState {
  // QuickBooks customers (from QB API)
  quickbooksCustomers: QuickBooksCustomer[];
  quickbooksCustomersLoading: boolean;
  quickbooksCustomersLoaded: boolean;

  // Mappings (ShiftNook Client -> QB Customer)
  mappings: QuickBooksCustomerMapping[];
  mappingsLoading: boolean;
  mappingsLoaded: boolean;

  // UI state
  creatingMapping: boolean;
  deletingMapping: boolean;

  error: string | null;
}

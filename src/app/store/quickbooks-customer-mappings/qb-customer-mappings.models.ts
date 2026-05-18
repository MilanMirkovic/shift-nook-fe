export interface QuickBooksCustomer {
  Id: string;
  DisplayName: string;
  CompanyName?: string;
  GivenName?: string;
  FamilyName?: string;
  PrimaryEmailAddr?: {
    Address: string;
  };
  Active: boolean;
  readableName?: string; // Computed field from backend
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

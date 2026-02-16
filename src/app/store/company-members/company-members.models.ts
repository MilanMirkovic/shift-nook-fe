import {CompanyRole} from '../../shared/models/company-role';


  export interface CompanyMember {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    role: CompanyRole;
  }

  export interface CompanyMembersState {
    items: CompanyMember[];
    total: number;

    page: number;
    size: number;

    filters: {
      role: CompanyRole | null;
      q: string | null;
    };

    loading: boolean;
    error: string | null;

    // Single member detail
    selectedMember: CompanyMember | null;
    selectedMemberLoading: boolean;
    selectedMemberError: string | null;
  }

  export interface PagedResponse<T> {
    items: T[];
    total: number;
    page: number;
    size: number;
  }

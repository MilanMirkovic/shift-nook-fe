import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CompanyMembersState } from './company-members.models';
import { CompanyRole } from '../../shared/models/company-role';

export const COMPANY_MEMBERS_FEATURE_KEY = 'companyMembers';

export const selectCompanyMembersState =
  createFeatureSelector<CompanyMembersState>(COMPANY_MEMBERS_FEATURE_KEY);

export const selectMembers =
  createSelector(selectCompanyMembersState, s => s.items);

export const selectMembersFilteredByRole =
  createSelector(
    selectCompanyMembersState,
    s => {
      // If a role filter is set, apply client-side filtering as a fallback
      if (s.filters.role) {
        return s.items.filter(member => member.role === s.filters.role);
      }
      return s.items;
    }
  );

export const selectTotal =
  createSelector(selectCompanyMembersState, s => s.total);

export const selectPage =
  createSelector(selectCompanyMembersState, s => s.page);

export const selectSize =
  createSelector(selectCompanyMembersState, s => s.size);

export const selectFilters =
  createSelector(selectCompanyMembersState, s => s.filters);

export const selectLoading =
  createSelector(selectCompanyMembersState, s => s.loading);

export const selectLoaded =
  createSelector(selectCompanyMembersState, s => s.loaded);

export const selectError =
  createSelector(selectCompanyMembersState, s => s.error);

// Selected member selectors
export const selectSelectedMember =
  createSelector(selectCompanyMembersState, s => s.selectedMember);

export const selectSelectedMemberLoading =
  createSelector(selectCompanyMembersState, s => s.selectedMemberLoading);

export const selectSelectedMemberError =
  createSelector(selectCompanyMembersState, s => s.selectedMemberError);

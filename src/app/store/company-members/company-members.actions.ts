import { createAction, props } from '@ngrx/store';
import { CompanyRole } from '../../shared/models/company-role';
import { CompanyMember, PagedResponse } from './company-members.models';

/**
 * Load members (triggered on:
 * - initial page load
 * - filter change
 * - pagination change
 */
export const loadMembers = createAction(
  '[Company Members] Load',
  props<{
    companyId: string;
    page: number;
    size: number;
    role: CompanyRole | null;
    q: string | null;
  }>()
);

/**
 * Load success
 */
export const loadMembersSuccess = createAction(
  '[Company Members] Load Success',
  props<{ response: PagedResponse<CompanyMember> }>()
);

/**
 * Load failure
 */
export const loadMembersFailure = createAction(
  '[Company Members] Load Failure',
  props<{ error: string }>()
);

/**
 * Update filters (does NOT call API by itself)
 */
export const updateFilters = createAction(
  '[Company Members] Update Filters',
  props<{
    role: CompanyRole | null;
    q: string | null;
  }>()
);

/**
 * Update pagination (does NOT call API by itself)
 */
export const updatePage = createAction(
  '[Company Members] Update Page',
  props<{
    page: number;
    size: number;
  }>()
);

/**
 * Load single member by ID
 */
export const loadMemberById = createAction(
  '[Company Members] Load Member By ID',
  props<{
    companyId: string;
    userId: string;
  }>()
);

/**
 * Load single member success
 */
export const loadMemberByIdSuccess = createAction(
  '[Company Members] Load Member By ID Success',
  props<{ member: CompanyMember }>()
);

/**
 * Load single member failure
 */
export const loadMemberByIdFailure = createAction(
  '[Company Members] Load Member By ID Failure',
  props<{ error: string }>()
);

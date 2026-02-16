import { createAction, props } from '@ngrx/store';
import { User } from './user.models';

/**
 * Load current user profile from /api/me
 */
export const loadUser = createAction('[User] Load');

/**
 * Load user success
 */
export const loadUserSuccess = createAction(
  '[User] Load Success',
  props<{ user: User }>()
);

/**
 * Load user failure
 */
export const loadUserFailure = createAction(
  '[User] Load Failure',
  props<{ error: string }>()
);

/**
 * Clear user (logout)
 */
export const clearUser = createAction('[User] Clear');

/**
 * Select a company for the current session
 */
export const selectCompany = createAction(
  '[User] Select Company',
  props<{ companyId: string }>()
);

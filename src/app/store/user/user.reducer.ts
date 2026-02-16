import { createReducer, on } from '@ngrx/store';
import { UserState } from './user.models';
import {
  loadUser,
  loadUserSuccess,
  loadUserFailure,
  clearUser,
  selectCompany
} from './user.actions';

export const initialState: UserState = {
  user: null,
  selectedCompanyId: null,
  loading: false,
  error: null
};

export const reducer = createReducer(
  initialState,

  on(loadUser, state => ({
    ...state,
    loading: true,
    error: null
  })),

  on(loadUserSuccess, (state, { user }) => ({
    ...state,
    user,
    loading: false,
    error: null,
    // Auto-select first company if user has only one
    selectedCompanyId: user.companies?.length === 1 ? user.companies[0].companyId : state.selectedCompanyId
  })),

  on(loadUserFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(clearUser, () => initialState),

  on(selectCompany, (state, { companyId }) => ({
    ...state,
    selectedCompanyId: companyId
  }))
);

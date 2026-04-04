import { createReducer, on } from '@ngrx/store';
import { UserState } from './user.models';
import {
  loadUser,
  loadUserSuccess,
  loadUserFailure,
  clearUser,
  selectCompany
} from './user.actions';

const SELECTED_COMPANY_KEY = 'selectedCompanyId';

function getPersistedCompanyId(): string | null {
  try {
    return localStorage.getItem(SELECTED_COMPANY_KEY);
  } catch {
    return null;
  }
}

function persistCompanyId(companyId: string | null): void {
  try {
    if (companyId) {
      localStorage.setItem(SELECTED_COMPANY_KEY, companyId);
    } else {
      localStorage.removeItem(SELECTED_COMPANY_KEY);
    }
  } catch {
    // ignore
  }
}

export const initialState: UserState = {
  user: null,
  selectedCompanyId: getPersistedCompanyId(),
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

  on(loadUserSuccess, (state, { user }) => {
    const companies = user.companies ?? [];

    // Keep persisted selection if it's still valid for this user
    const persistedId = state.selectedCompanyId;
    const persistedStillValid = persistedId && companies.some(c => c.companyId === persistedId);

    const selectedCompanyId = persistedStillValid
      ? persistedId
      : companies.length === 1
        ? companies[0].companyId
        : null;

    persistCompanyId(selectedCompanyId);

    return {
      ...state,
      user,
      loading: false,
      error: null,
      selectedCompanyId
    };
  }),

  on(loadUserFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(clearUser, () => {
    persistCompanyId(null);
    return initialState;
  }),

  on(selectCompany, (state, { companyId }) => {
    persistCompanyId(companyId);
    return {
      ...state,
      selectedCompanyId: companyId
    };
  })
);

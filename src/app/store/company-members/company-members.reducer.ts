import { createReducer, on } from '@ngrx/store';
import { CompanyMembersState } from './company-members.models';
import {
  loadMembers,
  loadMembersSuccess,
  loadMembersFailure,
  updateFilters,
  updatePage,
  loadMemberById,
  loadMemberByIdSuccess,
  loadMemberByIdFailure,
  removeMember,
  removeMemberSuccess,
  removeMemberFailure
} from './company-members.actions';

export const initialState: CompanyMembersState = {
  items: [],
  total: 0,

  page: 0,
  size: 20,

  filters: {
    role: null,
    q: null
  },

  loading: false,
  error: null,

  selectedMember: null,
  selectedMemberLoading: false,
  selectedMemberError: null
};

export const reducer = createReducer(
  initialState,

  on(loadMembers, state => ({
    ...state,
    items: [],              // clear table while loading
    loading: true,
    error: null
  })),

  on(loadMembersSuccess, (state, { response }) => ({
    ...state,
    items: response.items,
    total: response.total,
    page: response.page,
    size: response.size,
    loading: false,
    error: null             // clear previous error on success
  })),

  on(loadMembersFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(updateFilters, (state, { role, q }) => ({
    ...state,
    filters: { role, q },
    page: 0                 // reset page on filter change
  })),

  on(updatePage, (state, { page, size }) => ({
    ...state,
    page,
    size
  })),

  // Load single member by ID
  on(loadMemberById, state => ({
    ...state,
    selectedMemberLoading: true,
    selectedMemberError: null
  })),

  on(loadMemberByIdSuccess, (state, { member }) => ({
    ...state,
    selectedMember: member,
    selectedMemberLoading: false,
    selectedMemberError: null
  })),

  on(loadMemberByIdFailure, (state, { error }) => ({
    ...state,
    selectedMemberLoading: false,
    selectedMemberError: error
  })),

  // Remove member
  on(removeMember, state => ({
    ...state,
    loading: true,
    error: null
  })),

  on(removeMemberSuccess, (state, { userId }) => ({
    ...state,
    items: state.items.filter(m => m.userId !== userId),
    total: state.total - 1,
    loading: false,
    error: null
  })),

  on(removeMemberFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
);

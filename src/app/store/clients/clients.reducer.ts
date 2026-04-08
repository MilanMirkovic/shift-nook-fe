import { createReducer, on } from '@ngrx/store';
import {
  loadClients,
  loadClientsSuccess,
  loadClientsFailure,
  updatePage,
  createClientSuccess,
  createClient,
  createClientFailure,
  loadClientById,
  loadClientByIdSuccess,
  loadClientByIdFailure,
  updateClient,
  updateClientSuccess,
  updateClientFailure,
} from './clients.actions';

import { ClientsState } from './clients.models';

export const initialState: ClientsState = {
  items: [],
  total: 0,

  page: 0,
  size: 20,

  loading: false,
  error: null
};

export const reducer = createReducer(
  initialState,

  on(loadClients, (state) => ({
    ...state,
    items: [],
    loading: true,
    error: null
  })),

  on(loadClientsSuccess, (state, { response }) => ({
    ...state,
    items: response.items,
    total: response.total,
    page: response.page,
    size: response.size,
    loading: false,
    error: null
  })),

  on(loadClientsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(updatePage, (state, { page, size }) => ({
    ...state,
    page,
    size
  })),


on(createClient, (state) => ({
  ...state,
  loading: true,
  error: null
})),

  on(createClientSuccess, (state, { client }) => ({
    ...state,
    items: [client, ...state.items],
    total: state.total + 1,
    loading: false
  })),

  on(createClientFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),


  on(loadClientById, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(loadClientByIdSuccess, (state, { client }) => ({
    ...state,
    items: state.items.some(c => c.id === client.id)
      ? state.items.map(c => (c.id === client.id ? client : c))
      : [...state.items, client],
    loading: false
  })),

  on(loadClientByIdFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(updateClient, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(updateClientSuccess, (state, { client }) => ({
    ...state,
    items: state.items.map(c => c.id === client.id ? client : c),
    loading: false,
  })),

  on(updateClientFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  }))

);

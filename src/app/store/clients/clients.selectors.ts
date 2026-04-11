import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ClientsState } from './clients.models';

export const CLIENTS_FEATURE_KEY = 'clients';

export const selectClientsState =
  createFeatureSelector<ClientsState>(CLIENTS_FEATURE_KEY);

export const selectClients =
  createSelector(selectClientsState, s => s.items);

export const selectTotal =
  createSelector(selectClientsState, s => s.total);

export const selectPage =
  createSelector(selectClientsState, s => s.page);

export const selectSize =
  createSelector(selectClientsState, s => s.size);

export const selectLoading =
  createSelector(selectClientsState, s => s.loading);

export const selectLoaded =
  createSelector(selectClientsState, s => s.loaded);

export const selectError =
  createSelector(selectClientsState, s => s.error);

export const selectClientById = (clientId: string) =>
  createSelector(
    selectClientsState,
    (state) => state.items.find(c => c.id === clientId) ?? null
  );

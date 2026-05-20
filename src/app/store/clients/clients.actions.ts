import { createAction, props } from '@ngrx/store';
import { Client, PagedResponse } from './clients.models';

export const loadClients = createAction(
  '[Clients] Load',
  props<{
    companyId: string;
    page: number;
    size: number;
  }>()
);

export const loadClientsSuccess = createAction(
  '[Clients] Load Success',
  props<{ response: PagedResponse<Client> }>()
);

export const loadClientsFailure = createAction(
  '[Clients] Load Failure',
  props<{ error: string }>()
);

export const updatePage = createAction(
  '[Clients] Update Page',
  props<{
    page: number;
    size: number;
  }>()
);


export const createClient = createAction(
  '[Clients] Create',
  props<{
    companyId: string;
    client: Client
  }>()
);

export const createClientSuccess = createAction(
  '[Clients] Create Success',
  props<{ client: Client }>()
);

export const createClientFailure = createAction(
  '[Clients] Create Failure',
  props<{ error: string }>()
);

export const loadClientById = createAction(
  '[Clients] Load By Id',
  props<{
    companyId: string;
    clientId: string;
  }>()
);

export const loadClientByIdSuccess = createAction(
  '[Clients] Load By Id Success',
  props<{ client: Client }>()
);

export const loadClientByIdFailure = createAction(
  '[Clients] Load By Id Failure',
  props<{ error: string }>()
);

export const updateClient = createAction(
  '[Clients] Update',
  props<{ companyId: string; clientId: string; client: Partial<Client> }>()
);

export const updateClientSuccess = createAction(
  '[Clients] Update Success',
  props<{ client: Client }>()
);

export const updateClientFailure = createAction(
  '[Clients] Update Failure',
  props<{ error: string }>()
);

export const deleteClient = createAction(
  '[Clients] Delete',
  props<{ companyId: string; clientId: string }>()
);

export const deleteClientSuccess = createAction(
  '[Clients] Delete Success',
  props<{ clientId: string }>()
);

export const deleteClientFailure = createAction(
  '[Clients] Delete Failure',
  props<{ error: string }>()
);

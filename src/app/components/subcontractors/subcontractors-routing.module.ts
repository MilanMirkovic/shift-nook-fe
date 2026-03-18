import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { SUBCONTRACTORS_FEATURE_KEY, subcontractorsReducer } from '../../store/subcontractors/subcontractors.reducer';
import { SubcontractorsEffects } from '../../store/subcontractors/subcontractors.effects';

export const SUBCONTRACTORS_ROUTES: Routes = [
  {
    path: '',
    providers: [
      provideState(SUBCONTRACTORS_FEATURE_KEY, subcontractorsReducer),
      provideEffects(SubcontractorsEffects),
    ],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./subcontractors-list/subcontractors-list.component').then(
            m => m.SubcontractorsListComponent
          ),
      },
      {
        path: ':linkId',
        loadComponent: () =>
          import('./subcontractor-detail/subcontractor-detail.component').then(
            m => m.SubcontractorDetailComponent
          ),
      },
    ],
  },
];


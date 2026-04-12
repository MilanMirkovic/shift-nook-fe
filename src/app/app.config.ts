import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withPreloading } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth.interceptor';
import { CustomPreloadStrategy } from './core/routing/custom-preload-strategy';

// Import only essential reducers and effects (loaded at app level)
import { reducer as userReducer } from './store/user/user.reducer';
import { UserEffects } from './store/user/user.effects';

// Import feature keys
import { USER_FEATURE_KEY } from './store/user/user.selectors';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withPreloading(CustomPreloadStrategy)),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimationsAsync(),
    provideStore({
      [USER_FEATURE_KEY]: userReducer,
    }),
    provideEffects([
      UserEffects,
    ]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: false,
      autoPause: true,
      trace: false,
      traceLimit: 75
    })
  ],
};

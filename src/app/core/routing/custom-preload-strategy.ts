import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of } from 'rxjs';

/**
 * Custom preloading strategy that preloads routes marked with data: { preload: true }
 * This allows us to preload critical routes after initial load for faster navigation
 */
@Injectable({ providedIn: 'root' })
export class CustomPreloadStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // Preload routes that have data.preload set to true
    if (route.data && route.data['preload']) {
      console.log('Preloading route:', route.path);
      return load();
    }

    // Don't preload other routes
    return of(null);
  }
}

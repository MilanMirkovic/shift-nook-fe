import { Component, ViewChild, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { filter, map, takeUntil, take } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SidebarComponent } from './sidebar/sidebar.component';
import { CheckInFabComponent } from './shared/components/check-in-fab/check-in-fab.component';
import { NotificationBellComponent } from './shared/components/notification-bell/notification-bell.component';
import { CommonModule } from '@angular/common';
import { CompanyWorkSessionsStoreService } from './store/company-work-sessions/company-work-sessions-store.service';
import { UserStoreService } from './store/user/user-store.service';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatProgressSpinnerModule,
    SidebarComponent,
    CheckInFabComponent,
    NotificationBellComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {
  @ViewChild(MatSidenav) private sidenav?: MatSidenav;

  private readonly destroy$ = new Subject<void>();

  protected readonly appName = 'Shift Nook';
  protected readonly isHandset = signal(false);

  // True/false source of truth for whether the sidebar is visible.
  protected readonly navOpen = signal(true);

  // Optional premium mini-rail (desktop only). If you want ONLY hide/show, we can remove this later.
  protected readonly isCollapsed = signal(false);

  // Determines whether to show the sidebar layout or not, based on the current route
  protected readonly showLayout = signal(true);

  // True while we check authentication and load initial user data
  protected readonly appInitializing = signal(true);

  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly router = inject(Router);
  private readonly workSessionStore = inject(CompanyWorkSessionsStoreService);
  private readonly userStore = inject(UserStoreService);
  private readonly authService = inject(AuthService);

  protected readonly sidenavMode = computed(() => (this.isHandset() ? 'over' : 'side'));

  constructor() {
    this.breakpointObserver.observe([Breakpoints.Handset])
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
      this.isHandset.set(state.matches);

      if (state.matches) {
        // Mobile: start closed; user opens via toggle.
        this.navOpen.set(false);
        this.isCollapsed.set(false);
      } else {
        // Desktop: start open.
        this.navOpen.set(true);
      }
    });

    // Listen to route changes to determine if we should show the layout
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map((event) => event as NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event) => {
        const publicRoutes = ['/login', '/signup', '/confirm', '/forgot-password', '/select-company', '/create-company', '/accept-invite', '/auth/set-password', '/subcontractor-invite'];
        this.showLayout.set(!publicRoutes.some(route => event.urlAfterRedirects.startsWith(route)));
      });

    const currentUrl = this.router.url;
    const publicRoutes = ['/login', '/signup', '/confirm', '/forgot-password', '/select-company', '/create-company', '/accept-invite', '/auth/set-password', '/subcontractor-invite'];
    this.showLayout.set(!publicRoutes.some(route => currentUrl.startsWith(route)));
  }

  ngOnInit(): void {
    this.authService.isAuthenticated().then(isAuth => {
      if (isAuth) {
        const currentUrl = this.router.url;
        const skipLoadRoutes = ['/subcontractor-invite', '/forgot-password', '/auth/reset-password', '/auth/set-password'];
        if (skipLoadRoutes.some(r => currentUrl.startsWith(r))) {
          this.appInitializing.set(false);
        } else {
          this.userStore.loadUser();
          this.workSessionStore.loadCurrentSession();
          // Wait until user data has actually loaded before hiding the loading screen
          this.userStore.user$
            .pipe(
              filter(user => user !== null),
              take(1),
              takeUntil(this.destroy$)
            )
            .subscribe(() => {
              this.appInitializing.set(false);
            });
        }
      } else {
        this.appInitializing.set(false);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected toggleNavigation(): void {
    // Mobile: open/close the drawer.
    if (this.isHandset()) {
      this.navOpen.update((v) => !v);
      return;
    }

    // Desktop: hide/show the sidebar.
    this.navOpen.update((v) => !v);

    // If it's hidden, also reset collapsed state to avoid weird width when it comes back.
    if (!this.navOpen()) {
      this.isCollapsed.set(false);
    }
  }

  protected toggleCollapse(): void {
    // Desktop-only optional mini-rail (doesn't fully hide).
    if (!this.isHandset() && this.navOpen()) {
      this.isCollapsed.update((v) => !v);
    }
  }

  protected closeSidenavOnMobile(): void {
    if (this.isHandset()) {
      this.navOpen.set(false);
    }
  }
}

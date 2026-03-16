import { Component, ViewChild, signal, computed, inject, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { filter, map } from 'rxjs/operators';

import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { SidebarComponent } from './sidebar/sidebar.component';
import { CheckInFabComponent } from './shared/components/check-in-fab/check-in-fab.component';
import { WorkSessionTimerComponent } from './shared/components/work-session-timer/work-session-timer.component';
import { NotificationBellComponent } from './shared/components/notification-bell/notification-bell.component';
import { CommonModule } from '@angular/common';
import { CompanyWorkSessionsStoreService } from './store/company-work-sessions/company-work-sessions-store.service';
import { UserStoreService } from './store/user/user-store.service';
import { AuthService } from './core/auth/auth.service';
import { CompanyRole } from './shared/models/company-role';

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
    SidebarComponent,
    CheckInFabComponent,
    WorkSessionTimerComponent,
    NotificationBellComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  @ViewChild(MatSidenav) private sidenav?: MatSidenav;

  protected readonly appName = 'Shift Nook';
  protected readonly isHandset = signal(false);

  // True/false source of truth for whether the sidebar is visible.
  protected readonly navOpen = signal(true);

  // Optional premium mini-rail (desktop only). If you want ONLY hide/show, we can remove this later.
  protected readonly isCollapsed = signal(false);

  // Determines whether to show the sidebar layout or not, based on the current route
  protected readonly showLayout = signal(true);

  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly router = inject(Router);
  private readonly workSessionStore = inject(CompanyWorkSessionsStoreService);
  private readonly userStore = inject(UserStoreService);
  private readonly authService = inject(AuthService);

  protected readonly sidenavMode = computed(() => (this.isHandset() ? 'over' : 'side'));

  // Only show work session timer for ACCOUNTANT role
  protected isAccountant$ = this.userStore.currentCompany$.pipe(
    map(company => company?.role === CompanyRole.ACCOUNTANT)
  );

  constructor() {
    this.breakpointObserver.observe([Breakpoints.Handset]).subscribe((state) => {
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
        map((event) => event as NavigationEnd)
      )
      .subscribe((event) => {
        // Hide layout for login and other public pages
        const publicRoutes = ['/login', '/select-company', '/create-company'];
        this.showLayout.set(!publicRoutes.some(route => event.urlAfterRedirects.startsWith(route)));
      });

    // Set initial state based on current route
    const currentUrl = this.router.url;
    const publicRoutes = ['/login', '/select-company', '/create-company'];
    this.showLayout.set(!publicRoutes.some(route => currentUrl.startsWith(route)));
  }

  ngOnInit(): void {
    // Check real auth state (Amplify/Cognito) before hitting protected endpoints
    this.authService.isAuthenticated().then(isAuth => {
      if (isAuth) {
        this.workSessionStore.loadCurrentSession();
      }
    });
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

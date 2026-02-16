import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the dashboard page by default', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);

    // Trigger initial navigation and wait for the redirect to /dashboard.
    await router.navigateByUrl('/');

    await fixture.whenStable();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const titleEl = compiled.querySelector('.page-title');
    expect(titleEl).toBeTruthy();
    expect(titleEl?.textContent ?? '').toContain('Dashboard');
  });
});

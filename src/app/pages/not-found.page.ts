import { Component } from '@angular/core';

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  template: `
    <h1 class="page-title">Page not found</h1>
    <p class="page-subtitle">The page you’re looking for doesn’t exist.</p>
  `
})
export class NotFoundPage {}


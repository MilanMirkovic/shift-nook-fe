import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly snackBar = inject(MatSnackBar);

  private readonly defaultConfig: MatSnackBarConfig = {
    duration: 3500,
    horizontalPosition: 'center',
    verticalPosition: 'top',
  };

  /**
   * Show a success message
   */
  success(message: string, duration = 3500): void {
    this.snackBar.open(message, '✕', {
      ...this.defaultConfig,
      duration,
      panelClass: ['snackbar-success']
    });
  }

  /**
   * Show an error message
   */
  error(message: string, duration = 5000): void {
    this.snackBar.open(message, '✕', {
      ...this.defaultConfig,
      duration,
      panelClass: ['snackbar-error']
    });
  }

  /**
   * Show an info message
   */
  info(message: string, duration = 3500): void {
    this.snackBar.open(message, '✕', {
      ...this.defaultConfig,
      duration,
      panelClass: ['snackbar-info']
    });
  }

  /**
   * Show a warning message
   */
  warning(message: string, duration = 4000): void {
    this.snackBar.open(message, '✕', {
      ...this.defaultConfig,
      duration,
      panelClass: ['snackbar-warning']
    });
  }
}

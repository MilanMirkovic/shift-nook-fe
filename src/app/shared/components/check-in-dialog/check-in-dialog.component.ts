import { Component, inject, OnInit, OnDestroy, Inject, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Subject, takeUntil, filter, combineLatest, map, switchMap, tap, take } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

import { UserStoreService } from '../../../store/user/user-store.service';
import { TimesheetsStoreService } from '../../../store/timesheets/timesheets-store.service';
import { JobsitesStoreService } from '../../../store/jobsites/jobsites-store.service';
import { JobsiteTasksStoreService } from '../../../store/jobsite-tasks/jobsite-tasks-store.service';
import { NotificationService } from '../../services/notification.service';
import { Timesheet } from '../../../store/timesheets/timesheets.models';
import * as L from 'leaflet';

interface DialogData {
  isCheckedIn: boolean;
  activeTimesheet?: Timesheet;
}

@Component({
  selector: 'app-check-in-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatDividerModule,
    MatInputModule,
    MatCheckboxModule
  ],
  templateUrl: './check-in-dialog.component.html',
  styleUrls: ['./check-in-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckInDialogComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<CheckInDialogComponent>);
  private readonly userStore = inject(UserStoreService);
  private readonly timesheetsStore = inject(TimesheetsStoreService);
  private readonly jobsitesStore = inject(JobsitesStoreService);
  private readonly jobsiteTasksStore = inject(JobsiteTasksStoreService);
  private readonly notificationService = inject(NotificationService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  protected checkInForm: FormGroup;
  protected checkOutForm: FormGroup;
  protected jobsites$ = this.jobsitesStore.jobsites$;
  // Filter to show only OPEN tasks
  protected jobsiteTasks$ = this.jobsiteTasksStore.tasks$.pipe(
    map(tasks => tasks.filter(task => task.status === 'OPEN'))
  );
  protected loading$ = this.timesheetsStore.creating$;
  protected updatingTimesheet$ = this.timesheetsStore.updating$;
  protected readonly isCheckedIn: boolean;
  protected readonly activeTimesheet?: Timesheet;
  protected gettingLocation = false;
  protected currentLocation?: { lat: number; lng: number; accuracy: number };
  protected mapLoading = false;

  @ViewChild('mapContainer', { static: false }) mapContainer?: ElementRef;
  private map?: L.Map;
  private marker?: L.Marker;

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {
    // Store the values immediately as readonly to prevent change detection issues
    this.isCheckedIn = !!data?.isCheckedIn;
    this.activeTimesheet = data?.activeTimesheet;

    this.checkInForm = this.fb.group({
      jobsiteId: ['', Validators.required],
      jobsiteTaskId: ['', Validators.required]
    });

    this.checkOutForm = this.fb.group({
      workDescription: [''],
      lunchtimeDurationMinutes: [null, [Validators.min(0)]],
      markTaskAsComplete: [false]
    });
  }

  ngOnInit(): void {
    // Load jobsites and listen for jobsite selection to load tasks
    this.userStore.currentCompany$
      .pipe(takeUntil(this.destroy$))
      .subscribe(company => {
        if (company?.companyId) {
          this.jobsitesStore.loadJobsites(company.companyId);
        }
      });

    // When jobsite is selected, load its tasks
    this.checkInForm.get('jobsiteId')?.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        filter(jobsiteId => !!jobsiteId),
        switchMap(jobsiteId =>
          this.userStore.currentCompany$.pipe(
            filter(company => !!company?.companyId),
            take(1),
            tap(company => {
              this.jobsiteTasksStore.loadJobsiteTasks(company!.companyId, jobsiteId);
            })
          )
        )
      )
      .subscribe();

    // Get current location
    this.getCurrentLocation();
  }

  ngAfterViewInit(): void {
    // Map will be initialized after location is acquired
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  getCurrentLocation(): void {
    if (!navigator.geolocation) {
      this.notificationService.error('Geolocation is not supported by this browser.');
      return;
    }

    this.gettingLocation = true;
    this.cdr.markForCheck();

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.currentLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        this.gettingLocation = false;
        this.cdr.markForCheck();
        this.updateMap();
      },
      (_error) => {
        this.notificationService.error('Unable to get your location');
        this.gettingLocation = false;
        this.cdr.markForCheck();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }

  private updateMap(): void {
    if (!this.currentLocation) return;

    this.mapLoading = true;
    this.cdr.markForCheck();

    setTimeout(() => {
      if (!this.map && this.mapContainer?.nativeElement) {
        this.map = L.map(this.mapContainer.nativeElement, {
          zoomControl: true,
          attributionControl: true,
          preferCanvas: true
        }).setView(
          [this.currentLocation!.lat, this.currentLocation!.lng],
          16
        );

        // Use a fancier map style - CartoDB Voyager (colorful and modern)
        const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '',
          subdomains: 'abcd',
          maxZoom: 20
        }).addTo(this.map);

        // Fix for default marker icon issue in webpack
        const iconRetinaUrl = 'assets/marker-icon-2x.png';
        const iconUrl = 'assets/marker-icon.png';
        const shadowUrl = 'assets/marker-shadow.png';
        const iconDefault = L.icon({
          iconRetinaUrl,
          iconUrl,
          shadowUrl,
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          tooltipAnchor: [16, -28],
          shadowSize: [41, 41]
        });
        L.Marker.prototype.options.icon = iconDefault;

        this.marker = L.marker([this.currentLocation!.lat, this.currentLocation!.lng])
          .addTo(this.map)
          .bindPopup('<strong>📍 You are here</strong>')
          .openPopup();

        // Add accuracy circle with better styling
        L.circle([this.currentLocation!.lat, this.currentLocation!.lng], {
          color: '#667eea',
          fillColor: '#667eea',
          fillOpacity: 0.15,
          weight: 2,
          radius: this.currentLocation!.accuracy
        }).addTo(this.map);

        // Multiple attempts to invalidate size to ensure proper rendering
        const invalidateMapSize = () => {
          if (this.map) {
            this.map.invalidateSize(true);
            this.map.setView([this.currentLocation!.lat, this.currentLocation!.lng], 16);
          }
        };

        // First invalidation after short delay
        setTimeout(() => {
          invalidateMapSize();
        }, 100);

        // Second invalidation when tiles load
        tileLayer.on('load', () => {
          setTimeout(() => {
            invalidateMapSize();
            this.mapLoading = false;
            this.cdr.markForCheck();
          }, 150);
        });

        // Fallback: hide loader and invalidate after map is ready
        this.map.whenReady(() => {
          setTimeout(() => {
            invalidateMapSize();
            this.mapLoading = false;
            this.cdr.markForCheck();
          }, 200);
        });

        // Final invalidation to be absolutely sure
        setTimeout(() => {
          invalidateMapSize();
          this.mapLoading = false;
          this.cdr.markForCheck();
        }, 500);
      } else if (this.map && this.marker) {
        this.map.setView([this.currentLocation!.lat, this.currentLocation!.lng], 16);
        this.marker.setLatLng([this.currentLocation!.lat, this.currentLocation!.lng]);
        this.map.invalidateSize(true);
        this.mapLoading = false;
        this.cdr.markForCheck();
      }
    }, 150);
  }

  onCheckIn(): void {
    if (this.checkInForm.invalid || !this.currentLocation) {
      return;
    }

    this.userStore.currentCompany$
      .pipe(takeUntil(this.destroy$), filter(company => !!company?.companyId))
      .subscribe(company => {
        const formValue = this.checkInForm.value;
        const checkInData = {
          jobsiteId: formValue.jobsiteId,
          jobsiteTaskId: formValue.jobsiteTaskId,
          checkInTime: new Date().toISOString(),
          checkInLat: this.currentLocation!.lat,
          checkInLng: this.currentLocation!.lng,
          checkInAccuracy: this.currentLocation!.accuracy,
          clientEventId: uuidv4()
        };

        this.timesheetsStore.createTimesheet(company!.companyId, checkInData);

        // Listen for successful creation
        combineLatest([
          this.timesheetsStore.creating$,
          this.timesheetsStore.error$
        ])
          .pipe(
            takeUntil(this.destroy$),
            filter(([creating]) => !creating),
            take(1)
          )
          .subscribe(([, error]) => {
            if (error) {
              this.notificationService.error(`Check-in failed: ${error}`);
            } else {
              this.notificationService.success('✓ Successfully checked in!');
              this.dialogRef.close(true);
            }
          });
      });
  }

  onCheckOut(): void {
    if (!this.activeTimesheet || !this.currentLocation) {
      return;
    }

    this.userStore.currentCompany$
      .pipe(filter(company => !!company?.companyId), take(1))
      .subscribe(company => {
        const checkOutFormValue = this.checkOutForm.value;
        const lunchMinutes = checkOutFormValue.lunchtimeDurationMinutes;
        const checkOutData = {
          status: 'CLOSED' as const,
          checkOutTime: new Date().toISOString(),
          checkOutLat: this.currentLocation!.lat,
          checkOutLng: this.currentLocation!.lng,
          checkOutAccuracy: this.currentLocation!.accuracy,
          workDescription: checkOutFormValue.workDescription || undefined,
          lunchtimeDurationMinutes: lunchMinutes != null && lunchMinutes !== '' ? Number(lunchMinutes) : undefined,
          markTaskAsComplete: checkOutFormValue.markTaskAsComplete || false
        };

        this.timesheetsStore.updateTimesheet(
          company!.companyId,
          this.activeTimesheet!.id,
          checkOutData
        );

        // Listen for successful update
        combineLatest([
          this.timesheetsStore.updating$,
          this.timesheetsStore.error$
        ])
          .pipe(
            takeUntil(this.destroy$),
            filter(([updating]) => !updating),
            take(1)
          )
          .subscribe(([, error]) => {
            if (error) {
              this.notificationService.error(`Check-out failed: ${error}`);
            } else {
              this.notificationService.success('✓ Successfully checked out!');
              this.dialogRef.close(true);
            }
          });
      });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  get lunchDurationHasMinError(): boolean {
    return !!this.checkOutForm.get('lunchtimeDurationMinutes')?.hasError('min');
  }
}

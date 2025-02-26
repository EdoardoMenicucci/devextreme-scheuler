import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

// Remove individual function imports and import the service
import { FormatService } from '../../services/format.service';

import {
  DxChartModule,
  DxCircularGaugeModule,
  DxListModule,
  DxDateRangeBoxModule,
} from 'devextreme-angular';
import { DashboardService } from './dashboard.service';
import { AuthService } from '../../auth/auth.service';
import {  Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    DxChartModule,
    DxCircularGaugeModule,
    DxListModule,
    CommonModule,
    DxDateRangeBoxModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit, OnDestroy {
  title = 'Dashboard';

  statisticsData: any[] = [];
  successRate = 0;
  upcomingAppointments: any[] = [];
  currentDate = new Date();
  username: string | null = null;

  //subscription
  private readonly destroy$ = new Subject<void>();

  //filter options
  startDate: Date | null = null;
  endDate: Date | null = null;

  minDate: Date = new Date(2021, 0, 1);

  palette: string[] = [
    // '#818CF8', // accent-light
    '#4F46E5', // accent - TotalColor
    '#4F46E5', // accent - CreatedColor : TODO: remove
    '#4F46E5', // accent - UpdatedColor
    '#DC2626', // accent-dark - DeletedColor
    '#059669', // accent-dark -CompletedColor
    '#fde300', // accent-dark -UpcomingColor
    '#DC2626', // accent-dark -MissedColor
  ];

  userData: Object[] = [
    { age: '13-17', number: 6869661 },
    { age: '18-24', number: 40277957 },
    { age: '25-34', number: 53481235 },
    { age: '35-44', number: 40890002 },
    { age: '45-54', number: 31916371 },
    { age: '55-64', number: 13725406 },
    { age: '65+', number: 16732183 },
  ];

  gaugePalette: string[] = ['#DC2626', '#fde300', '#059669'];

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private formatService: FormatService
  ) {}

  //life cycle hook
  ngOnInit(): void {
    // prepara i dati per il grafico
    this.dashboardService.statistics$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.statisticsData = [
          { category: 'Total', value: data.totalAppointments ?? 0 },
          { category: 'Created', value: data.createdAppointments ?? 0 },
          { category: 'Updated', value: data.updatedAppointments ?? 0 },
          { category: 'Deleted', value: data.deletedAppointments ?? 0 },
          { category: 'Completed', value: data.completedAppointments ?? 0 },
          { category: 'Upcoming', value: data.upcomingAppointments ?? 0 },
          { category: 'Missed', value: data.missedAppointments ?? 0 },
        ];

        this.successRate = data.successRate ?? 0;
        this.username = this.authService.username;

        if (
          data.upcomingAppointmentsList &&
          Array.isArray(data.upcomingAppointmentsList)
        ) {
          this.upcomingAppointments = data.upcomingAppointmentsList;

          this.upcomingAppointments.forEach((a) => {
            if (a) {
              a.startDate = new Date(a.startDate);
              a.endDate = new Date(a.endDate);
              if (
                a.startDate <= this.currentDate &&
                this.currentDate <= a.endDate
              ) {
                console.log('Appointment On Going', a);
              }
            }
          });
        } else {
          this.upcomingAppointments = [];
        }

        console.log('current date: ', this.currentDate);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onDateRangeChanged(e: any) {
    // Only fetch if both dates are selected or both are cleared
    console.log(e.value[0], e.value[1]);
    this.startDate = e.value[0];
    this.endDate = e.value[1];

    if (
      (this.startDate && this.endDate) ||
      (!this.startDate && !this.endDate)
    ) {
      console.log('Date range changed:', this.startDate, this.endDate);

      this.dashboardService.loadStatistics(
        this.startDate ? this.formatService.formatToLocalDate(this.startDate) : undefined,
        this.endDate ? this.formatService.formatToLocalDate(this.endDate, true) : undefined
      );
    }
  }

  //Gauge customization
  customizeText = (args: { value?: number; valueText?: string }): string => {
    return `${args.valueText}%`;
  };

  customizeTooltip = (arg: any) => {
    return {
      text: `${this.formatService.roundToTwo(arg.value)}%`,
    };
  };

  // Format Service functions
  roundToTwo(num: number): number {
    return this.formatService.roundToTwo(num);
  }

  formatUserName(username: string | null): string {
    return this.formatService.formatUserName(username);
  }

  formatDate(dateInput: string | Date | null): string {
    return this.formatService.formatDate(dateInput);
  }

  formatDateTime(dateInput: string | Date | null): string {
    return this.formatService.formatDateTime(dateInput);
  }

  truncateText(text: string): string {
    return this.formatService.truncateText(text, 80);
  }
}

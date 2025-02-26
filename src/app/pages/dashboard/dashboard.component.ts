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

/**
 * Dashboard component displaying user statistics, appointment metrics,
 * success rates, and upcoming appointments
 */
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
  /** Title displayed in the dashboard header */
  title = 'Dashboard';

  /** Statistics data for charts and metrics */
  statisticsData: any[] = [];

  /** Success rate percentage for gauge visualization */
  successRate = 0;

  /** List of upcoming appointments */
  upcomingAppointments: any[] = [];

  /** Current date used for appointment status determination */
  currentDate = new Date();

  /** Username of the currently logged-in user */
  username: string | null = null;

  /** Subject for managing subscription cleanup */
  private readonly destroy$ = new Subject<void>();

  /** Start date for filtering dashboard data */
  startDate: Date | null = null;

  /** End date for filtering dashboard data */
  endDate: Date | null = null;

  /** Minimum selectable date in the date range filter */
  minDate: Date = new Date(2021, 0, 1);

  /** Color palette for chart visualizations */
  palette: string[] = [
    '#4F46E5', // accent - TotalColor
    '#4F46E5', // accent - CreatedColor : TODO: remove
    '#4F46E5', // accent - UpdatedColor
    '#DC2626', // accent-dark - DeletedColor
    '#059669', // accent-dark -CompletedColor
    '#fde300', // accent-dark -UpcomingColor
    '#DC2626', // accent-dark -MissedColor
  ];

  /** Color palette for gauge visualization */
  gaugePalette: string[] = ['#DC2626', '#fde300', '#059669'];

  /**
   * Creates an instance of DashboardComponent
   * @param dashboardService - Service for fetching dashboard statistics
   * @param authService - Service providing authentication and user details
   * @param formatService - Service for formatting text and dates
   */
  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private formatService: FormatService
  ) {}

  /**
   * Lifecycle hook that initializes the component
   * Subscribes to statistics data and processes appointment information
   */
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

  /**
   * Lifecycle hook for cleanup when the component is destroyed
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Handles date range selection changes and updates dashboard data
   * @param e - Event object containing selected date range values
   */
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

  /**
   * Custom text formatter for gauge visualization
   * @param args - Arguments containing value and valueText
   * @returns Formatted percentage text
   */
  customizeText = (args: { value?: number; valueText?: string }): string => {
    return `${args.valueText}%`;
  };

  /**
   * Custom tooltip formatter for data visualizations
   * @param arg - Argument containing the value to display in tooltip
   * @returns Tooltip configuration object with formatted text
   */
  customizeTooltip = (arg: any) => {
    return {
      text: `${this.formatService.roundToTwo(arg.value)}%`,
    };
  };

  /**
   * Rounds a number to two decimal places
   * @param num - Number to round
   * @returns Number rounded to two decimal places
   */
  roundToTwo(num: number): number {
    return this.formatService.roundToTwo(num);
  }

  /**
   * Formats username for display
   * @param username - Username to format
   * @returns Formatted username
   */
  formatUserName(username: string | null): string {
    return this.formatService.formatUserName(username);
  }

  /**
   * Formats a date to display date only
   * @param dateInput - Date to format (string or Date object)
   * @returns Formatted date string
   */
  formatDate(dateInput: string | Date | null): string {
    return this.formatService.formatDate(dateInput);
  }

  /**
   * Formats a date to display both date and time
   * @param dateInput - Date to format (string or Date object)
   * @returns Formatted date and time string
   */
  formatDateTime(dateInput: string | Date | null): string {
    return this.formatService.formatDateTime(dateInput);
  }

  /**
   * Truncates text to a specified length
   * @param text - Text to truncate
   * @returns Truncated text
   */
  truncateText(text: string): string {
    return this.formatService.truncateText(text, 80);
  }
}

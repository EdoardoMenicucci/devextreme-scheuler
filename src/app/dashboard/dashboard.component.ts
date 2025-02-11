import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

import { firstLetterToUpperCase, formatDateUtils, formatDateTimeUtils } from '../utils/generic';

import {
  DxChartModule,
  DxCircularGaugeModule,
  DxListModule,
  DxDateRangeBoxModule,
} from 'devextreme-angular';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { DashboardService } from './dashboard.service';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    DxChartModule,
    DxCircularGaugeModule,
    SidebarComponent,
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

  //subscription per evitare memory leaks
  private statisticsSub!: Subscription;

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
    private authService: AuthService
  ) {}

  //life cycle hook
  ngOnInit(): void {
    // prepara i dati per il grafico
    this.statisticsSub = this.dashboardService.statistics$.subscribe((data) => {
      this.statisticsData = [
        { category: 'Total', value: data.totalAppointments ?? 0 },
        {
          category: 'Created',
          value: data.createdAppointments ?? 0,
        },
        {
          category: 'Updated',
          value: data.updatedAppointments ?? 0,
        },
        {
          category: 'Deleted',
          value: data.deletedAppointments ?? 0,
        },
        {
          category: 'Completed',
          value: data.completedAppointments ?? 0,
        },
        {
          category: 'Upcoming',
          value: data.upcomingAppointments ?? 0,
        },
        { category: 'Missed', value: data.missedAppointments ?? 0 },
      ];

      this.successRate = data.successRate;
      console.log('Success rate:', this.successRate);
      
      this.username = this.authService.username;
      this.upcomingAppointments = data.upcomingAppointmentsList;

      // Check if there is an appointment on going
      this.upcomingAppointments.forEach((a) => {
        a.startDate = new Date(a.startDate);
        a.endDate = new Date(a.endDate);
        if (a.startDate <= this.currentDate && this.currentDate <= a.endDate) {
          console.log('Appointment On Going', a);
        }
      });
      // console.log('Statistics data recived:', data);
      console.log('current date: ', this.currentDate);

    });
  }

  ngOnDestroy(): void {
    if (this.statisticsSub) this.statisticsSub.unsubscribe();
  }

  onDateRangeChanged(e: any) {
    // Only fetch if both dates are selected or both are cleared
    console.log(e.value[0], e.value[1]);
    this.startDate = e.value[0];
    this.endDate = e.value[1];

    // Format dates to local ISO string without timezone
    // Helper function to format dates for the query
    const formatToLocalDate = (date: Date, isEndDate: boolean = false) => {
      const d = new Date(date.getTime());
      if (isEndDate) {
        d.setHours(23, 59, 59);
      } else {
        d.setHours(0, 0, 0);
      }
      return (
        d.getFullYear() +
        '-' +
        String(d.getMonth() + 1).padStart(2, '0') +
        '-' +
        String(d.getDate()).padStart(2, '0') +
        'T' +
        String(d.getHours()).padStart(2, '0') +
        ':' +
        String(d.getMinutes()).padStart(2, '0') +
        ':' +
        String(d.getSeconds()).padStart(2, '0')
      );
    };

    if (
      (this.startDate && this.endDate) ||
      (!this.startDate && !this.endDate)
    ) {
      console.log('Date range changed:', this.startDate, this.endDate);

      this.dashboardService.loadStatistics(
        this.startDate ? formatToLocalDate(this.startDate) : undefined,
        this.endDate ? formatToLocalDate(this.endDate, true) : undefined
      );
    }
  }

  //Gauge customization
  customizeText = (args: { value?: number; valueText?: string }): string => {
    return `${args.valueText}%`;
  };

  customizeTooltip = (arg: any) => {
    return {
      text: `${this.roundToTwo(arg.value)}%`,
    };
  };
  // utils
  roundToTwo(num: number): number {
    return Math.round(num * 100) / 100;
  }

  formatUserName(username: string | null): string {
    return firstLetterToUpperCase(username ? username : 'User');
  }

  formatDate(dateInput: string | Date | null): string {
    return formatDateUtils(dateInput);
  }

  formatDateTime(dateInput: string | Date | null): string {
    return formatDateTimeUtils(dateInput);
  }
}

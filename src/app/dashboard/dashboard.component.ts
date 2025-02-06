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
  cancellationRate = 0;
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
    // '#818CF8', // accent-light (primary)
    '#4F46E5', // accent
    '#4338CA', // accent-hover
  ];

  gaugePalette: string[] = ['#059669', '#fde300', '#DC2626'];

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService
  ) {
    // prepara i dati per il grafico
    this.statisticsSub = this.dashboardService.statistics$.subscribe((data) => {
      this.statisticsData = [
        { category: 'Total', value: data.totalAppointments },
        {
          category: 'Created',
          value: data.createdAppointments,
        },
        {
          category: 'Updated',
          value: data.updatedAppointments,
        },
        {
          category: 'Deleted',
          value: data.deletedAppointments,
        },
        {
          category: 'Completed',
          value: data.completedAppointments,
        },
        {
          category: 'Upcoming',
          value: data.upcomingAppointments,
        },
        { category: 'Missed', value: data.missedAppointments },
      ];

      this.cancellationRate = data.cancellationRate;
      this.username = this.authService.username;
      this.upcomingAppointments = data.upcomingAppointmentsList;
      console.log('Statistics data recived:', data);
    });
  }

  //life cycle hook
  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.statisticsSub.unsubscribe();
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

  customizeText = (args: { value?: number; valueText?: string }): string => {
    return `${args.valueText}%`;
  };

  customizeTooltip = (args: { value?: number; valueText?: string }): string => {
    return `${args.valueText} %`;
  };

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

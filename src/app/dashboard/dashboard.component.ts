import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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
export class DashboardComponent implements OnInit {
  title = 'Dashboard';

  statisticsData: any[] = [];
  cancellationRate = 0;
  upcomingAppointments: any[] = [];
  currentDate = new Date();
  username: string | null = null;

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
    this.dashboardService.statistics$.subscribe((data) => {
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

  onDateRangeChanged(e: any) {
    // Only fetch if both dates are selected or both are cleared
    console.log(e.value[0], e.value[1]);
    this.startDate = e.value[0];
    this.endDate = e.value[1];

    // Format dates to local ISO string without timezone
    const formatToLocalDate = (date: Date) => {
      return (
        date.getFullYear() +
        '-' +
        String(date.getMonth() + 1).padStart(2, '0') +
        '-' +
        String(date.getDate()).padStart(2, '0') +
        'T' +
        String(date.getHours()).padStart(2, '0') +
        ':' +
        String(date.getMinutes()).padStart(2, '0') +
        ':' +
        String(date.getSeconds()).padStart(2, '0')
      );
    };

    if (
      (this.startDate && this.endDate) ||
      (!this.startDate && !this.endDate)
    ) {
      console.log('Date range changed:', this.startDate, this.endDate);

      this.dashboardService.loadStatistics(
        this.startDate ? formatToLocalDate(this.startDate) : undefined,
        this.endDate ? formatToLocalDate(this.endDate) : undefined
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

  ngOnInit(): void {}
}

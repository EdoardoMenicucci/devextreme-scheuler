import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { firstLetterToUpperCase, formatDateUtils } from '../utils/generic';

import {
  DxChartModule,
  DxCircularGaugeModule,
  DxListModule,
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
  ],
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

  customizeText = (args: { value?: number; valueText?: string }): string => {
    return `${args.valueText}%`;
  };

  formatUserName(username: string | null): string {
    return firstLetterToUpperCase(username ? username : 'User');
  }

  formatDate(dateInput: string | Date | null): string {
    return formatDateUtils(dateInput);
  }

  ngOnInit(): void {
    // Esempio di dati per upcoming appointments
    // this.upcomingAppointments = [
    //   {
    //     id: 1,
    //     text: 'Meeting with Client',
    //     date: '2023-10-15',
    //     time: '10:00',
    //   },
    //   { id: 2, text: 'Team Standup', date: '2023-10-16', time: '09:30' },
    //   { id: 3, text: 'Project Review', date: '2023-10-17', time: '11:00' },
    //   { id: 4, text: 'Design Session', date: '2023-10-18', time: '14:00' },
    // ];
  }
}

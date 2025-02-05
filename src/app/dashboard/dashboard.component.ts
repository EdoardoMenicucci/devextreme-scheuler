import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  DxChartModule,
  DxCircularGaugeModule,
  DxListModule,
} from 'devextreme-angular';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { DashboardService } from './dashboard.service';

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

  user = {
    id: 1,
    name: 'John Doe',
    email: 'example@email.com',
    statistics: {
      totalAppointments: 500,
      createdAppointments: 100,
      updatedAppointments: 50,
      deletedAppointments: 20,
      completedAppointments: 80,
      upcomingAppointments: 60,
      missedAppointments: 10,
      cancellationRate: 0.2,
    },
  };

  constructor(private dashboardService: DashboardService) {
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
      console.log('Statistics data recived:', data);
    });
  }

  customizeText = (args: { value?: number; valueText?: string }): string => {
    return `${args.valueText}%`;
  };

  formatDate(dateInput: string | Date | null): string {
    // format date to dd/mm/yyyy
    if (!dateInput) {
      return '';
    }
    try {
      const date =
        typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
      if (!(date instanceof Date) || isNaN(date.getTime())) {
        return '';
      }

      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();

      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  }

  ngOnInit(): void {
    // Esempio di dati per upcoming appointments
    this.upcomingAppointments = [
      {
        id: 1,
        text: 'Meeting with Client',
        date: '2023-10-15',
        time: '10:00',
      },
      { id: 2, text: 'Team Standup', date: '2023-10-16', time: '09:30' },
      { id: 3, text: 'Project Review', date: '2023-10-17', time: '11:00' },
      { id: 4, text: 'Design Session', date: '2023-10-18', time: '14:00' },
    ];
  }
}

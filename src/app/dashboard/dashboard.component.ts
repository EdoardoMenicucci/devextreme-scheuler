import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DxChartModule, DxCircularGaugeModule } from 'devextreme-angular';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { DxCircularGaugeTypes } from 'devextreme-angular/ui/circular-gauge';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DxChartModule, DxCircularGaugeModule, SidebarComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  title = 'Dashboard';

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

  customizeText: DxCircularGaugeTypes.ScaleLabel['customizeText'] = ({
    valueText,
  }) => `${valueText} %`;

  gaugeOptions = {
    rangeContainer: {
      ranges: [
        {
          startValue: 0,
          endValue: this.user.statistics.cancellationRate * 100,
          color: 'red',
        },
        {
          startValue: this.user.statistics.cancellationRate * 100,
          endValue: 100,
          color: 'blue',
        },
      ],
    },
  };

  statisticsData: any[] = [];

  ngOnInit(): void {
    const stats = this.user.statistics;
    // prepara le opzioni per il gauge
    this.gaugeOptions = {
      rangeContainer: {
        ranges: [
          {
            startValue: 0,
            endValue: this.user.statistics.cancellationRate * 100,
            color: 'red',
          },
          {
            startValue: this.user.statistics.cancellationRate * 100,
            endValue: 100,
            color: 'blue',
          },
        ],
      },
    };
    // prepara i dati per il grafico
    this.statisticsData = [
      { category: 'Total', value: stats.totalAppointments },
      { category: 'Created', value: stats.createdAppointments },
      { category: 'Updated', value: stats.updatedAppointments },
      { category: 'Deleted', value: stats.deletedAppointments },
      { category: 'Completed', value: stats.completedAppointments },
      { category: 'Upcoming', value: stats.upcomingAppointments },
      { category: 'Missed', value: stats.missedAppointments },
    ];
  }
}

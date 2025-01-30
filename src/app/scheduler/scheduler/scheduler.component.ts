import { Component } from '@angular/core';
import { DxSchedulerModule } from 'devextreme-angular';
import { ChatComponent } from "../../chat/chat.component";
import { AppointmentService } from './appointment.service';

@Component({
  standalone: true,
  imports: [DxSchedulerModule, ChatComponent],
  selector: 'app-scheduler',
  templateUrl: './scheduler.component.html',
  styleUrls: ['./scheduler.component.css'],
})
export class SchedulerComponent {
  currentView = 'week';
  currentDate = new Date();
  appointments = [
    {
      text: 'Riunione',
      startDate: new Date(2023, 9, 16, 10, 0),
      endDate: new Date(2023, 9, 16, 11, 0),
    },
  ];

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments() {
    this.appointmentService.getAppointments().subscribe((data) => {
      this.appointments = data;
    });
  }

  onAppointmentAdded(e: any) {
    this.appointmentService
      .createAppointment(e.appointmentData)
      .subscribe(() => this.loadAppointments());
  }

  onAppointmentUpdated(e: any) {
    this.appointmentService
      .updateAppointment(e.appointmentData.id, e.appointmentData)
      .subscribe(() => this.loadAppointments());
  }

  onAppointmentDeleted(e: any) {
    this.appointmentService
      .deleteAppointment(e.appointmentData.id)
      .subscribe(() => this.loadAppointments());
  }

  onAppointmentFormOpening(e: any) {
    console.log('onAppointmentFormOpening', e);
  }
}

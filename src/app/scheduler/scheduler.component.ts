import { Component } from '@angular/core';
import { DxSchedulerModule } from 'devextreme-angular';
import { ChatComponent } from "../chat/chat.component";
import { AppointmentService } from './appointment.service';
import { SidebarComponent } from "../sidebar/sidebar.component";

@Component({
  standalone: true,
  imports: [DxSchedulerModule, ChatComponent, SidebarComponent],
  selector: 'app-scheduler',
  templateUrl: './scheduler.component.html',
  styleUrls: ['./scheduler.component.css'],
})
export class SchedulerComponent {
  currentView = 'week';
  currentDate = new Date();
  appointments: any[] = [];

  constructor(private appointmentService: AppointmentService) {
    this.appointmentService.appointments$.subscribe((data) => {
      this.appointments = data;
    });
  }

  async onAppointmentAdded(e: any) {
    // debugg
    console.log('onAppointmentUpdated', e.appointmentData);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    //

    this.appointmentService.createAppointment(e.appointmentData).subscribe();
  }

  async onAppointmentUpdated(e: any) {
    // debugg
    console.log('onAppointmentUpdated', e.appointmentData);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    //

    this.appointmentService
      .updateAppointment(e.appointmentData.id, e.appointmentData)
      .subscribe();
  }

  onAppointmentDeleted(e: any) {
    // debugg
    console.log('onAppointmentUpdated', e.appointmentData);
    //

    this.appointmentService.deleteAppointment(e.appointmentData.id).subscribe();
  }

  onAppointmentFormOpening(e: any) {
    // debugg
    console.log('onAppointmentFormOpening', e);
    //
  }
}

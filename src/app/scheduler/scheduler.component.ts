import { Component, OnDestroy, OnInit } from '@angular/core';
import { DxSchedulerModule, DxButtonModule } from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { ChatComponent } from "../chat/chat.component";
import { AppointmentService } from './appointment.service';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { Status } from '../interfaces/d.interface';
import { Subscription } from 'rxjs';

@Component({
  standalone: true,
  imports: [DxSchedulerModule, ChatComponent, SidebarComponent, DxButtonModule],
  selector: 'app-scheduler',
  templateUrl: './scheduler.component.html',
  styleUrls: ['./scheduler.component.css'],
})
export class SchedulerComponent implements OnDestroy, OnInit {
  currentView = 'week';
  currentDate = new Date();
  appointments: any[] = [];

  //subscription to prevent memory leaks
  private getAppointmentSub!: Subscription;
  private createAppointmentSub!: Subscription;
  private updateAppointmentSub!: Subscription;
  private deleteAppointmentSub!: Subscription;

  status: Status[] = [
    { id: 1, text: 'New' },
    { id: 2, text: 'Completed' },
    { id: 3, text: 'In Progress' },
    { id: 4, text: 'Missed' },
  ];

  isCompleted = [
    { id: true, text: 'Completed' },
    { id: false, text: 'Not Completed' },
  ];

  shareAppointment = {
    username: '',
    isShared: false,
  };

  constructor(private appointmentService: AppointmentService) {}

    // Add this method to handle sharing
  onAppointmentFormSharing(username: string, appointmentData: any) {
    if (username) {
      // Call your service to share the appointment
      this.appointmentService.shareAppointment(appointmentData, username).subscribe({
        next: (response) => {
          // Handle successful sharing
          notify('Appointment shared successfully', 'success', 3000);
        },
        error: (error) => {
          notify('Failed to share appointment', 'error', 3000);
        }
      });
    }
  }

  // Add this method to customize the appointment form
  onAppointmentFormCreated(e: any) {
    const form = e.form;

    const shareGroup = {
      itemType: 'group',
      cssClass: 'sharing-group',
      editorOptions: {
        width: '100%',
      },
      items: [
        {
          dataField: 'sharedWith',
          editorType: 'dxTextBox',
          cssClass: 'share-textbox',
          colSpan: 1, // Will use full width
          editorOptions: {
            width: '100%',
          },
          label: { text: 'Share with (username)' },
        },
        {
          itemType: 'button',
          horizontalAlignment: 'left',
          cssClass: ['share-button'],
          colSpan: 1, // Will use full width
          buttonOptions: {
            text: 'Share',
            type: 'success',
            width: '100%',
            onClick: () => {
              const formData = form.option('formData');
              this.onAppointmentFormSharing(formData.sharedWith, formData);
            },
          },
        },
      ],
    };

    // Add the sharing group to the form items
    const items = form.option('items');
    items.push(shareGroup);
    form.option('items', items);
  }

  //life cycle hook
  ngOnInit(): void {
    this.getAppointmentSub = this.appointmentService.appointments$.subscribe(
      (data) => {
        this.appointments = data;
      }
    );
  }
  ngOnDestroy(): void {
    if (this.createAppointmentSub) this.createAppointmentSub.unsubscribe();
    if (this.updateAppointmentSub) this.updateAppointmentSub.unsubscribe();
    if (this.deleteAppointmentSub) this.deleteAppointmentSub.unsubscribe();
    if (this.getAppointmentSub) this.getAppointmentSub.unsubscribe();
  }

  async onAppointmentAdded(e: any) {
    // debugg
    console.log('onAppointmentUpdated', e.appointmentData);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    //
    //naming to prevent memory leaks
    this.createAppointmentSub = this.appointmentService
      .createAppointment(e.appointmentData)
      .subscribe();
  }

  async onAppointmentUpdated(e: any) {
    // debugg
    console.log('onAppointmentUpdated', e.appointmentData);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    //

    this.updateAppointmentSub = this.appointmentService
      .updateAppointment(e.appointmentData.id, e.appointmentData)
      .subscribe();
  }

  onAppointmentDeleted(e: any) {
    // debugg
    console.log('onAppointmentUpdated', e.appointmentData);
    //

    this.deleteAppointmentSub = this.appointmentService
      .deleteAppointment(e.appointmentData.id)
      .subscribe();
  }

  onAppointmentFormOpening(e: any) {
    // debugg
    console.log('onAppointmentFormOpening', e);
    //
  }
}

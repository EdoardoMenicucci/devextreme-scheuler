import { Component, OnDestroy, OnInit } from '@angular/core';
import { DxSchedulerModule, DxButtonModule, DxSelectBoxModule } from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { ChatComponent } from '../chat/chat.component';
import { AppointmentService } from './appointment.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { Status } from '../interfaces/d.interface';
import { from, Subscription } from 'rxjs';
import { ContactService } from '../contact/contact.service';

@Component({
  standalone: true,
  imports: [DxSchedulerModule, ChatComponent, SidebarComponent, DxButtonModule, DxSelectBoxModule],
  selector: 'app-scheduler',
  templateUrl: './scheduler.component.html',
  styleUrls: ['./scheduler.component.css'],
})
export class SchedulerComponent implements OnDestroy, OnInit {
  currentView = 'week';
  currentDate = new Date();
  appointments: any[] = [];
  private formInitialized = false;

  //subscription to prevent memory leaks
  private getAppointmentSub!: Subscription;
  private createAppointmentSub!: Subscription;
  private updateAppointmentSub!: Subscription;
  private deleteAppointmentSub!: Subscription;
  private friendsSub!: Subscription;

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

  friends: any[] = [];

  constructor(
    private appointmentService: AppointmentService,
    private contactService: ContactService
  ) {}

  // Add this method to handle sharing
  onAppointmentFormSharing(username: string, appointmentData: any) {
    if (username) {
      // Call your service to share the appointment
      this.appointmentService
        .shareAppointment(appointmentData, username)
        .subscribe({
          next: (response) => {
            // Handle successful sharing
            notify('Appointment shared successfully', 'success', 3000);
          },
          error: (error) => {
            notify('Failed to share appointment', 'error', 3000);
          },
        });
    }
  }

  // Add this method to customize the appointment form
  onAppointmentFormCreated(e: any) {
    const form = e.form;

    let formItems = form.option('items');

    if (
      !formItems.find(function (i: any) {
        return i.dataField === 'sharedWith';
      })
    ) {
      formItems.push({
        colSpan: 1,
        label: { text: 'Share with friend' },
        editorType: 'dxSelectBox',
        dataField: 'sharedWith',
        cssClass: 'shared-with',
        editorOptions: {
          dataSource: this.friends,
          displayExpr: 'friendUsername',
          valueExpr: 'friendUsername',
          placeholder: 'Select a friend to share with'
        }
      });
      formItems.push({
        itemType: 'button',
        horizontalAlignment: 'left',
        cssClass: 'share-button',
        buttonOptions: {
          text: 'Share',
          type: 'default',
          onClick: () => {
            const formData = form.option('formData');
            if (formData.sharedWith) {
              this.onAppointmentFormSharing(formData.sharedWith, formData);
            }
          }
        }
      });
      form.option('items', formItems);
    }
  }

  //life cycle hook
  ngOnInit(): void {
    this.getAppointmentSub = this.appointmentService.appointments$.subscribe(
      (data) => {
        this.appointments = data;
      }
    );

    // Add friends subscription
    this.friendsSub = this.contactService.getFriends().subscribe(
      (friends) => {
        this.friends = friends;
      }
    );
  }
  ngOnDestroy(): void {
    if (this.createAppointmentSub) this.createAppointmentSub.unsubscribe();
    if (this.updateAppointmentSub) this.updateAppointmentSub.unsubscribe();
    if (this.deleteAppointmentSub) this.deleteAppointmentSub.unsubscribe();
    if (this.getAppointmentSub) this.getAppointmentSub.unsubscribe();
    if (this.friendsSub) this.friendsSub.unsubscribe();
  }

  async onAppointmentAdded(e: any) {
    // debugg
    console.log('onAppointmentUpdated', e.appointmentData);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    //
    //naming to prevent memory leaks
    this.createAppointmentSub = this.appointmentService
      .createAppointment(e.appointmentData)
      .subscribe({
        next: () => {
          notify('Appointment created successfully', 'success', 3000);
        },
        error: (error) => {
          notify('Failed to create appointment', 'error', 3000);
        },
      });
  }

  async onAppointmentUpdated(e: any) {
    // debugg
    console.log('onAppointmentUpdated', e.appointmentData);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    //

    this.updateAppointmentSub = this.appointmentService
      .updateAppointment(e.appointmentData.id, e.appointmentData)
      .subscribe({
        next: () => {
          notify('Appointment updated successfully', 'success', 3000);
        },
        error: (error) => {
          notify('Failed to update appointment', 'error', 3000);
        },
      });
  }

  onAppointmentDeleted(e: any) {
    // debugg
    console.log('onAppointmentUpdated', e.appointmentData);
    //

    this.deleteAppointmentSub = this.appointmentService
      .deleteAppointment(e.appointmentData.id)
      .subscribe({
        next: () => {
          notify('Appointment deleted successfully', 'success', 3000);
        },
        error: (error) => {
          notify('Failed to delete appointment', 'error', 3000);
        },
      });
  }

  onAppointmentFormOpening(e: any) {
    // debugg
    console.log('onAppointmentFormOpening', e);
    //
  }
}

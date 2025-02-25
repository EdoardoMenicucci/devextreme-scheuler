import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  DxSchedulerModule,
  DxButtonModule,
  DxSelectBoxModule,
  DxSchedulerComponent,
} from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { ChatComponent } from '../../components/chat/chat.component';
import { AppointmentService } from './appointment.service';
import { Subject, takeUntil } from 'rxjs';
import { ContactService } from '../contact/contact.service';
import { AuthService } from '../../auth/auth.service';
import { CommonModule } from '@angular/common';
import { getFormItems, getToolbarItems } from './scheduler.config';
import { custom } from 'devextreme/ui/dialog';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    DxSchedulerModule,
    ChatComponent,
    DxButtonModule,
    DxSelectBoxModule,
  ],
  selector: 'app-scheduler',
  templateUrl: './scheduler.component.html',
  styleUrls: ['./scheduler.component.css'],
})
export class SchedulerComponent implements OnDestroy, OnInit {
  //*Usato per avere riferimento del componente Scheduler
  // *ViewChild decorator to get a reference to the DxSchedulerComponent instance
  @ViewChild(DxSchedulerComponent, { static: false })
  scheduler!: DxSchedulerComponent;

  currentView = 'week';
  currentDate = new Date();
  appointments: any[] = [];

  private readonly destroy$ = new Subject<void>();

  isCompleted = [
    { id: true, text: 'Completed' },
    { id: false, text: 'Not Completed' },
  ];

  friends: any[] = [];

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private contactService: ContactService
  ) {}

  //life cycle hook
  ngOnInit(): void {
    this.appointmentService.appointments$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.appointments = data;
      });

    this.authService
      .getAuthState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.appointmentService.loadAppointments();
      });

    this.contactService
      .getFriends()
      .pipe(takeUntil(this.destroy$))
      .subscribe((friends) => {
        this.friends = friends;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // * Hold tracks of the current view type of the scheduler
  //* To Customize the Scheduler based on the view type
  onOptionChanged(e: any) {
    console.log(e);
    if (e.name === 'currentView') {
      this.currentView = e.value;
    }
  }

  // Add this method to handle sharing
  onAppointmentFormSharing(username: string, appointmentData: any) {
    if (username) {
      // Call your service to share the appointment
      this.appointmentService
        .shareAppointment(appointmentData, username)
        .pipe(takeUntil(this.destroy$))
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

  // * Scheduler Customizations
  onAppointmentFormOpening(e: any) {
    const form = e.form;
    const popup = e.popup;

    // Forms Options
    e.popup.option({
      hideOnOutsideClick: true,
      wrapperAttr: { class: 'custom-appointment-form' },
    });

    // Pass the component instance and required references
    const componentContext = {
      component: this,
      form: form,
      popup: popup,
      friends: this.friends,
      isCompleted: this.isCompleted,
      onAppointmentFormSharing: (username: string, appointmentData: any) => {
        this.onAppointmentFormSharing(username, appointmentData);
      },
    };

    // Customize the form layout
    form.option('items', getFormItems(componentContext));

    // Customize the form bottom toolbar
    e.popup.option('toolbarItems', getToolbarItems(componentContext));
    // Custom Form Title
    e.popup.option('showTitle', true);
    e.popup.option(
      'title',
      e.appointmentData?.text ? 'Edit Appointment' : 'Create Appointment'
    );
  }

  //actions
  async onAppointmentAdded(e: any) {
    // debugg
    console.log('onAppointmentUpdated', e.appointmentData);
    // await new Promise((resolve) => setTimeout(resolve, 1000));
    //
    this.appointmentService
      .createAppointment(e.appointmentData)
      .pipe(takeUntil(this.destroy$))
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
    // await new Promise((resolve) => setTimeout(resolve, 1000));
    //

    this.appointmentService
      .updateAppointment(e.appointmentData.id, e.appointmentData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          notify('Appointment updated successfully', 'success', 3000);
        },
        error: (error) => {
          notify('Failed to update appointment', 'error', 3000);
        },
      });
  }

  onAppointmentDeleted(e: any, data: any) {
    // debugg
    console.log('onAppointmentDeleted', data);
    //

    if (e.event) {
      e.event.stopPropagation();
      this.scheduler.instance.hideAppointmentTooltip();
    }

    let customDialog = custom({
      title: 'Delete Appointment',
      message: 'Are you sure you want to delete this appointment?',
      buttons: [
        {
          text: 'Delete',
          type: 'danger',
          stylingMode: 'contained',
          onClick: (e) => {
            return { buttonText: e.component.option('text') };
          },
        },
        {
          text: 'Cancel',
          type: 'defalut',
          stylingMode: 'outlined',
          onClick: (e) => {
            return { buttonText: e.component.option('text') };
          },
        },
      ],
    });

    customDialog.show().then((dialogResult: any) => {
      if (dialogResult.buttonText === 'Delete') {
        this.appointmentService
          .deleteAppointment(data.appointmentData.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              notify('Appointment deleted successfully', 'warning', 3000);
            },
            error: (error) => {
              notify('Failed to delete appointment', 'error', 3000);
            },
          });
      }
    });

    // const result = confirm(
    //   'Are you sure you want to delete this appointment?',
    //   'Delete Appointment'
    // );
    // result.then((dialogResult: boolean) => {
    //   if (dialogResult) {
    //     this.appointmentService
    //       .deleteAppointment(data.appointmentData.id)
    //       .pipe(takeUntil(this.destroy$))
    //       .subscribe({
    //         next: () => {
    //           notify('Appointment deleted successfully', 'warning', 3000);
    //         },
    //         error: (error) => {
    //           notify('Failed to delete appointment', 'error', 3000);
    //         },
    //       });
    //   }
    // });
  }

  toggleAppointmentCompletion(appointmentData: any, e: any) {
    //* Prevent the default behavior of the event (open the form)
    if (e) {
      e.event.stopPropagation();
      this.scheduler.instance.hideAppointmentTooltip();
    }

    const updatedAppointment = {
      ...appointmentData,
      isCompleted: !appointmentData.isCompleted,
    };

    this.appointmentService
      .updateAppointment(updatedAppointment.id, updatedAppointment)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          notify(
            `Appointment marked as ${
              updatedAppointment.isCompleted ? 'completed' : 'incomplete'
            }`,
            'success',
            2000
          );
        },
        error: (error) => {
          notify('Failed to update appointment status', 'error', 2000);
        },
      });
  }

  getAppointmentClass(data: any): string {
    const baseClass = 'appointment-container';
    const statusClass = data.appointmentData.isCompleted
      ? 'appointment-completed'
      : 'appointment-not-completed';
    return `${baseClass} ${statusClass}`;
  }

  formatAppointmentDate(date: Date): string {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

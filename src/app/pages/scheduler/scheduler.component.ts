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
import { Status } from '../../models/d.interface';
import { Subject, takeUntil } from 'rxjs';
import { ContactService } from '../contact/contact.service';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

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

  // status: Status[] = [
  //   { id: 1, text: 'New' },
  //   { id: 2, text: 'Completed' },
  //   { id: 3, text: 'In Progress' },
  //   { id: 4, text: 'Missed' },
  // ];

  isCompleted = [
    { id: true, text: 'Completed' },
    { id: false, text: 'Not Completed' },
  ];

  // shareAppointment = {
  //   username: '',
  //   isShared: false,
  // };

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

    // Add close on outside click configuration
    e.popup.option({
      closeOnOutsideClick: true,
      wrapperAttr: { class: 'custom-appointment-form' },
    });

    form.option('items', [
      {
        dataField: 'text',
        colSpan: 2, // Occupa tutta la larghezza
        label: { text: 'Subject' },
        editorType: 'dxTextBox',
        editorOptions: {
          width: '100%',
        },
      },
      {
        dataField: 'startDate',
        label: { text: 'Start Date' },
        editorType: 'dxDateBox',
        editorOptions: {
          width: '100%',
          type: 'datetime',
        },
      },
      {
        dataField: 'endDate',
        label: { text: 'End Date' },
        editorType: 'dxDateBox',
        editorOptions: {
          width: '100%',
          type: 'datetime',
        },
      },
      {
        dataField: 'allDay',
        label: { text: 'All Day' },
        editorType: 'dxSwitch',
        cssClass: 'custom-switch-container',
        editorOptions: {
          width: '100%',
          switchedOnText: 'Yes',
          switchedOffText: 'No',
        },
      },
      {
        dataField: 'isCompleted',
        label: { text: 'Completion Status' },
        editorType: 'dxSelectBox',
        editorOptions: {
          items: this.isCompleted,
          displayExpr: 'text',
          valueExpr: 'id',
          width: '100%',
        },
      },
      {
        dataField: 'sharedWith',
        colSpan: 1, // Occupa tutta la larghezza
        label: { text: 'Share with friend' },
        editorType: 'dxSelectBox',
        editorOptions: {
          dataSource: this.friends,
          displayExpr: 'friendUsername',
          valueExpr: 'friendUsername',
          width: '100%',
          placeholder: 'Select a friend to share with',
        },
      },
      {
        itemType: 'button',
        colSpan: 1, // Occupa tutta la larghezza
        horizontalAlignment: 'left',
        cssClass: 'mt-4',
        buttonOptions: {
          text: 'Share',
          type: 'default',
          width: '100%', // Bottone largo quanto il form
          onClick: () => {
            const formData = form.option('formData');
            if (formData.sharedWith) {
              this.onAppointmentFormSharing(formData.sharedWith, formData);
            }
          },
        },
      },
    ]);

    e.popup.option('toolbarItems', [
      {
        widget: 'dxButton',
        location: 'after',
        toolbar: 'bottom',
        options: {
          text: 'Save',
          type: 'default',
          stylingMode: 'contained',
          onClick: () => {
             const formData = form.option('formData');
             if (formData) {
               if (formData.id) {
                 // Update existing appointment
                 this.onAppointmentUpdated({ appointmentData: formData });
               } else {
                 // Create new appointment
                 this.onAppointmentAdded({ appointmentData: formData });
               }
               e.popup.hide();
             }
          },
        },
      },
      {
        widget: 'dxButton',
        location: 'after',
        toolbar: 'bottom',
        options: {
          text: 'Cancel',
          type: 'normal',
          stylingMode: 'contained',
          onClick: () => {
            e.popup.hide();
          },
        },
      },
      {
        widget: 'dxButton',
        location: 'before',
        toolbar: 'bottom',
        options: {
          text: 'Delete',
          type: 'danger',
          stylingMode: 'contained',
          onClick: () => {
            console.log('Delete button clicked', e);
            this.onAppointmentDeleted(e, e);
            e.popup.hide();
          },
        },
      },
    ]);
    // To prevent the default items from being shown
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

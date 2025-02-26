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
import { getFormItems, getToolbarItems, PRIORITY_LEVELS, PriorityLevel } from './scheduler.config';
import { custom } from 'devextreme/ui/dialog';

/**
 * Scheduler Component
 * Provides a calendar interface for managing appointments and events
 * @implements OnInit, OnDestroy
 */
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
  /**
   * Reference to the DevExtreme Scheduler component
   * Used to directly interact with the scheduler instance
   */
  @ViewChild(DxSchedulerComponent, { static: false })
  scheduler!: DxSchedulerComponent;

  /** Current view mode of the scheduler ('day', 'week', 'month', etc.) */
  currentView = 'week';

  /** Current date shown in the scheduler */
  currentDate = new Date();

  /** Collection of appointments to display */
  appointments: any[] = [];

  /** Subject used for handling unsubscription from observables */
  private readonly destroy$ = new Subject<void>();

  /** Completion status options for appointments */
  isCompleted = [
    { id: true, text: 'Completed' },
    { id: false, text: 'Not Completed' },
  ];

  /** Priority level options for appointments */
  priority = PRIORITY_LEVELS;

  /** Collection of user's friends for appointment sharing */
  friends: any[] = [];

  /**
   * Creates an instance of SchedulerComponent
   * @param {AppointmentService} appointmentService - Service for managing appointments
   * @param {AuthService} authService - Service for authentication
   * @param {ContactService} contactService - Service for managing contacts
   */
  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private contactService: ContactService
  ) {}

  /**
   * Lifecycle hook that is executed when component is initialized
   * Subscribes to appointments, auth state, and friends data
   */
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

  /**
   * Lifecycle hook that is executed before component is destroyed
   * Unsubscribes from all observables to prevent memory leaks
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Handles changes to scheduler options, especially view type changes
   * @param {any} e - Event data containing changed options
   */
  onOptionChanged(e: any) {
    console.log(e);
    if (e.name === 'currentView') {
      this.currentView = e.value;
    }
  }

  /**
   * Handles appointment sharing with another user
   * @param {string} username - Username of the user to share with
   * @param {any} appointmentData - Appointment data to be shared
   */
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

  /**
   * Customizes the appointment form when it opens
   * @param {any} e - Event data containing form and popup references
   */
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
      priority: this.priority,
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

  /**
   * Handles the creation of a new appointment
   * @param {any} e - Event data containing appointment details
   */
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

  /**
   * Handles updates to existing appointments
   * @param {any} e - Event data containing updated appointment details
   */
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

  /**
   * Handles deletion of appointments with confirmation dialog
   * @param {any} e - Original event that triggered deletion
   * @param {any} data - Data containing appointment details
   */
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
          icon: 'trash',
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
  }

  /**
   * Toggles the completion status of an appointment
   * @param {any} appointmentData - Appointment to toggle
   * @param {any} e - Event object to stop propagation (optional)
   */
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

  /**
   * Determines CSS class for appointment based on completion status
   * @param {any} data - Appointment data
   * @returns {string} CSS class names
   */
  getAppointmentClass(data: any): string {
    const baseClass = 'appointment-container';
    const statusClass = data.appointmentData.isCompleted
      ? 'appointment-completed'
      : 'appointment-not-completed';
    return `${baseClass} ${statusClass}`;
  }

  /**
   * Determines CSS class for appointment based on priority level and completion status
   * @param {string} priority - Priority level text
   * @param {boolean} isCompleted - Completion status
   * @returns {string} CSS class name
   */
  getPriorityClass(priority: string, isCompleted : any): string {
    if (isCompleted) {
      console.log('isCompleted', isCompleted);

      return 'appointment-completed';
    }
    switch (priority) {
      case 'Critical':
        return 'priority-critical';
      case 'High':
        return 'priority-high';
      case 'Medium':
        return 'priority-medium';
      case 'Low':
        return 'priority-low';
      default:
        return 'priority-medium';
    }
  }

  /**
   * Gets the color associated with a priority level
   * @param {string} priority - Priority level text
   * @returns {string} Color hex code
   */
  getPriorityColor(priority: string): string {
    if (priority === 'Medium') {
      return '#d4d4d4'; // light gray for better visibility
    }
    const priorityLevel = PRIORITY_LEVELS.find(p => p.text === priority);
    return priorityLevel ? priorityLevel.color : '#d4d4d4';
  }

  /**
   * Formats appointment date to display time only
   * @param {Date} date - Date to format
   * @returns {string} Formatted time string
   */
  formatAppointmentDate(date: Date): string {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, takeUntil, tap } from 'rxjs';
import { Appointment } from '../../models/appointment.model';

/**
 * Service for managing appointment data
 * Provides methods for CRUD operations on appointments and sharing functionality
 * @implements OnDestroy
 */
@Injectable({
  providedIn: 'root',
})
export class AppointmentService implements OnDestroy {
  /** Base API URL for appointment endpoints */
  private apiUrl = 'http://localhost:5000/api';

  /** Subject that holds and emits the current list of appointments */
  private appointmentsSubject = new BehaviorSubject<Appointment[]>([]);

  /** Subject for handling unsubscription from observables on destroy */
  private destroy$ = new Subject<void>();

  /** Observable that emits the current list of appointments */
  appointments$ = this.appointmentsSubject.asObservable();

  /**
   * Creates an instance of AppointmentService
   * @param {HttpClient} http - Angular HTTP client for making API requests
   */
  constructor(private http: HttpClient) {
    // this.loadAppointments();
  }

  /**
   * Fetches all appointments from the API and updates the appointments subject
   * @returns {void}
   */
  loadAppointments(): void {
    this.http
      .get<Appointment[]>(`${this.apiUrl}/appointment`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          console.log('Appointments received:', data);
          this.appointmentsSubject.next(data);
        },
        error: (error) => console.error('Error loading appointments:', error),
      });
  }

  /**
   * Shares an appointment with another user
   * @param {Appointment} appointmentData - Appointment to be shared
   * @param {string} username - Username of the user to share with
   * @returns {Observable<any>} Observable of the API response
   */
  shareAppointment(
    appointmentData: Appointment,
    username: string
  ): Observable<any> {
    return this.http
      .post(
        `${this.apiUrl}/appointment/share/${appointmentData.id}/${username}`,
        appointmentData
      )
      .pipe(takeUntil(this.destroy$));
  }

  /**
   * Creates a new appointment
   * @param {Appointment} appointment - Appointment data to create
   * @returns {Observable<Appointment>} Observable of the created appointment
   */
  createAppointment(appointment: Appointment): Observable<Appointment> {
    return this.http
      .post<Appointment>(`${this.apiUrl}/appointment`, appointment)
      .pipe(
        tap(() => this.loadAppointments()),
        takeUntil(this.destroy$)
      );
  }

  /**
   * Updates an existing appointment
   * @param {string} id - ID of the appointment to update
   * @param {Appointment} appointment - New appointment data
   * @returns {Observable<Appointment>} Observable of the updated appointment
   */
  updateAppointment(
    id: string,
    appointment: Appointment
  ): Observable<Appointment> {
    return this.http
      .put<Appointment>(`${this.apiUrl}/appointment/${id}`, appointment)
      .pipe(
        tap(() => this.loadAppointments()),
        takeUntil(this.destroy$)
      );
  }

  /**
   * Deletes an appointment
   * @param {string} id - ID of the appointment to delete
   * @returns {Observable<void>} Observable indicating completion
   */
  deleteAppointment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/appointment/${id}`).pipe(
      tap(() => this.loadAppointments()),
      takeUntil(this.destroy$)
    );
  }

  /**
   * Lifecycle hook that is executed before service is destroyed
   * Completes all subjects to prevent memory leaks
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.appointmentsSubject.complete();
  }
}

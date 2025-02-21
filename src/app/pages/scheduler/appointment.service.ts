import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, takeUntil, tap } from 'rxjs';
import { Appointment } from '../../models/appointment.model';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService implements OnDestroy {
  private apiUrl = 'http://localhost:5000/api';
  private appointmentsSubject = new BehaviorSubject<Appointment[]>([]);
  private destroy$ = new Subject<void>();
  appointments$ = this.appointmentsSubject.asObservable();

  constructor(private http: HttpClient) {
    // this.loadAppointments();
  }

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

  createAppointment(appointment: Appointment): Observable<Appointment> {
    return this.http
      .post<Appointment>(`${this.apiUrl}/appointment`, appointment)
      .pipe(
        tap(() => this.loadAppointments()),
        takeUntil(this.destroy$)
      );
  }

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

  deleteAppointment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/appointment/${id}`).pipe(
      tap(() => this.loadAppointments()),
      takeUntil(this.destroy$)
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.appointmentsSubject.complete();
  }
}

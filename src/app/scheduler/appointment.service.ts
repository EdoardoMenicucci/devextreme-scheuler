import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class AppointmentService {
  private apiUrl = 'http://localhost:5000/api';
  private appointmentsSubject = new BehaviorSubject<any[]>([]);
  appointments$ = this.appointmentsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.http.get<any[]>(`${this.apiUrl}/appointment`).subscribe((data) => {
      console.log('Appointment recived:',data);
      this.appointmentsSubject.next(data);
    });
  }

  createAppointment(appointment: any): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/appointment`, appointment)
      .pipe(tap(() => this.loadAppointments()));
  }

  updateAppointment(id: string, appointment: any): Observable<any> {
    return this.http
      .put(`${this.apiUrl}/appointment/${id}`, appointment)
      .pipe(tap(() => this.loadAppointments()));
  }

  deleteAppointment(id: string): Observable<any> {
    return this.http
      .delete(`${this.apiUrl}/appointment/${id}`)
      .pipe(tap(() => this.loadAppointments()));
  }
}

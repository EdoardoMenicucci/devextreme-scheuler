import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  getAppointments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/appointment`);
  }

  createAppointment(appointment: any): Observable<any> {
    console.log(appointment);

    return this.http.post(`${this.apiUrl}/appointment`, appointment);
  }

  updateAppointment(id: string, appointment: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/appointment/${id}`, appointment);
  }

  deleteAppointment(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/appointment/${id}`);
  }
}

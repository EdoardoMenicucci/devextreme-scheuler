import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private apiUrl = 'http://localhost:5000/api/userstatistics';
  private appointmentsSubject = new BehaviorSubject<any>([]);

  statistics$ = this.appointmentsSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {
    this.loadStatistics();
  }

  loadStatistics(startDate? : string, endDate? : string): void {
    let url = `${this.apiUrl}/${this.authService.userId}/fullstatistics`;

    // Add query parameters if dates are provided
    if (startDate != null && endDate != null) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }

    console.log(url);


    this.http
      .get<any[]>(url)
      .subscribe((data) => {
        // console.log('Statistics recived:', data);
        this.appointmentsSubject.next(data);
      });
  }
}

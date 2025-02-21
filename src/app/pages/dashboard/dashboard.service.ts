import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class DashboardService implements OnDestroy {
  private readonly apiUrl = 'http://localhost:5000/api/userstatistics';
  private readonly destroy$ = new Subject<void>();
  private readonly statisticsSubject$ = new BehaviorSubject<any>([]);

  statistics$ = this.statisticsSubject$.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {
    this.loadStatistics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.statisticsSubject$.complete();
  }

  loadStatistics(startDate?: string, endDate?: string): void {
    let url = `${this.apiUrl}/${this.authService.userId}/fullstatistics`;

    if (startDate != null && endDate != null) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }

    this.http.get<any[]>(url)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.statisticsSubject$.next(data);
      });
  }
}

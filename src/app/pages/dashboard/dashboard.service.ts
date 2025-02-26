import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../auth/auth.service';

/**
 * Service responsible for fetching and managing user statistics data for the dashboard
 * Provides an observable stream of statistics that components can subscribe to
 */
@Injectable({
  providedIn: 'root',
})
export class DashboardService implements OnDestroy {
  /** Base API URL for user statistics endpoints */
  private readonly apiUrl = 'http://localhost:5000/api/userstatistics';

  /** Subject used to manage subscription cleanup when the service is destroyed */
  private readonly destroy$ = new Subject<void>();

  /** BehaviorSubject that stores and emits statistics data */
  private readonly statisticsSubject$ = new BehaviorSubject<any>([]);

  /** Observable stream of statistics data that components can subscribe to */
  statistics$ = this.statisticsSubject$.asObservable();

  /**
   * Creates an instance of DashboardService
   * @param http - HttpClient for making API requests
   * @param authService - Service providing authentication details and user information
   */
  constructor(private http: HttpClient, private authService: AuthService) {
    this.loadStatistics();
  }

  /**
   * Cleanup method that completes all observables when the service is destroyed
   * to prevent memory leaks
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.statisticsSubject$.complete();
  }

  /**
   * Loads statistics data from the API and updates the statistics observable
   * @param startDate - Optional start date for filtering statistics (format: YYYY-MM-DD)
   * @param endDate - Optional end date for filtering statistics (format: YYYY-MM-DD)
   */
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

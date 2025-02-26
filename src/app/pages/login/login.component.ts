import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription, Subject, takeUntil } from 'rxjs';
import { loginForm } from '../../models/d.interface';
import { AuthService } from '../../auth/auth.service';
import notify from 'devextreme/ui/notify';
import { ErrorHandlerService } from '../../auth/error-handler.service';

/**
 * Component for user login functionality
 * @description Handles user authentication including form submission and error handling
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit, OnDestroy {
  /** Subject for handling component destruction and cleaning up subscriptions */
  private readonly destroy$ = new Subject<void>();

  /** Flag indicating whether the user is authenticated */
  isAuthenticated: boolean = false;

  /** Error message to display to the user */
  errorMessage: string = '';

  /** Login form data model */
  public loginForm: loginForm = {
    email: '',
    password: '',
  };

  /**
   * Constructor for LoginComponent
   * @param authService - Service for authentication operations
   * @param router - Angular router for navigation
   * @param errorHandler - Service for handling authentication errors
   */
  constructor(
    private authService: AuthService,
    private router: Router,
    private errorHandler: ErrorHandlerService
  ) {}

  /**
   * Lifecycle hook that is called after component initialization
   * Checks authentication status and subscribes to auth errors
   */
  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.handleSuccessfulAuth();
    }

    this.authService.getAuthErrors()
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => {
        this.isAuthenticated = !error;
        this.errorMessage = error?.message ?? '';
        this.errorHandler.handleAuthError(error);
      });
  }

  /**
   * Lifecycle hook that is called when the component is destroyed
   * Completes the destroy subject to prevent memory leaks
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Handles successful authentication process
   * Updates authentication state and navigates to scheduler
   * @private
   */
  private handleSuccessfulAuth(): void {
    this.isAuthenticated = true;
    this.router
      .navigate(['/'], { skipLocationChange: true })
      .then(() => this.router.navigate(['/scheduler']));
  }

  /**
   * Handles the login form submission
   * Calls the auth service to authenticate the user and handles response
   */
  handleLogin(): void {
    this.authService
      .login(this.loginForm)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.handleSuccessfulAuth(),
        error: () => notify('Errore di autenticazione', 'error', 3000),
      });
  }
}

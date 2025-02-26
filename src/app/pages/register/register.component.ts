import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { registerForm } from '../../models/d.interface';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth.service';
import notify from 'devextreme/ui/notify';
import { ErrorHandlerService } from '../../auth/error-handler.service';

/**
 * Component for user registration functionality
 * @description Handles the user registration process including form submission and error handling
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit, OnDestroy {
  /** Subject for handling component destruction and cleaning up subscriptions */
  private readonly destroy$ = new Subject<void>();

  /** Flag indicating whether the user is authenticated */
  isAuthenticated: boolean = false;

  /** Error message to display to the user */
  errorMessage: string = '';

  /** Registration form data model */
  public registerForm: registerForm = {
    username: '',
    email: '',
    password: '',
  };

  /**
   * Constructor for RegisterComponent
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
   * Handles the registration form submission
   * Calls the auth service to register the user and handles response
   */
  handleRegister(): void {
    this.authService
      .register(this.registerForm)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.handleSuccessfulAuth(),
        error: () => notify('Errore durante la registrazione', 'error', 3000),
      });
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription, Subject, takeUntil } from 'rxjs';
import { loginForm } from '../../models/d.interface';
import { AuthService } from '../../auth/auth.service';
import notify from 'devextreme/ui/notify';
import { ErrorHandlerService } from '../../auth/error-handler.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  isAuthenticated: boolean = false;
  errorMessage: string = '';

  public loginForm: loginForm = {
    email: '',
    password: '',
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private errorHandler: ErrorHandlerService
  ) {}

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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private handleSuccessfulAuth(): void {
    this.isAuthenticated = true;
    this.router
      .navigate(['/'], { skipLocationChange: true })
      .then(() => this.router.navigate(['/scheduler']));
  }

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

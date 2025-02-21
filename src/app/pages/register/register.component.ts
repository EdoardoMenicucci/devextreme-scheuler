import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { registerForm } from '../../models/d.interface';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth.service';
import notify from 'devextreme/ui/notify';
import { ErrorHandlerService } from '../../auth/error-handler.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  isAuthenticated: boolean = false;
  errorMessage: string = '';

  public registerForm: registerForm = {
    username: '',
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

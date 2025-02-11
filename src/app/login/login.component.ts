import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { loginForm } from '../interfaces/d.interface';
import { AuthService } from '../auth/auth.service';
import notify from 'devextreme/ui/notify';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})

export class LoginComponent implements OnInit, OnDestroy {
  isAuthenticated: boolean = false;
  private authErrorSubscription!: Subscription;
  errorMessage: string = '';

  public loginForm: loginForm = {
    email: '',
    password: '',
  };

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Controlla autenticazione iniziale
    if (this.authService.isAuthenticated()) {
      this.isAuthenticated = true;
      this.router.navigate(['/'], { skipLocationChange: true }).then(() => {
        this.router.navigate(['/scheduler']);
      });
    }
    // Sottoscrizione agli errori di autenticazione
    this.authErrorSubscription = this.authService
      .getAuthErrors()
      .subscribe((error) => {
        if (error) {
          this.isAuthenticated = false;
          this.errorMessage = error.message;

          switch (error.type) {
            case 'TOKEN_EXPIRED':
              notify('Sessione scaduta, effettua nuovamente il login', 'error', 3000);
              this.router.navigate(['/login']);
              break;
            case 'UNAUTHORIZED':
              notify('Non autorizzato', 'error', 3000);
              this.router.navigate(['/signin']);
              break;
            case 'NETWORK_ERROR':
              notify('Errore di rete', 'error', 3000);
              this.router.navigate(['/home']);
              break;
          }
        } else {
          this.errorMessage = '';
        }
      });
  }

  handleLogin(): void {
    this.authService.login(this.loginForm).subscribe({
      next: () => {
        this.isAuthenticated = true;
        this.router.navigate(['/'], { skipLocationChange: true }).then(() => {
          this.router.navigate(['/scheduler']);
        });
      },
      error: (error) => {
        notify('Errore di autenticazione', 'error', 3000);
        console.error('Registration failed:', error);
      },
    });
  }

  ngOnDestroy(): void {
    // Chiudi la sottoscrizione memory leaks
    if (this.authErrorSubscription) {
      this.authErrorSubscription.unsubscribe();
    }
  }
}

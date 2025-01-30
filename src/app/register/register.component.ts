import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { registerForm } from '../interfaces/d.interface';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  isAuthenticated: boolean = false;
  private authErrorSubscription!: Subscription;

  public registerForm: registerForm = {
    username: '',
    email: '',
    password: '',
  };

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    // Controlla autenticazione iniziale
    if (this.authService.isAuthenticated()) {
      this.isAuthenticated = true;
      this.router.navigate(['/scheduler']);
    }
    // Sottoscrizione agli errori di autenticazione
    this.authErrorSubscription = this.authService
      .getAuthErrors()
      .subscribe(() => {
        this.isAuthenticated = false;
        // Opzionale: mostra messaggio all'utente
        console.log('Sessione scaduta, effettua nuovamente il login');
      });
  }

  handleRegister(): void {
    this.authService.register(this.registerForm).subscribe({
      next: () => {
        this.isAuthenticated = true;
        this.router.navigate(['/scheduler']);
      },
      error: (error : Error) => {
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

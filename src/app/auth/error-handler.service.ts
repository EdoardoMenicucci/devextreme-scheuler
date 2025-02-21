import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import notify from 'devextreme/ui/notify';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  constructor(private router: Router) {}

  handleAuthError(error: { type: string; message: string } | null): void {
    if (!error) return;

    const errorActions: { [key: string]: () => void } = {
      TOKEN_EXPIRED: () => {
        notify('Sessione scaduta, effettua nuovamente il login', 'error', 3000);
        this.router.navigate(['/login']);
      },
      UNAUTHORIZED: () => {
        notify('Non autorizzato', 'error', 3000);
        this.router.navigate(['/signin']);
      },
      NETWORK_ERROR: () => {
        notify('Errore di rete', 'error', 3000);
        this.router.navigate(['/home']);
      },
    };

    const action = errorActions[error.type];
    if (action) action();
  }
}

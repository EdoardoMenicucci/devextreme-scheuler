import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import notify from 'devextreme/ui/notify';

/**
 * Servizio per la gestione centralizzata degli errori di autenticazione.
 * Si occupa di mostrare le notifiche appropriate e reindirizzare l'utente
 * in base al tipo di errore ricevuto.
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  /**
   * Costruttore del servizio ErrorHandlerService
   * @param router - Il servizio Router di Angular per gestire la navigazione
   */
  constructor(private router: Router) {}

  /**
   * Gestisce gli errori di autenticazione in base al tipo specificato
   *
   * @param error - Oggetto contenente informazioni sull'errore
   * @param error.type - Tipo di errore (TOKEN_EXPIRED, UNAUTHORIZED, NETWORK_ERROR)
   * @param error.message - Messaggio associato all'errore
   *
   * @example
   * errorHandler.handleAuthError({ type: 'TOKEN_EXPIRED', message: 'Il token è scaduto' });
   */
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

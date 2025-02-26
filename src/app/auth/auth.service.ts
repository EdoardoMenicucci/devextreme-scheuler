import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { loginForm, registerForm, registerBackendForm } from '../models/d.interface';
import { BehaviorSubject, catchError, Observable, Subject, tap, throwError } from 'rxjs';
import { ErrorHandlerService } from './error-handler.service';

/**
 * Servizio di autenticazione per gestire login, registrazione e stato dell'utente
 * Mantiene anche la persistenza locale dei dati di autenticazione
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  private readonly TOKEN_KEY = 'chat_token';
  private readonly USER_ID = 'user_id';
  private readonly USER_NAME = 'user_name';
  private readonly CHATS_ID = 'chats_id';

  private readonly AuthErrorType = {
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    UNAUTHORIZED: 'UNAUTHORIZED',
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    NETWORK_ERROR: 'NETWORK_ERROR',
  } as const;

  // Subjects
  private destroy$ = new Subject<void>();
  private authError$ = new BehaviorSubject<{ type: string; message: string } | null>(null);
  private authState$ = new BehaviorSubject<boolean>(false);

  private token: string = '';
  public username: string | null = null;
  public userId: number | null = null;
  public chatsId: number[] | null = null;

  /**
   * Inizializza il servizio di autenticazione e recupera i dati salvati
   * @param http - Il client HTTP per le richieste API
   * @param errorHandler - Servizio per la gestione degli errori di autenticazione
   */
  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {
    this.initializeFromStorage();
  }

  /**
   * Esegue la pulizia delle risorse quando il servizio viene distrutto
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.authError$.complete();
    this.authState$.complete();
  }

  /**
   * Inizializza lo stato di autenticazione dal localStorage
   * Recupera token, ID utente, nome utente e ID delle chat
   * @private
   */
  private initializeFromStorage() {
    const savedToken = localStorage.getItem(this.TOKEN_KEY);
    if (savedToken) {
      //debug
      // console.log('Token:', savedToken);
      this.setToken(savedToken);
    }
    const savedUserId = localStorage.getItem(this.USER_ID);
    if (savedUserId) {
      //debug
      // console.log('User ID:', savedUserId);
      this.userId = parseInt(savedUserId, 10);
    } else {
      console.error('User ID not found');
    }
    const savedUsername = localStorage.getItem(this.USER_NAME);
    if (savedUsername) {
      //debug
      // console.log('Username:', savedUsername);
      this.username = savedUsername;
    }
    const savedChatsId = localStorage.getItem(this.CHATS_ID);
    if (savedChatsId) {
      //debug
      // console.log('Chats ID:', savedChatsId);
      this.chatsId = JSON.parse(savedChatsId);
    }
  }

  /**
   * Restituisce il token di autenticazione corrente
   * @returns {string} Il token JWT di autenticazione
   */
  getToken(): string {
    return this.token;
  }

  /**
   * Imposta il token di autenticazione e lo salva nel localStorage
   * @param {string} token - Il token JWT di autenticazione
   */
  setToken(token: string): void {
    this.token = token;
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Imposta gli ID delle chat dell'utente e li salva nel localStorage
   * @param {number[]} chatsId - Array di ID delle chat associate all'utente
   * @private
   */
  private setChatsId(chatsId: number[]) {
    this.chatsId = chatsId;
    localStorage.setItem(this.CHATS_ID, JSON.stringify(chatsId));
  }

  /**
   * Imposta l'ID dell'utente e lo salva nel localStorage
   * @param {number} userId - L'ID dell'utente autenticato
   */
  setUserId(userId: number): void {
    this.userId = userId;
    localStorage.setItem(this.USER_ID, userId.toString());
  }

  /**
   * Imposta il nome utente e lo salva nel localStorage
   * @param {string} username - Il nome dell'utente autenticato
   */
  setUsername(username: string): void {
    this.username = username;
    localStorage.setItem(this.USER_NAME, username);
  }

  /**
   * Effettua il login dell'utente con le credenziali fornite
   * @param {loginForm} credentials - Credenziali di login (email/username e password)
   * @returns {Observable<any>} Observable con la risposta del server
   */
  login(credentials: loginForm): Observable<any> {
    return this.http.post('http://localhost:5000/auth/login', credentials).pipe(
      tap(this.handleAuthSuccess.bind(this)),
      catchError(this.handleAuthError.bind(this))
    );
  }

  /**
   * Registra un nuovo utente con le credenziali fornite
   * @param {registerForm} credentials - Dati di registrazione dell'utente
   * @returns {Observable<any>} Observable con la risposta del server
   */
  register(credentials: registerForm): Observable<any> {
    const backendCredentials: registerBackendForm = {
      username: credentials.username,
      email: credentials.email,
      password: credentials.password,
    };

    return this.http.post('http://localhost:5000/auth/register', backendCredentials).pipe(
      tap(this.handleAuthSuccess.bind(this)),
      catchError(this.handleAuthError.bind(this))
    );
  }

  /**
   * Gestisce la risposta di successo dall'autenticazione
   * Salva token, ID utente, nome utente e ID delle chat
   * @param {any} response - Risposta dal server di autenticazione
   * @private
   */
  private handleAuthSuccess(response: any): void {
    if (response.token) {
      this.setToken(response.token);
      this.authError$.next(null);
    }
    if (response.userId) {
      this.setUserId(response.userId);
    }
    if (response.username) {
      this.setUsername(response.username);
    }
    if (response.chatIds) {
      this.setChatsId(response.chatIds);
    }
    this.authState$.next(true);
  }

  /**
   * Gestisce gli errori di autenticazione
   * @param {HttpErrorResponse} error - Errore HTTP della risposta
   * @returns {Observable<never>} Observable che emette l'errore
   * @private
   */
  private handleAuthError(error: HttpErrorResponse): Observable<never> {
    const errorMap: { [key: number]: { type: string; message: string } } = {
      401: { type: this.AuthErrorType.UNAUTHORIZED, message: 'Invalid credentials' },
      403: { type: this.AuthErrorType.TOKEN_EXPIRED, message: 'Session expired' },
      0: { type: this.AuthErrorType.NETWORK_ERROR, message: 'Network error occurred' }
    };

    const errorInfo = errorMap[error.status] || errorMap[0];
    this.authError$.next(errorInfo);
    this.errorHandler.handleAuthError(errorInfo);
    this.logout();
    return throwError(() => error);
  }

  /**
   * Esegue il logout dell'utente corrente
   * Rimuove tutti i dati di autenticazione dal localStorage
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_ID);
    localStorage.removeItem(this.USER_NAME);
    localStorage.removeItem(this.CHATS_ID);
    this.chatsId = null;
    this.username = null;
    this.userId = null;
    this.token = '';
  }

  /**
   * Verifica se l'utente è attualmente autenticato
   * @returns {boolean} true se l'utente è autenticato, false altrimenti
   */
  isAuthenticated(): boolean {
    return !!this.token && !!this.userId;
  }

  /**
   * Restituisce un observable dello stato di autenticazione
   * @returns {Observable<boolean>} Observable che emette lo stato di autenticazione corrente
   */
  getAuthState(): Observable<boolean> {
    return this.authState$.asObservable();
  }

  /**
   * Restituisce un observable degli errori di autenticazione
   * @returns {Observable<{type: string, message: string} | null>} Observable che emette gli errori di autenticazione
   */
  getAuthErrors(): Observable<{ type: string; message: string } | null> {
    return this.authError$.asObservable();
  }
}

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { loginForm, registerForm, registerBackendForm } from '../models/d.interface';
import { BehaviorSubject, catchError, Observable, Subject, tap, throwError } from 'rxjs';
import { ErrorHandlerService } from './error-handler.service';

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

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {
    this.initializeFromStorage();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.authError$.complete();
    this.authState$.complete();
  }

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

  getToken(): string {
    return this.token;
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private setChatsId(chatsId: number[]) {
    this.chatsId = chatsId;
    localStorage.setItem(this.CHATS_ID, JSON.stringify(chatsId));
  }

  setUserId(userId: number): void {
    this.userId = userId;
    localStorage.setItem(this.USER_ID, userId.toString());
  }

  setUsername(username: string): void {
    this.username = username;
    localStorage.setItem(this.USER_NAME, username);
  }

  login(credentials: loginForm): Observable<any> {
    return this.http.post('http://localhost:5000/auth/login', credentials).pipe(
      tap(this.handleAuthSuccess.bind(this)),
      catchError(this.handleAuthError.bind(this))
    );
  }

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

  isAuthenticated(): boolean {
    return !!this.token && !!this.userId;
  }

  getAuthState(): Observable<boolean> {
    return this.authState$.asObservable();
  }

  getAuthErrors(): Observable<{ type: string; message: string } | null> {
    return this.authError$.asObservable();
  }
}

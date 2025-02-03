import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  loginForm,
  registerForm,
  registerBackendForm,
} from '../interfaces/d.interface';
import { BehaviorSubject, catchError, Observable, Subject, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
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

  private authError = new BehaviorSubject<{
    type: string;
    message: string;
  } | null>(null);

  private token: string = '';
  public username: string | null = null;
  public userId: number | null = null;
  public chatsId: number[] | null = null;

  constructor(private http: HttpClient) {
    this.initializeFromStorage();
  }

  private initializeFromStorage() {
    const savedToken = localStorage.getItem(this.TOKEN_KEY);
    if (savedToken) {
      console.log('Token:', savedToken);
      this.setToken(savedToken);
    }
    const savedUserId = localStorage.getItem(this.USER_ID);
    if (savedUserId) {
      console.log('User ID:', savedUserId);
      this.userId = parseInt(savedUserId, 10);
    } else {
      console.error('User ID not found');
    }
    const savedUsername = localStorage.getItem(this.USER_NAME);
    if (savedUsername) {
      console.log('Username:', savedUsername);
      this.username = savedUsername;
    }
    const savedChatsId = localStorage.getItem(this.CHATS_ID);
    if (savedChatsId) {
      console.log('Chats ID:', savedChatsId);
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
      tap((response: any) => {
        console.log('Response:', response);

        if (response.token) {
          this.setToken(response.token);
          //reset auth error
          this.authError.next(null);
        }
        if (response.userId) this.setUserId(response.userId);
        if (response.username) this.setUsername(response.username);
        if (response.chatIds) this.setChatsId(response.chatIds);
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.handleAuthError(
            this.AuthErrorType.UNAUTHORIZED,
            'Invalid credentials'
          );
        } else if (error.status === 403) {
          this.handleAuthError(
            this.AuthErrorType.TOKEN_EXPIRED,
            'Session expired'
          );
        } else {
          this.handleAuthError(
            this.AuthErrorType.NETWORK_ERROR,
            'Network error occurred'
          );
        }
        return throwError(() => error);
      })
    );
  }

  register(credentials: registerForm): Observable<any> {
    const backendCredentials: registerBackendForm = {
      username: credentials.username,
      email: credentials.email,
      password: credentials.password,
    };

    return this.http
      .post('http://localhost:5000/auth/register', backendCredentials)
      .pipe(
        tap((response: any) => {
          if (response.token) {
            this.setToken(response.token);
            //reset auth error
            this.authError.next(null);
          }
          if (response.userId) {
            this.setUserId(response.userId);
            console.log('User ID:', this.userId);
          }
          if (response.username) this.setUsername(response.username);
        }),
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            this.handleAuthError(
              this.AuthErrorType.UNAUTHORIZED,
              'UNAUTHORIZED'
            );
          } else if (error.status === 403) {
            this.handleAuthError(
              this.AuthErrorType.TOKEN_EXPIRED,
              'Session expired'
            );
          } else {
            this.handleAuthError(
              this.AuthErrorType.NETWORK_ERROR,
              'Network error occurred'
            );
          }
          return throwError(() => error);
        })
      );
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


  getAuthErrors(): Observable<{ type: string; message: string } | null> {
    return this.authError.asObservable();
  }
  // Method to emit auth errors
  private handleAuthError(type: string, message: string) {
    this.authError.next({ type, message });
    this.logout(); // Automatically logout on auth errors
  }
}

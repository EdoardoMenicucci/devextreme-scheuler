import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  loginForm,
  registerForm,
  registerBackendForm,
} from '../interfaces/d.interface';
import { Observable, Subject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'chat_token';
  private readonly USER_ID = 'user_id';
  private readonly USER_NAME = 'user_name';

  private token: string = '';
  public username: string | null = null;
  private authError = new Subject<boolean>();
  public userId: number | null = null;

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
  }

  getToken(): string {
    return this.token;
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem(this.TOKEN_KEY, token);
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

        if (response.token) this.setToken(response.token);
        if (response.userId) this.setUserId(response.userId);
        if (response.username) this.setUsername(response.username);
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
          }
          if (response.userId) {
            this.setUserId(response.userId);
            console.log('User ID:', this.userId);
          }
          if (response.username) this.setUsername(response.username);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_ID);
    localStorage.removeItem(this.USER_NAME);
    this.username = null;
    this.userId = null;
    this.token = '';
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.userId;
  }

  getAuthErrors(): Observable<boolean> {
    return this.authError.asObservable();
  }
}

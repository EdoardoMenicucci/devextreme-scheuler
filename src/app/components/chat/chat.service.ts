import { Injectable, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject, tap, catchError, firstValueFrom, Subject, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { User, Message, MessageEnteredEvent } from 'devextreme/ui/chat';

import { AppointmentService } from '../../pages/scheduler/appointment.service';
import { AuthService } from '../../auth/auth.service';

import { firstLetterToUpperCase } from '../../utils/generic';

import notify from 'devextreme/ui/notify';

@Injectable({
  providedIn: 'root',
})
export class ChatService implements OnDestroy {
  private readonly apiUrl = 'http://localhost:5000';
  private readonly destroy$ = new Subject<void>();
  private readonly messagesSubject$ = new BehaviorSubject<Message[]>([]);
  private readonly userChatTypingUsers$ = new BehaviorSubject<User[]>([]);
  private readonly supportChatTypingUsers$ = new BehaviorSubject<Message[]>([]);

  public messages: Message[] = [];
  private chats: any[] = [];
  private date: Date;

  currentUser: User = {
    id: 1,
    name: 'Err',
  };

  supportAgent: User = {
    id: 'gemini-api',
    name: 'Scheduler Support Agent',
  };

  constructor(
    private appointmentService: AppointmentService,
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.date = new Date();
    this.onInit();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.messagesSubject$.complete();
    this.userChatTypingUsers$.complete();
    this.supportChatTypingUsers$.complete();
  }

  onInit() {
    this.date.setHours(0, 0, 0, 0);
    this.currentUser.id = this.authService.userId ?? 0;
    this.currentUser.name = this.authService.username ?? 'Err';

    this.messages = [];
    this.messagesSubject$.next(this.messages);
    this.userChatTypingUsers$.next([]);
    this.supportChatTypingUsers$.next([]);
  }

  //Main functions
  sendMessageToAI(message: string): Observable<any> {

    const payload = {
      text: message,
    };

    // Add user message immediately
    this.messages.push({
      text: message,
      timestamp: this.getTimestamp(this.date),
      author: this.currentUser,
    });
    this.messagesSubject$.next(this.messages);

    // Assistant typing (stato "in digitazione")
    this.supportChatOnTypingStart();

    return this.http.post(`${this.apiUrl}/api/message`, payload).pipe(
      tap((response: any) => {
        // debug
        console.log('Response:', response);
        //
        // Remove asistant typing
        this.supportChatOnTypingEnd();

        if (response.aiResponse) {
          this.messages.push({
            author: this.supportAgent,
            text: response.aiResponse.text,
            timestamp: this.getTimestamp(this.date),
          });

          this.messagesSubject$.next(this.messages);
          this.appointmentService.loadAppointments();
        }
      }),
      catchError(this.handleError.bind(this))
    );
  }

  private handleError(error: any): Observable<never> {
    this.supportChatOnTypingEnd();
    console.error('Error:', error);

    const errorMessages: { [key: string]: string } = {
      401: 'You are not authorized to perform this action',
      400: 'Bad request. Please check your input',
      default: 'An unexpected error occurred'
    };

    const status = (error as { status: number }).status;

    notify(errorMessages[status.toString()] || errorMessages['default'], 'error', 3000);
    return new Observable<never>();
  }

  getUserChats(): Observable<any> {
    return this.http
      .get(`${this.apiUrl}/chat/user/${this.authService.userId}/chats`)
      .pipe(
        tap((response: any) => {
          // debug
          // console.log('Response:', response);
          //
          this.chats = response;
        }),
        catchError(this.handleError)
      );
  }

  getUserChatMessages(chatId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/chat/chat/${chatId}/messages`).pipe(
      tap((response: any) => {
        console.log('Response:', response);
        this.messages = response;
      }),
      catchError(this.handleError)
    );
  }

  async loadChatMessages(chatId: number): Promise<void> {
    try {
      const response = (await firstValueFrom(
        this.http.get(`${this.apiUrl}/chat/chat/${chatId}/messages`)
      )) as any[];
      this.onInit();
      response.forEach((element) => {

        if (element.author == 'model') {
          element.author = this.supportAgent;
        } else {
          element.author = this.currentUser;
        }

        this.messages.push({
          author: element.author,
          text: element.text,
          timestamp: element.timestamp,
        });
      });
      //debug
      // console.log('Messages loaded:', this.messages);
      //
    } catch (error: any) {
      this.handleError(error);
    }
  }

  async onMessageEntered(event: MessageEnteredEvent) {
    // this.sendMessageToAI(event.message!.text || '');
    if (event.message) {
      this.messages = [...this.messages];
      this.messagesSubject$.next(this.messages);
    }
  }

  clearMessages(): void {
    this.messages = [];
    this.messagesSubject$.next(this.messages);
  }

  //utilities
  get userChatTypingUsers(): Observable<User[]> {
    return this.userChatTypingUsers$.asObservable();
  }

  get supportChatTypingUsers(): Observable<Message[]> {
    return this.supportChatTypingUsers$.asObservable();
  }

  get messages$(): Observable<Message[]> {
    return this.messagesSubject$.asObservable();
  }

  getUsers(): User[] {
    return [this.currentUser, this.supportAgent];
  }

  getTimestamp(date: Date, offsetMinutes = 0): number {
    return date.getTime() + offsetMinutes * 60000;
  }

  firstLetterToUpperCase(text: string): string {
    return firstLetterToUpperCase(text);
  }

  userChatOnTypingStart() {
    this.userChatTypingUsers$.next([this.currentUser]);
    // console.log('userChatOnTypingStart', this.supportChatTypingUsers$);
  }

  userChatOnTypingEnd() {
    this.supportChatTypingUsers$.next([]);
    // console.log('userChatOnTypingEnd', this.supportChatTypingUsers$);
  }

  supportChatOnTypingStart() {
    this.userChatTypingUsers$.next([this.supportAgent]);
  }

  supportChatOnTypingEnd() {
    this.userChatTypingUsers$.next([]);
  }
}

import { Injectable, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject, tap, catchError, firstValueFrom, Subject, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { User, Message, MessageEnteredEvent } from 'devextreme/ui/chat';

import { AppointmentService } from '../../pages/scheduler/appointment.service';
import { AuthService } from '../../auth/auth.service';

import { firstLetterToUpperCase } from '../../utils/generic';

import notify from 'devextreme/ui/notify';

/**
 * Service responsible for handling chat functionality including sending messages
 * and integrating with AI assistant functionality.
 */
@Injectable({
  providedIn: 'root',
})
export class ChatService implements OnDestroy {
  /** Base API URL for chat-related operations */
  private readonly apiUrl = 'http://localhost:5000';
  /** Subject to signal component destruction */
  private readonly destroy$ = new Subject<void>();
  /** Subject containing chat messages */
  private readonly messagesSubject$ = new BehaviorSubject<Message[]>([]);
  /** Subject containing users currently typing in user chat */
  private readonly userChatTypingUsers$ = new BehaviorSubject<User[]>([]);
  /** Subject containing support chat typing status */
  private readonly supportChatTypingUsers$ = new BehaviorSubject<Message[]>([]);

  /** Array of current chat messages */
  public messages: Message[] = [];
  /** Array of user chats */
  private chats: any[] = [];
  /** Current date reference */
  private date: Date;

  /** Current user information */
  currentUser: User = {
    id: 1,
    name: 'Err',
  };

  /** Support agent information */
  supportAgent: User = {
    id: 'gemini-api',
    name: 'Scheduler Support Agent',
  };

  /**
   * Creates an instance of ChatService
   * @param appointmentService - Service to manage appointments
   * @param http - Angular HttpClient for API requests
   * @param authService - Service to manage authentication
   */
  constructor(
    private appointmentService: AppointmentService,
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.date = new Date();
    this.onInit();
  }

  /**
   * Cleanup on component destruction
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.messagesSubject$.complete();
    this.userChatTypingUsers$.complete();
    this.supportChatTypingUsers$.complete();
  }

  /**
   * Initialize chat service state
   */
  onInit() {
    this.date.setHours(0, 0, 0, 0);
    this.currentUser.id = this.authService.userId ?? 0;
    this.currentUser.name = this.authService.username ?? 'Err';

    this.messages = [];
    this.messagesSubject$.next(this.messages);
    this.userChatTypingUsers$.next([]);
    this.supportChatTypingUsers$.next([]);
  }

  /**
   * Sends a message to the AI assistant
   * @param message - Text message to be sent to AI
   * @returns Observable with AI response
   */
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

  /**
   * Handles errors from HTTP requests
   * @param error - The error object
   * @returns Empty observable to maintain stream
   */
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

  /**
   * Retrieves all chats for the current user
   * @returns Observable with chats data
   */
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

  /**
   * Retrieves messages for a specific chat
   * @param chatId - ID of the chat to retrieve messages for
   * @returns Observable with chat messages
   */
  getUserChatMessages(chatId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/chat/chat/${chatId}/messages`).pipe(
      tap((response: any) => {
        console.log('Response:', response);
        this.messages = response;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Loads messages for a specific chat and formats them
   * @param chatId - ID of the chat to load messages for
   */
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

  /**
   * Handles message entered event from chat component
   * @param event - The message entered event
   */
  async onMessageEntered(event: MessageEnteredEvent) {
    // this.sendMessageToAI(event.message!.text || '');
    if (event.message) {
      this.messages = [...this.messages];
      this.messagesSubject$.next(this.messages);
    }
  }

  /**
   * Clears all messages in the chat
   */
  clearMessages(): void {
    this.messages = [];
    this.messagesSubject$.next(this.messages);
  }

  /**
   * Gets users currently typing in the user chat
   * @returns Observable of users currently typing
   */
  get userChatTypingUsers(): Observable<User[]> {
    return this.userChatTypingUsers$.asObservable();
  }

  /**
   * Gets users currently typing in the support chat
   * @returns Observable of messages indicating typing status
   */
  get supportChatTypingUsers(): Observable<Message[]> {
    return this.supportChatTypingUsers$.asObservable();
  }

  /**
   * Gets the messages observable
   * @returns Observable of chat messages
   */
  get messages$(): Observable<Message[]> {
    return this.messagesSubject$.asObservable();
  }

  /**
   * Gets list of users in the chat
   * @returns Array of users in the chat
   */
  getUsers(): User[] {
    return [this.currentUser, this.supportAgent];
  }

  /**
   * Generates a timestamp with optional offset
   * @param date - Base date for timestamp
   * @param offsetMinutes - Optional offset in minutes
   * @returns Timestamp in milliseconds
   */
  getTimestamp(date: Date, offsetMinutes = 0): number {
    return date.getTime() + offsetMinutes * 60000;
  }

  /**
   * Converts first letter of text to uppercase
   * @param text - The input text
   * @returns Text with first letter capitalized
   */
  firstLetterToUpperCase(text: string): string {
    return firstLetterToUpperCase(text);
  }

  /**
   * Sets current user as typing in user chat
   */
  userChatOnTypingStart() {
    this.userChatTypingUsers$.next([this.currentUser]);
    // console.log('userChatOnTypingStart', this.supportChatTypingUsers$);
  }

  /**
   * Clears typing status in user chat
   */
  userChatOnTypingEnd() {
    this.supportChatTypingUsers$.next([]);
    // console.log('userChatOnTypingEnd', this.supportChatTypingUsers$);
  }

  /**
   * Sets support agent as typing in support chat
   */
  supportChatOnTypingStart() {
    this.userChatTypingUsers$.next([this.supportAgent]);
  }

  /**
   * Clears typing status in support chat
   */
  supportChatOnTypingEnd() {
    this.userChatTypingUsers$.next([]);
  }
}

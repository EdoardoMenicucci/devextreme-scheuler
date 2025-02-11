import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, tap, catchError, firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { User, Message, MessageEnteredEvent } from 'devextreme/ui/chat';

import { AppointmentService } from '../../pages/scheduler/appointment.service';
import { AuthService } from '../../auth/auth.service';

import { firstLetterToUpperCase } from '../../utils/generic';

import notify from 'devextreme/ui/notify';



@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiUrl = 'http://localhost:5000';
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  private userChatTypingUsersSubject = new BehaviorSubject<User[]>([]);
  private supportChatTypingUsersSubject = new BehaviorSubject<Message[]>([]);
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

  // private appointmentService!: AppointmentService;
  // private http!: HttpClient;
  constructor(
    private appointmentService: AppointmentService,
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.date = new Date();


    this.onInit();
  }

  onInit() {
    //first assistant message
        this.date.setHours(0, 0, 0, 0);

        this.currentUser.id = this.authService.userId ?? 0;
        this.currentUser.name = this.authService.username ?? 'Err';

    this.messages = [
      {
        timestamp: this.getTimestamp(this.date, -9),
        author: this.supportAgent,
        text: `Hello, ${firstLetterToUpperCase(this.currentUser.name!)}!\nIm here to help you whit you'r scheduling!`,
      },
    ];

    this.messagesSubject.next(this.messages);
    this.userChatTypingUsersSubject.next([]);
    this.supportChatTypingUsersSubject.next([]);
  }

  //Main functions
  sendMessageToAI(message: string): Observable<any> {
    const payload = {
      text: message,
    };

    // Indica che l'assistente è in typing (stato "in digitazione")
    this.supportChatOnTypingStart();

    return this.http.post(`${this.apiUrl}/api/message`, payload).pipe(
      tap((response: any) => {
        // debug
        console.log('Response:', response);
        //
        // Rimuove il typing status al ritorno della risposta
        this.supportChatOnTypingEnd();

        if (response.aiResponse.author === 'model') {
          response.aiResponse.author = this.supportAgent;
        } else {
          response.aiResponse.author = this.currentUser;
        }

        this.messages.push({
          author: response.aiResponse.author,
          text: response.aiResponse.text,
          timestamp: this.getTimestamp(this.date),
        });

        this.appointmentService.loadAppointments();
      }),
      catchError((error: any) => {
        // Rimuovere typing status in caso di errore
        this.supportChatTypingUsersSubject.next([]);
        console.error('Error sending message:', error);
        if (error.status === 401) {
          // Handle Unauthorized Error
          notify('You are not authorized to perform this action', 'error', 3000);
        } else if (error.status === 400) {
          // Handle Bad Request Error
          notify('Bad request. Please check your input', 'error', 3000);
        } else {
          // Handle other errors
          notify('An unexpected error occurred', 'error', 3000);
        }
        return new Observable<any>();
      })
    );
  }

  getUserChats(): Observable<any> {
    return this.http
      .get(`${this.apiUrl}/chat/user/${this.authService.userId}/chats`)
      .pipe(
        tap((response: any) => {
          // debug
          console.log('Response:', response);
          //
          this.chats = response;
        }),
        catchError((error: any) => {
          console.error('Error sending message:', error);
          if (error.status === 401) {
            // Handle Unauthorized Error
            notify('You are not authorized to perform this action', 'error', 3000);
          } else if (error.status === 400) {
            // Handle Bad Request Error
            notify('Bad request. Please check your input', 'error', 3000);
          } else {
            // Handle other errors
            notify('An unexpected error occurred', 'error', 3000);
          }
          return new Observable<any>();
        })
      );
  }

  getUserChatMessages(chatId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/chat/chat/${chatId}/messages`).pipe(
      tap((response: any) => {
        console.log('Response:', response);
        this.messages = response;
      }),
      catchError((error: any) => {
        console.error('Error sending message:', error);
        if (error.status === 401) {
          // Handle Unauthorized Error
          notify('You are not authorized to perform this action', 'error', 3000);
        } else if (error.status === 400) {
          // Handle Bad Request Error
          notify('Bad request. Please check your input', 'error', 3000);
        } else {
          // Handle other errors
          notify('An unexpected error occurred', 'error', 3000);
        }
        return new Observable<any>();
      })
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
          this.messages.push({
            author: element.author,
            text: element.text,
            timestamp: element.timestamp,
          });
        } else {
          element.author = this.currentUser;
          this.messages.push({
            author: element.author,
            text: element.text,
            timestamp: element.timestamp,
          });
        }
      });
      //debug
      // console.log('Messages loaded:', this.messages);
      //
    } catch (error: any) {
      console.error('Error loading messages:', error);
      if (error.status === 401) {
        notify('You are not authorized to perform this action', 'error', 3000);
      } else if (error.status === 400) {
        notify('Bad request. Please check your input', 'error', 3000);
      } else {
        notify('An unexpected error occurred', 'error', 3000);
      }
    }
  }

  async onMessageEntered(event: MessageEnteredEvent) {
    // this.sendMessageToAI(event.message!.text || '');
    if (event.message) {
      this.messages = [...this.messages, event.message];
    }
    this.messagesSubject.next(this.messages);
    console.log('onMessageEntered', this.messagesSubject);
  }

  //utilities
  get userChatTypingUsers$(): Observable<User[]> {
    return this.userChatTypingUsersSubject.asObservable();
  }

  get supportChatTypingUsers$(): Observable<Message[]> {
    return this.supportChatTypingUsersSubject.asObservable();
  }

  get messages$(): Observable<Message[]> {
    return this.messagesSubject.asObservable();
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
    this.supportChatTypingUsersSubject.next([this.currentUser]);
    console.log('userChatOnTypingStart', this.supportChatTypingUsersSubject);
  }

  userChatOnTypingEnd() {
    this.supportChatTypingUsersSubject.next([]);
    console.log('userChatOnTypingEnd', this.supportChatTypingUsersSubject);
  }

  supportChatOnTypingStart() {
    this.userChatTypingUsersSubject.next([this.supportAgent]);
  }

  supportChatOnTypingEnd() {
    this.userChatTypingUsersSubject.next([]);
  }
}

import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, tap, catchError, lastValueFrom, firstValueFrom } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { User, Message, MessageEnteredEvent } from 'devextreme/ui/chat';

import { AppointmentService } from '../scheduler/scheduler/appointment.service';
import { messageResponse } from '../interfaces/d.interface';
import { AuthService } from '../auth/auth.service';



@Injectable({
  providedIn: 'root',
})
export class ChatService {
  currentUser: User = {
    id: 'c94c0e76-fb49-4b9b-8f07-9f93ed93b4f3',
    name: 'John Doe',
  };

  supportAgent: User = {
    id: 'd16d1a4c-5c67-4e20-b70e-2991c22747c3',
    name: 'Scheduler Support Agent',
    avatarUrl: 'images/petersmith.png',
  };

  private apiUrl = 'http://localhost:5000';
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  private userChatTypingUsersSubject = new BehaviorSubject<User[]>([]);
  private supportChatTypingUsersSubject = new BehaviorSubject<Message[]>([]);
  public messages: Message[] = [];
  private chats: any[] = [];
  private date: Date;

  // private appointmentService!: AppointmentService;
  // private http!: HttpClient;
  constructor(
    private appointmentService: AppointmentService,
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.date = new Date();
    this.date.setHours(0, 0, 0, 0);

   this.onInit();
  }


  onInit() {
     this.messages = [
       {
         timestamp: this.getTimestamp(this.date, -9),
         author: this.supportAgent,
         text: 'Hello, John!\nIm here to help you whit the scheduling!',
       },
     ];

     this.messagesSubject.next(this.messages);
     this.userChatTypingUsersSubject.next([]);
     this.supportChatTypingUsersSubject.next([]);
  }

  //Main functions
  sendMessageToAI(message: string): Observable<any> {
    const payload = {
      text: message
    };
    return this.http.post(`${this.apiUrl}/api/message`, payload).pipe(
      tap((response: any) => {
        console.log('Response:', response);
        this.messages.push({
          author: response.aiResponse.author,
          text: response.aiResponse.text,
          timestamp: this.getTimestamp(this.date),
        });

        this.appointmentService.loadAppointments();
      }),
      catchError((error: any) => {
        console.error('Error sending message:', error);
        if (error.status === 401) {
          // Handle Unauthorized Error
          alert('You are not authorized to perform this action.');
        } else if (error.status === 400) {
          // Handle Bad Request Error
          alert('Bad request. Please check your input.');
        } else {
          // Handle other errors
          alert('An unexpected error occurred.');
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
          console.log('Response:', response);
          this.chats = response;
        }),
        catchError((error: any) => {
          console.error('Error sending message:', error);
          if (error.status === 401) {
            // Handle Unauthorized Error
            alert('You are not authorized to perform this action.');
          } else if (error.status === 400) {
            // Handle Bad Request Error
            alert('Bad request. Please check your input.');
          } else {
            // Handle other errors
            alert('An unexpected error occurred.');
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
          alert('You are not authorized to perform this action.');
        } else if (error.status === 400) {
          // Handle Bad Request Error
          alert('Bad request. Please check your input.');
        } else {
          // Handle other errors
          alert('An unexpected error occurred.');
        }
        return new Observable<any>();
      })
    );
  }

  async loadChatMessages(chatId: number): Promise<void> {
    try {
     const response = await firstValueFrom(
       this.http.get(`${this.apiUrl}/chat/chat/${chatId}/messages`)
     ) as any[];
      this.onInit();
      response.forEach(element => {
        if(element.author == 'model') {
          element.author = this.supportAgent;
          this.messages.push({ author: element.author, text: element.text, timestamp: element.timestamp });
        } else {
          element.author = this.currentUser;
          this.messages.push({ author: element.author, text: element.text, timestamp: element.timestamp });
        }
     });
      // = response as Message[];
    //  console.log('Messages loaded:', this.messages);
      console.log('Messages loaded:', this.messages);
    } catch (error: any) {
      console.error('Error loading messages:', error);
      if (error.status === 401) {
        alert('You are not authorized to perform this action.');
      } else if (error.status === 400) {
        alert('Bad request. Please check your input.');
      } else {
        alert('An unexpected error occurred.');
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

  userChatOnTypingStart() {
    this.supportChatTypingUsersSubject.next([this.supportAgent]);
    console.log('userChatOnTypingStart', this.supportChatTypingUsersSubject);
  }

  userChatOnTypingEnd() {
    this.supportChatTypingUsersSubject.next([]);
    console.log('userChatOnTypingEnd', this.supportChatTypingUsersSubject);
  }

  supportChatOnTypingStart() {
    this.userChatTypingUsersSubject.next([this.currentUser]);
  }

  supportChatOnTypingEnd() {
    this.userChatTypingUsersSubject.next([]);
  }
}

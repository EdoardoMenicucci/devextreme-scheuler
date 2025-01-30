import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, tap, catchError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { User, Message, MessageEnteredEvent } from 'devextreme/ui/chat';

import { AppointmentService } from '../scheduler/scheduler/appointment.service';
import { messageResponse } from '../interfaces/d.interface';



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
    name: 'Support Agent',
    avatarUrl: 'images/petersmith.png',
  };

  private apiUrl = 'http://localhost:5000/api/message';
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  private userChatTypingUsersSubject = new BehaviorSubject<User[]>([]);
  private supportChatTypingUsersSubject = new BehaviorSubject<Message[]>([]);
  private messages: Message[] = [];
  private date: Date;

  // private appointmentService!: AppointmentService;
  // private http!: HttpClient;
  constructor(private appointmentService: AppointmentService, private http: HttpClient) {
    this.date = new Date();
    this.date.setHours(0, 0, 0, 0);

    this.messages = [
      {
        timestamp: this.getTimestamp(this.date, -9),
        author: this.supportAgent,
        text: 'Hello, John!\nHow can I assist you today?',
      },
    ];

    this.messagesSubject.next(this.messages);
    this.userChatTypingUsersSubject.next([]);
    this.supportChatTypingUsersSubject.next([]);
  }

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

  sendMessageToAI(message: string): Observable<any> {
    const payload = {
      chatId: 4,
      text: message,
    };

    return this.http.post(this.apiUrl, payload).pipe(
      tap((response: any) => {
        console.log('Response:', response);

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

  // processAIResponse(response: any) {
  //   if (response.appointment) {
  //     // Handle appointment modification based on AI response
  //     this.appointmentService
  //       .updateAppointment(response.appointment.id, response.appointment)
  //       .subscribe();
  //   }
  // }

  async onMessageEntered(event: MessageEnteredEvent) {
    // this.sendMessageToAI(event.message!.text || '');

    if (event.message) {
      this.messages = [...this.messages, event.message];
    }
    this.messagesSubject.next(this.messages);
    console.log('onMessageEntered', this.messagesSubject);
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

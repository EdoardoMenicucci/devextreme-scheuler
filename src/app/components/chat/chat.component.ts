import { Component, OnDestroy, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { DxChatModule } from 'devextreme-angular';
import { User, Message, MessageEnteredEvent } from 'devextreme/ui/chat';
import { Observable, pipe, Subscription, Subject } from 'rxjs';
import { ChatService } from './chat.service';
import { AuthService } from '../../auth/auth.service';
import { FormsModule } from '@angular/forms';
import { PreviousChatsDropdownComponent } from '../previous-chat/previous-chat.component';
import notify from 'devextreme/ui/notify';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    DxChatModule,
    AsyncPipe,
    CommonModule,
    FormsModule,
    PreviousChatsDropdownComponent,
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, OnDestroy {
  currentUser: User;
  supportAgent: User;
  messages$: Observable<Message[]>;
  userChatTypingUsers$: Observable<User[]>;
  supportChatTypingUsers$: Observable<Message[]>;

  private readonly destroy$ = new Subject<void>();
  isAuthenticated: boolean = false;

  constructor(
    private readonly chatService: ChatService,
    private authService: AuthService
  ) {
    [this.currentUser, this.supportAgent] = this.chatService.getUsers();
    this.messages$ = this.chatService.messages$;
    this.userChatTypingUsers$ = this.chatService.userChatTypingUsers;
    this.supportChatTypingUsers$ = this.chatService.supportChatTypingUsers;
  }

  async ngOnInit(): Promise<void> {
    this.isAuthenticated = await this.authService.isAuthenticated();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onMessageEntered(event: MessageEnteredEvent) {
    if (event.message) {
      this.messages$ = this.chatService.messages$;
      this.chatService.sendMessageToAI(event.message.text || '')
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            notify('Action performed successfully', 'success', 3000);
          }
        });
    }
  }

  // Typing indicator methods remain simple delegations to service
  userChatOnTypingStart = () =>     this.chatService.userChatOnTypingStart();
  userChatOnTypingEnd = () =>     this.chatService.userChatOnTypingEnd();
  supportChatOnTypingStart = () => this.chatService.supportChatOnTypingStart();
  supportChatOnTypingEnd = () => this.chatService.supportChatOnTypingEnd();

  // Utility method
  getFromattedDate(): string {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
  }
}

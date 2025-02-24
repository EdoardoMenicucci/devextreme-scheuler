import { Component, OnDestroy, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { DxChatModule, DxToolbarModule,DxButtonModule } from 'devextreme-angular';
import { User, Message, MessageEnteredEvent } from 'devextreme/ui/chat';
import { Observable, pipe, Subscription, Subject } from 'rxjs';
import { ChatService } from './chat.service';
import { AuthService } from '../../auth/auth.service';
import { FormsModule } from '@angular/forms';
// ! Not Using anymore previous chat component
import { PreviousChatsDropdownComponent } from '../previous-chat/previous-chat.component';
import notify from 'devextreme/ui/notify';
import { takeUntil } from 'rxjs';
import { ChatToolbarComponent } from '../chat-toolbar/chat-toolbar.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    DxChatModule,
    AsyncPipe,
    CommonModule,
    FormsModule,
    DxToolbarModule,
    DxButtonModule,
    ChatToolbarComponent
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
  isDisabled = false;

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

  // * LifeCycle
  async ngOnInit(): Promise<void> {
    this.isAuthenticated = await this.authService.isAuthenticated();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onMessageEntered(event: MessageEnteredEvent) {
    this.isDisabled = true;
    if (event.message) {
      this.messages$ = this.chatService.messages$;
      this.chatService
        .sendMessageToAI(event.message.text || '')
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            notify('Action performed successfully', 'success', 3000);
            this.isDisabled = false;
          },
        });
    }
  }

  clearChat = () => {
    this.chatService.clearMessages();
    notify('Chat cleared', 'success', 2000);
  };

  loadPreviousMessages() {
    notify('Loading previous messages...', 'info', 2000);
    // this.chatService.loadPreviousMessages();
  }

  // Typing indicator methods remain simple delegations to service
  userChatOnTypingStart = () => this.chatService.userChatOnTypingStart();
  userChatOnTypingEnd = () => this.chatService.userChatOnTypingEnd();
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

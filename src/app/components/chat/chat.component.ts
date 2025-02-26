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

/**
 * Component responsible for displaying and managing chat functionality
 * Provides user interface for messaging and interacting with support agent
 */
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
  /** Current user information */
  currentUser: User;
  /** Support agent information */
  supportAgent: User;
  /** Observable stream of chat messages */
  messages$: Observable<Message[]>;
  /** Observable stream of users typing in user chat */
  userChatTypingUsers$: Observable<User[]>;
  /** Observable stream of typing indicators in support chat */
  supportChatTypingUsers$: Observable<Message[]>;
  /** Flag to disable input during processing */
  isDisabled = false;

  /** Subject to signal component destruction for unsubscribing */
  private readonly destroy$ = new Subject<void>();
  /** Flag indicating if user is authenticated */
  isAuthenticated: boolean = false;

  /**
   * Creates an instance of ChatComponent
   * @param chatService - Service to handle chat operations
   * @param authService - Service to manage authentication
   */
  constructor(
    private readonly chatService: ChatService,
    private authService: AuthService
  ) {
    [this.currentUser, this.supportAgent] = this.chatService.getUsers();
    this.messages$ = this.chatService.messages$;
    this.userChatTypingUsers$ = this.chatService.userChatTypingUsers;
    this.supportChatTypingUsers$ = this.chatService.supportChatTypingUsers;
  }

  /**
   * Lifecycle hook that runs on component initialization
   * Checks authentication status
   */
  async ngOnInit(): Promise<void> {
    this.isAuthenticated = await this.authService.isAuthenticated();
  }

  /**
   * Lifecycle hook that runs on component destruction
   * Cleans up subscriptions
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Handles message entered event from chat UI
   * Sends message to AI and handles the response
   * @param event - Message entered event from DevExtreme Chat
   */
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

  /**
   * Clears all messages from the chat
   */
  clearChat = () => {
    this.chatService.clearMessages();
    notify('Chat cleared', 'success', 2000);
  };

  /**
   * Loads previous chat messages
   * Currently shows notification only
   */
  loadPreviousMessages() {
    notify('Loading previous messages...', 'info', 2000);
    // this.chatService.loadPreviousMessages();
  }

  /**
   * Indicates user has started typing
   */
  userChatOnTypingStart = () => this.chatService.userChatOnTypingStart();

  /**
   * Indicates user has stopped typing
   */
  userChatOnTypingEnd = () => this.chatService.userChatOnTypingEnd();

  /**
   * Indicates support agent has started typing
   */
  supportChatOnTypingStart = () => this.chatService.supportChatOnTypingStart();

  /**
   * Indicates support agent has stopped typing
   */
  supportChatOnTypingEnd = () => this.chatService.supportChatOnTypingEnd();

  // Utility method
  // getFromattedDate(): string {
  //   const date = new Date();
  //   date.setDate(date.getDate() - 1);
  //   return date.toLocaleDateString('it-IT', {
  //     day: 'numeric',
  //     month: 'numeric',
  //     year: 'numeric',
  //   });
  // }
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { DxChatModule } from 'devextreme-angular';
import { User, Message, MessageEnteredEvent } from 'devextreme/ui/chat';
import { Observable, pipe, Subscription } from 'rxjs';
import { ChatService } from './chat.service';
import { AuthService } from '../../auth/auth.service';
import { FormsModule } from '@angular/forms';
import { PreviousChatsDropdownComponent } from '../previous-chat/previous-chat.component';
import notify from 'devextreme/ui/notify';

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
  supportChatTypingUsers$: Observable<User[]>;

  //subscription
  private sendMessageSub!: Subscription;

  isAuthenticated: boolean = false;

  constructor(
    private readonly chatService: ChatService,
    private authService: AuthService
  ) {
    [this.currentUser, this.supportAgent] = this.chatService.getUsers();
    this.messages$ = this.chatService.messages$;
    this.userChatTypingUsers$ = this.chatService.userChatTypingUsers$;
    this.supportChatTypingUsers$ = this.chatService.supportChatTypingUsers$;
  }

  async ngOnInit(): Promise<void> {
    this.isAuthenticated = await this.authService.isAuthenticated();
  }
  ngOnDestroy(): void {
    if (this.sendMessageSub) this.sendMessageSub.unsubscribe();
  }

  onMessageEntered(event: MessageEnteredEvent) {
    this.chatService.onMessageEntered(event);
    this.chatService.sendMessageToAI(event.message!.text!).subscribe({
      next: () => {
        notify('Action performed successfully', 'success', 3000);
      },
      error: (error) => {
      },
    });
  }

  getFromattedDate(): string {
    const date = new Date();
    date.setDate(date.getDate() - 1); // Get yesterday's date
    return date.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
  }

  userChatOnTypingStart() {
    this.chatService.userChatOnTypingStart();
  }

  userChatOnTypingEnd() {
    this.chatService.userChatOnTypingEnd();
  }

  supportChatOnTypingStart() {
    this.chatService.supportChatOnTypingStart();
  }

  supportChatOnTypingEnd() {
    this.chatService.supportChatOnTypingEnd();
  }
}

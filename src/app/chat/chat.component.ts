import { Component, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { DxChatModule } from 'devextreme-angular';
import { User, Message, MessageEnteredEvent } from 'devextreme/ui/chat';
import { Observable, pipe } from 'rxjs';
import { ChatService } from './chat.service';
import { AuthService } from '../auth/auth.service';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [DxChatModule, AsyncPipe, CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit {
  currentUser: User;
  supportAgent: User;
  messages$: Observable<Message[]>;
  userChatTypingUsers$: Observable<User[]>;
  supportChatTypingUsers$: Observable<User[]>;

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

  onMessageEntered(event: MessageEnteredEvent) {
    this.chatService.onMessageEntered(event);
    this.chatService.sendMessageToAI(event.message!.text!).subscribe((response) => {
      console.log(response);
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

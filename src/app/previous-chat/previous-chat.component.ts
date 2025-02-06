import { Component, OnInit } from '@angular/core';

import { DxSelectBoxModule } from 'devextreme-angular';
import { ChatService } from '../chat/chat.service';
import { CommonModule } from '@angular/common';
import { Chat } from '../interfaces/d.interface';
import { formatDateUtils } from '../utils/generic';

@Component({
  selector: 'app-previous-chats-dropdown',
  standalone: true,
  imports: [DxSelectBoxModule, CommonModule],
  template: `
    <div class="chat-dropdown h-full bg-[#090730]" *ngIf="chats.length > 0">
      <dx-select-box
        [items]="chats"
        displayExpr="id"
        valueExpr="id"
        placeholder="Seleziona una chat precedente"
        (onValueChanged)="onChatSelect($event)"
      >
        <div *dxTemplate="let item of 'item'">
          <span class="ms-1">{{ formatDate(item.createdAt) }}</span>
        </div>
      </dx-select-box>
    </div>
    <div
      class="chat-dropdown h-full bg-[#090730]"
      *ngIf="chats.length === 0"
    ></div>
  `,
  styles: [
    `
      .chat-dropdown {
        padding: 0.5rem;
        border-radius: 4px;
      }
    `,
  ],
})
export class PreviousChatsDropdownComponent implements OnInit {
  chats: Chat[] = [];

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.chatService.getUserChats().subscribe((data) => {
      this.chats = data;
    });
  }

  formatDate(dateInput: string | Date | null): string {
    return formatDateUtils(dateInput);
  }

  onChatSelect(e: any): void {
    const selectedChat = this.chats.find((chat) => chat.id === e.value);
    if (selectedChat) {
      this.chatService.loadChatMessages(selectedChat.id);
    }
  }
}

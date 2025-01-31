import { Component } from '@angular/core';
import { DxDrawerModule, DxListModule } from 'devextreme-angular';
import { Router, RouterModule } from '@angular/router';
import { ChatService } from '../../chat/chat.service';

@Component({
  standalone: true,
  imports: [DxDrawerModule, DxListModule, RouterModule],
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  navigation = [
    { id: 1, text: 'Home', icon: 'home', path: '/home' },
    { id: 2, text: 'Scheduler', icon: 'event', path: '/scheduler' },
    { id: 3, text: 'Login', icon: 'login', path: '/login' },
  ];

  previousChats = [];

  selectedRoute: string = '';

  constructor(private router: Router, private chatService: ChatService) {
    this.chatService.getUserChats().subscribe((data) => {
      this.previousChats = data;
    });
  }

  loadChat(e: any) {
    console.log(e);
    this.chatService.loadChatMessages(e.itemData.id);
  }
  formatDate(dateInput: string | Date | null): string {
    if (!dateInput) {
      return '';
    }

    try {
      const date =
        typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
      if (!(date instanceof Date) || isNaN(date.getTime())) {
        return '';
      }

      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();

      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  }


  itemClick(e: any) {
    this.selectedRoute = e.itemData.path;
    this.router.navigate([e.itemData.path]);
  }
}

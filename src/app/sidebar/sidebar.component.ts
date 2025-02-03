import { Component, OnInit } from '@angular/core';
import { DxDrawerModule, DxListModule } from 'devextreme-angular';
import { Router, RouterModule } from '@angular/router';
import { ChatService } from '../chat/chat.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Component({
  standalone: true,
  imports: [DxDrawerModule, DxListModule, RouterModule],
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit {
  private authErrorSubscription!: Subscription;

  navigation = [
    { id: 1, text: 'Scheduler', icon: 'event', path: '/scheduler' },
    { id: 2, text: 'Logout', icon: 'login', action: 'logout' },
  ];

  previousChats = [];

  selectedRoute: string = '';

  constructor(
    private router: Router,
    private chatService: ChatService,
    private authService: AuthService
  ) {
    //Get previous user chats (this feature need to be polished)
    this.chatService.getUserChats().subscribe((data) => {
      this.previousChats = data;
    });
  }

  //Lifecycle hook
  ngOnInit(): void {
    // Check initial authentication
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    // Subscribe to authentication errors
    this.authErrorSubscription = this.authService
      .getAuthErrors()
      .subscribe((error) => {
        if (error) {
          switch (error.type) {
            case 'TOKEN_EXPIRED':
              this.router.navigate(['/login']);
              break;
            case 'UNAUTHORIZED':
              this.router.navigate(['/signin']);
              break;
            case 'NETWORK_ERROR':
              alert('Network error occurred');
              this.router.navigate(['/home']);
              break;
          }
        }
      });
  }

  ngOnDestroy(): void {
    if (this.authErrorSubscription) {
      this.authErrorSubscription.unsubscribe();
    }
  }
  //

  loadChat(e: any) {
    // debug
    console.log(e);
    //
    this.chatService.loadChatMessages(e.itemData.id);
  }

  formatDate(dateInput: string | Date | null): string {
    // format date to dd/mm/yyyy
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
    //router navigation
    if (e.itemData.path) {
      this.selectedRoute = e.itemData.path;
      this.router.navigate([e.itemData.path]);
    } else if (e.itemData.action === 'logout') {
      this.authService.logout();
    }

  }
}

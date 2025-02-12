import { Component, OnInit } from '@angular/core';
import { DxDrawerModule, DxListModule } from 'devextreme-angular';
import { Router, RouterModule } from '@angular/router';
import { ChatService } from '../chat/chat.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { formatDateUtils } from '../../utils/generic';
import notify from 'devextreme/ui/notify';

@Component({
  standalone: true,
  imports: [DxDrawerModule, DxListModule, RouterModule],
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit {

  navigation = [
    { id: 1, text: 'Scheduler', icon: 'event', path: '/scheduler' },
    { id: 2, text: 'Dashboard', icon: 'taskinprogress', path: '/dashboard' },
    { id: 2, text: 'Contact', icon: 'group', path: '/contact' },
    { id: 3, text: 'Logout', icon: 'login', action: 'logout' },
  ];

  previousChats = [];

  selectedRoute: string = '';

  //subscription
  private authErrorSubscription!: Subscription;
  private previousChatSubscription!: Subscription;

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
              notify('Session expired, please login again', 'error', 3000);
              this.router.navigate(['/login']);
              break;
            case 'UNAUTHORIZED':
              notify('Unauthorized', 'error', 3000);
              this.router.navigate(['/signin']);
              break;
            case 'NETWORK_ERROR':
              notify('Network error', 'error', 3000);
              this.router.navigate(['/home']);
              break;
          }
        }
      });
  }

  ngOnDestroy(): void {
    if (this.authErrorSubscription) this.authErrorSubscription.unsubscribe();
    if (this.previousChatSubscription)
      this.previousChatSubscription.unsubscribe();
  }
  //

  loadChat(e: any) {
    // debug
    console.log(e);
    //
    this.chatService.loadChatMessages(e.itemData.id);
  }

  formatDate(dateInput: string | Date | null): string {
    return formatDateUtils(dateInput);
  }

  itemClick(e: any) {
    console.log('item click', e);

    //router navigation
    if (e.itemData.path) {
      this.selectedRoute = e.itemData.path;
      this.router.navigate([e.itemData.path]);
    } else if (e.itemData.action === 'logout') {
      this.authService.logout();
      this.router.navigate(['/home']);
    }
  }
}

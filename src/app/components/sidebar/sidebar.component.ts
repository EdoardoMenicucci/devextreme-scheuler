import { Component, OnInit, OnDestroy } from '@angular/core';
import { DxDrawerModule, DxListModule } from 'devextreme-angular';
import { Router, RouterModule } from '@angular/router';
import { ChatService } from '../chat/chat.service';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { formatDateUtils } from '../../utils/generic';
import notify from 'devextreme/ui/notify';
import { NotificationService } from '../notification/notification.service';
import { ErrorHandlerService } from '../../auth/error-handler.service';

@Component({
  standalone: true,
  imports: [DxDrawerModule, DxListModule, RouterModule],
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  navigation = [
    { id: 1, text: 'Scheduler', icon: 'event', path: '/scheduler' },
    { id: 2, text: 'Dashboard', icon: 'taskinprogress', path: '/dashboard' },
    { id: 3, text: 'Contact', icon: 'group', path: '/contact' },
    {
      id: 4,
      text: 'Notifications',
      icon: 'bell',
      action: 'toggleNotifications',
    },
  ];

  logout = [{ id: 1, text: 'Logout', icon: 'runner', path: '/home' }];

  previousChats = [];
  selectedRoute: any = null;

  constructor(
    private router: Router,
    private chatService: ChatService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private errorHandler: ErrorHandlerService
  ) {
    this.chatService
      .getUserChats()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.previousChats = data;
      });
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.authService
      .getAuthErrors()
      .pipe(takeUntil(this.destroy$))
      .subscribe((error) => {
        this.errorHandler.handleAuthError(error);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onMainItemClick(e: any): void {
    const item = e?.itemData;
    if (item?.path) {
      this.router.navigate([item.path]);
      this.selectedRoute = item;
    }
    if (item?.action === 'toggleNotifications') {
      this.notificationService.toggle();
    }
  }

  onLogoutClick(e: any): void {
    const item = e?.itemData;
    if (item?.action === 'logout') {
      this.authService.logout();
      this.router.navigate(['/home']);
    }
  }

  loadChat(e: any) {
    if (e?.itemData?.id) {
      this.chatService.loadChatMessages(e.itemData.id);
    }
  }

  formatDate(dateInput: string | Date | null): string {
    return formatDateUtils(dateInput);
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  DxButtonModule,
  DxDrawerModule,
  DxListModule,
} from 'devextreme-angular';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { ChatService } from '../chat/chat.service';
import { filter, Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { formatDateUtils } from '../../utils/generic';
import notify from 'devextreme/ui/notify';
import { NotificationService } from '../notification/notification.service';
import { ErrorHandlerService } from '../../auth/error-handler.service';

@Component({
  standalone: true,
  imports: [DxDrawerModule, DxListModule, RouterModule, DxButtonModule],
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit, OnDestroy {
  shouldShowSidebar = false;

  private readonly destroy$ = new Subject<void>();
  private readonly publicRoutes = ['/login', '/signin', '/home'];

  navigation = [
    { id: 0, text: '', icon: 'menu', action: 'toggleDrawer' },
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

  isDrawerOpen = true;

  constructor(
    private router: Router,
    private chatService: ChatService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    this.checkAuthAndRoute(); // Initial check

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.checkAuthAndRoute();
        //load chat only on scheduler component
        if (this.router.url == "/scheduler") {
          this.chatService
            .getUserChats()
            .pipe(takeUntil(this.destroy$))
            .subscribe((data) => {
              this.previousChats = data;
            });
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkAuthAndRoute(): void {
    if (
      !this.authService.isAuthenticated() &&
      !this.publicRoutes.includes(this.router.url)
    ) {
      this.router.navigate(['/login']);
      return;
    }

    if (
      !this.authService.isAuthenticated() &&
      !this.publicRoutes.includes(this.router.url)
    ) {
      this.authService
        .getAuthErrors()
        .pipe(takeUntil(this.destroy$))
        .subscribe((error) => {
          this.errorHandler.handleAuthError(error);
        });
    }
  }

  toggleDrawer() {
    this.isDrawerOpen = !this.isDrawerOpen;
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
    if (item?.action === 'toggleDrawer') {
      this.toggleDrawer();
    }
  }

  onLogoutClick(e: any): void {
    const item = e?.itemData;
    console.log(item);

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

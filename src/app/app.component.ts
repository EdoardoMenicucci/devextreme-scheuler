import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NotificationComponent } from './components/notification/notification.component';
import { SidebarComponent } from "./components/sidebar/sidebar.component";
import { AuthService } from './auth/auth.service';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NotificationComponent, SidebarComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'devextreme-scheuler';

  shouldShowSidebar = true;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        console.log(this.router.url);
        const sidebarRoute = ['/contact', '/scheduler', '/dashboard'];
        this.shouldShowSidebar = sidebarRoute.includes(this.router.url);
      });
  }
}

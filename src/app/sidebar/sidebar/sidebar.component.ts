import { Component } from '@angular/core';
import { DxDrawerModule, DxListModule } from 'devextreme-angular';
import { Router, RouterModule } from '@angular/router';

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

  selectedRoute: string = '';

  constructor(private router: Router) {}

  itemClick(e: any) {
    this.selectedRoute = e.itemData.path;
    this.router.navigate([e.itemData.path]);
  }
}

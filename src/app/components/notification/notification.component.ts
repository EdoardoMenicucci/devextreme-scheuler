import { Component, OnDestroy, OnInit } from '@angular/core';
import { ContactService } from '../../pages/contact/contact.service';
import { AppointmentService } from '../../pages/scheduler/appointment.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { DxListModule } from 'devextreme-angular';
import { NotificationService } from './notification.service';
import notify  from 'devextreme/ui/notify';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule, DxListModule],
  template: `
    <div class="notification-panel" *ngIf="showNotifications">
      <dx-list [items]="notifications">
        <div *dxTemplate="let item of 'item'">
          <div class="flex items-center p-2">
            <i [class]="item?.icon"></i>
            <div class="ml-2">
              <div class="font-bold">{{ item?.title }}</div>
              <div class="text-sm text-gray-400">{{ item?.message }}</div>
            </div>
          </div>
        </div>
      </dx-list>
    </div>
  `,
  styles: [
    `
      .notification-panel {
        position: fixed;
        top: 60px;
        right: calc(50% - 200px);
        width: 400px;
        background: #090730;
        border: 2px solid var(--border-color);
        border-radius: 8px;
        z-index: 1000;
      }
    `,
  ],
})
export class NotificationComponent implements OnInit, OnDestroy {
  private subs: Subscription[] = [];
  notifications: any[] = [];
  showNotifications: boolean = false;

  constructor(
    private contactService: ContactService,
    private appointmentService: AppointmentService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.subs.push(
      this.notificationService.showNotifications$.subscribe((show) => {
        this.showNotifications = show;
        this.checkNotifications();
      })
    );
  }

  private checkNotifications() {
    this.notifications = [];

    // Check pending friend requests
    this.subs.push(
      this.contactService.getPendingFriendRequests().subscribe((requests) => {
        if (requests.length > 0) {
          //remove previous notifications related to friend requests
          this.notifications = this.notifications.filter(
            (notification) => notification.title !== 'Friend Requests'
          );
          //add new notification
          this.notifications.push({
            icon: 'dx-icon-user',
            title: 'Friend Requests',
            message: `You have ${requests.length} pending friend request(s)`,
          });
          //notify
          notify(
            `You have ${requests.length} pending friend requests`,
            'warning',
            3000
          );
        }
      })
    );

    // Check upcoming appointments (next 2 hours)
    this.subs.push(
      this.appointmentService.appointments$.subscribe((appointments) => {
        const now = new Date();
        const upcoming = appointments.filter((apt) => {
          const start = new Date(apt.startDate);
          const hoursDiff =
            (start.getTime() - now.getTime()) / (1000 * 60 * 60);
          return hoursDiff > 0 && hoursDiff <= 2;
        });

        if (upcoming.length > 0) {
          //remove previous notifications related to appointments
          this.notifications = this.notifications.filter(
            (notification) => notification.title !== 'Upcoming Appointments'
          );
          //add new notification
          this.notifications.push({
            icon: 'dx-icon-event',
            title: 'Upcoming Appointments',
            message: `You have ${upcoming.length} appointment(s) in the next 2 hours`,
          });
          //notify
          notify(
            `You have ${upcoming.length} upcoming appointment(s) in the next 2 hours`,
            'warning',
            3000
          );
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub?.unsubscribe());
  }
}

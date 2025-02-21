import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxListModule, DxTextBoxModule, DxButtonModule } from 'devextreme-angular';
import { ContactService } from './contact.service';
import { Friend, FriendRequest } from '../../models/friend-request.model';
import notify from 'devextreme/ui/notify';
import { SidebarComponent } from "../../components/sidebar/sidebar.component";

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [DxListModule, DxTextBoxModule, DxButtonModule, CommonModule, SidebarComponent, SidebarComponent],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
})
export class ContactComponent implements OnInit {
  friends: Friend[] = [];
  pendingRequests: FriendRequest[] = [];
  newFriendUsername: string = '';
  sharedAppointments: any[] = [];
  currentDate: Date = new Date();

  constructor(private contactService: ContactService) { }

  ngOnInit() {
    this.loadFriends();
    this.loadPendingRequests();
    this.loadSharedAppointments();
  }

  loadFriends() {
    this.contactService.getFriends().subscribe(
      (friends) =>{ this.friends = friends; console.log('Friends:', this.friends);}
    );
  }

  loadPendingRequests() {
    this.contactService.getPendingFriendRequests().subscribe(
      requests => this.pendingRequests = requests
    );
  }

  acceptRequest(senderId: string) {
    this.contactService.acceptFriendRequest(senderId).subscribe(() => {
      this.loadPendingRequests();
      this.loadFriends();
    });
  }

  rejectRequest(senderId: string) {
    this.contactService.rejectFriendRequest(senderId).subscribe(() => {
      this.loadPendingRequests();
    });
  }

  sendFriendRequest() {
    if (this.newFriendUsername.trim()) {
      this.contactService.sendFriendRequest(this.newFriendUsername).subscribe({
        next: () => {
          this.newFriendUsername = '';
          notify('Friend request sent', 'success', 3000);
        },
        error: (error) => {
          notify('Failed to send friend request', 'error', 3000);
          console.error('Error sending friend request:', error);
        }
      });
    }
  }

  loadSharedAppointments() {
    this.contactService.getSharedAppointments().subscribe({
      next: (appointments) => {
        this.sharedAppointments = appointments;
        console.log('Shared appointments:', this.sharedAppointments);
      },
      error: (error) => {
        console.error('Error loading shared appointments:', error);
        notify('Failed to load shared appointments', 'error', 3000);
      }
    });
  }

  formatDateTime(date: string | Date): string {
    return new Date(date).toLocaleString();
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private showNotifications = new BehaviorSubject<boolean>(false);
  showNotifications$ = this.showNotifications.asObservable();

  toggle() {
    this.showNotifications.next(!this.showNotifications.value);
  }
}

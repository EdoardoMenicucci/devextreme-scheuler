import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Friend, FriendRequest } from '../../models/friend-request.model';


@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private apiUrl = 'http://localhost:5000/user';

  constructor(private http: HttpClient) {}

  getFriends(): Observable<Friend[]> {
    return this.http.get<Friend[]>(`${this.apiUrl}/friends`);
  }

  getPendingFriendRequests(): Observable<FriendRequest[]> {
    return this.http.get<FriendRequest[]>(
      `${this.apiUrl}/friend-requests/pending`
    );
  }

  sendFriendRequest(receiverUsername: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/friend-request/${receiverUsername}`,
      {},
      { responseType: 'text' }
    );
  }

  acceptFriendRequest(senderId: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/friend-request/${senderId}/accept`,
      {},
      { responseType: 'text' }
    );
  }

  rejectFriendRequest(senderId: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/friend-request/${senderId}/reject`,
      {},
      { responseType: 'text' }
    );
  }

  getSharedAppointments(): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:5000/api/appointment/shared`);
  }
}

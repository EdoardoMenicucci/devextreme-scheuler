export interface FriendRequest {
  id: number;
  senderId: string;
  senderUsername: string;
  receiverId: string;
  receiverUsername: string;
  status: string;
  requestedAt: Date;
}

export interface Friend {
  friendId: string;
  firendUsername: string;
  requestedAt: Date;
}

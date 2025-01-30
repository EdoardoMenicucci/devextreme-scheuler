export interface loginForm {
  email: string;
  password: string;
}

export interface registerForm {
  username: string;
  email: string;
  password: string;
  color?: string;
}

export interface registerBackendForm {
  username: string;
  email: string;
  password: string;
}

export interface Chat {
  id: number;
  userId: number;
  messages: Message[];
  createdAt: Date;
}

export interface Message {
  id: number;
  chatId: number;
  text: string;
  sender: string;
  timestamp: Date;
}

export interface messageResponse {
  userMessage: string;
  aiResponse: string;
  Appointments: Array<any>;
}


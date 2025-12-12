
export enum AppView {
  LANDING = 'LANDING',
  DASHBOARD = 'DASHBOARD',
  VOICE_AGENT = 'VOICE_AGENT',
  CHAT_ASSISTANT = 'CHAT_ASSISTANT',
  SCHEDULER = 'SCHEDULER',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER'
}

export interface Appointment {
  id: string;
  customerName: string;
  service: string;
  date: string;
  time: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed';
  notes?: string;
  contact?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface TranscriptItem {
  id: string;
  role: 'user' | 'model';
  text: string;
  isFinal: boolean;
}

export enum ConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR'
}

export interface BusinessStats {
  totalAppointments: number;
  conversionRate: number;
  avgResponseTime: string;
  revenue: number;
}

export interface BusinessProfile {
  name: string;
  type: string;
  address: string;
  rating: number;
  image: string;
}

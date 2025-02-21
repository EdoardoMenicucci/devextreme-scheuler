export interface Appointment {
  id: string;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
  title: string;
  description?: string;
  [key: string]: any;
}

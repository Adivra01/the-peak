export interface EventMedia {
  id: string;
  type: 'image' | 'video';
  file: File;
  preview: string;
}

export interface TicketType {
  id: string;
  name: string;
  price: number;
  fees: number;
  clientPrice?: number | null;
  managerFees?: number;
  description: string;
  available: number;
  startTime?: string | null;
  endTime?: string | null;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image: string;
  gallery: string[];
  video?: string;
  ticketTypes: TicketType[];
  organizer: string;
  category: string;
}

export interface Ticket {
  ticket_id: string;
  event_id: string;
  event_name: string;
  ticket_type: string;
  price: number;
  event_date: string;
  event_time: string;
  event_location: string;
  reservation_date: string;
  customer_name: string;
  customer_firstname: string;
  customer_phone?: string;
  customer_email?: string;
  status: 'valid' | 'used' | 'cancelled';
}

export interface ReservationForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  ticketType: string;
}

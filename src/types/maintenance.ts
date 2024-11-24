export interface Ticket {
  id: string;
  title: string;
  description: string;
  openDate: string;
  priority: 'low' | 'normal' | 'high';
  status: 'new' | 'in-progress' | 'resolved';
}

export interface TicketHistory {
  id: number;
  action: 'status_change' | 'comment' | 'created';
  description: string;
  user: string;
  timestamp: Date;
  type: 'update' | 'comment' | 'create';
}
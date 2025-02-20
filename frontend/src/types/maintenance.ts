export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'new' | 'in-progress' | 'resolved';
  openDate: string;
  scheduledDate?: string;
  vendorId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskActivity {
  id: string;
  type: 'status_change' | 'comment_added' | 'assignee_change' | 'created';
  user: {
    name: string;
    imageUrl?: string;
  };
  description: string;
  timestamp: string;
}

export interface TicketHistory {
  id: number;
  action: 'status_change' | 'comment' | 'created';
  description: string;
  user: string;
  timestamp: Date;
  type: 'update' | 'comment' | 'create';
}
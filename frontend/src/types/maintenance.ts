export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'new' | 'inprogress' | 'paused' | 'completed';
  openDate: string;
  scheduledDate?: string;
  assigneeId?: string;
  createdAt: string;
  updatedAt: string;
  vendor_id?: string;
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
  action: 'status_change' | 'comment' | 'assignee_change';
  timestamp: string;
  content: string;
  user?: {
    name: string;
    avatar?: string;
  };
}
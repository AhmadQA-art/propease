export type PersonType = 'team' | 'tenant' | 'vendor';

export interface BasePerson {
  id: string;
  type: PersonType;
  name: string;
  email: string;
  phone: string;
  imageUrl?: string;
  createdAt: string;
  status: 'active' | 'inactive';
}

export interface TeamMember extends BasePerson {
  type: 'team';
  role: string;
  department: string;
  assignedTasks: number;
  lastActive: string;
}

export interface Tenant extends BasePerson {
  type: 'tenant';
  unit: string;
  property: string;
  leaseStart?: string;
  leaseEnd?: string;
  rentStatus: 'current' | 'overdue' | 'paid';
}

export interface Vendor extends BasePerson {
  type: 'vendor';
  company: string;
  service: string;
  rating: number;
  lastService: string;
  totalServices: number;
}

export type Person = TeamMember | Tenant | Vendor;

export interface Task {
  id: string;
  title: string;
  description: string;
  assignee: TeamMember;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
}

export interface Activity {
  id: string;
  user: TeamMember;
  action: string;
  target: string;
  timestamp: string;
}
export type PersonType = 'team' | 'tenant' | 'vendor' | 'owner';

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
  department?: string;
  jobTitle: string;
  reportsTo?: string;
  lastActive?: string;
}

export interface Tenant extends BasePerson {
  type: 'tenant';
  unit: string;
  property: string;
  leaseStart: string;
  leaseEnd: string;
  rentStatus: 'current' | 'late' | 'paid';
}

export interface Vendor extends BasePerson {
  type: 'vendor';
  company: string;
  service: string;
  rating: number;
  lastService: string;
  totalServices: number;
}

export interface Owner extends BasePerson {
  type: 'owner';
  company_name?: string;
  properties?: Array<{
    id: string;
    name: string;
  }>;
}

export type Person = TeamMember | Tenant | Vendor | Owner;

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
}

export interface Activity {
  id: string;
  userId: string;
  type: string;
  description: string;
  timestamp: string;
}
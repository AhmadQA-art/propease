export type PersonType = 'tenant' | 'owner' | 'vendor' | 'team';

export interface BasePerson {
  id: string;
  type: PersonType;
  name: string;
  email?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'pending';
  imageUrl?: string;
  createdAt: string;
  // Additional fields for form handling
  firstName?: string;
  lastName?: string;
}

export interface LeaseInfo {
  id?: string;
  unitName?: string;
  property?: string;
  rentAmount?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
}

export interface Tenant extends BasePerson {
  type: 'tenant';
  unit?: string;
  property?: string;
  rentStatus?: 'current' | 'late' | 'paid';
  organization_id?: string;
  preferredContactMethods?: string[];
  lease?: LeaseInfo;
}

export interface Owner extends BasePerson {
  type: 'owner';
  company_name?: string;
  properties?: Array<{
    id: string;
    name: string;
  }>;
}

export interface Vendor extends BasePerson {
  type: 'vendor';
  company?: string;  // UI-friendly alias for vendor_name
  company_name?: string; // For backward compatibility, maps to vendor_name
  vendor_name?: string; // New primary field from the schema
  service?: string;  // UI-friendly alias for service_type 
  service_type?: string;
  contact_person_name?: string;
  contact_person_email?: string;
  rating?: number; // UI-friendly alias for performance_rating
  performance_rating?: number;
  lastService?: string;
  totalServices?: number;
  // Additional fields from schema
  payment_terms?: string;
  notes?: string;
}

export interface TeamMember extends BasePerson {
  type: 'team';
  role?: string;
  department?: string;
  tasks?: Task[];
  activities?: Activity[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'completed';
  dueDate?: string;
  assignedTo: string;
  priority: 'low' | 'normal' | 'high';
}

export interface Activity {
  id: string;
  type: 'task_update' | 'comment' | 'status_change';
  description: string;
  timestamp: string;
  userId: string;
}

export type Person = Tenant | Owner | Vendor | TeamMember;
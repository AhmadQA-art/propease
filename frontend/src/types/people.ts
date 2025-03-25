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
  owner_type?: string;
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
  departmentId?: string;
  jobTitle?: string;
  tasks?: Task[];
  activities?: Activity[];
  // Add the user_id field from team_members table
  user_id?: string;
  // Add the user_profiles field from team_members table
  user_profiles?: {
    id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    status?: string;
  };
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'new' | 'pending' | 'in progress' | 'completed';
  dueDate?: string;
  assignedTo?: string[];  // Changed to string array for multiple assignees
  priority: 'low' | 'medium' | 'high';  // Changed 'normal' to 'medium'
  type?: 'team'; // Default and only option for team view
  relatedToId?: string;
  propertyId?: string;
  leaseId?: string;
  organizationId?: string;
  updatedAt?: string;
  createdAt?: string;
  // Add multi-select fields for the new join tables
  relatedToIds?: string[];
  propertyIds?: string[];
  leaseIds?: string[];
}

export interface TaskAssignee {
  id: string;
  name: string;
  imageUrl?: string;
  email?: string;
}

export interface TaskWithAssignee extends Task {
  assignee?: TaskAssignee;  // For backward compatibility
  assignees?: TaskAssignee[]; // New field for multiple assignees
  owner?: TaskAssignee;
  propertyId?: string;
  leaseId?: string;
  // Added multi-select fields to support the drawer UI
  relatedToIds?: string[];
  propertyIds?: string[];
  leaseIds?: string[];
}

export interface Activity {
  id: string;
  type: 'task_update' | 'comment' | 'status_change';
  description: string;
  timestamp: string;
  userId: string;
  user?: {
    name: string;
    imageUrl?: string;
  };
  action?: string;
  target?: string;
}

export type Person = Tenant | Owner | Vendor | TeamMember;
export interface User {
  id: string;
  email: string;
  role: 'super_admin' | 'admin' | 'manager' | 'tenant' | 'vendor';
  created_at: string;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  units: number;
  owner_id: string;
  created_at: string;
}

export interface Lease {
  id: string;
  property_id: string;
  tenant_id: string;
  start_date: string;
  end_date: string;
  rent_amount: number;
  status: 'active' | 'pending' | 'terminated';
}

export interface MaintenanceRequest {
  id: string;
  property_id: string;
  tenant_id: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  assigned_to?: string;
  created_at: string;
}

export interface Payment {
  id: string;
  lease_id: string;
  amount: number;
  payment_date: string;
  status: 'pending' | 'completed' | 'failed';
  payment_method: string;
}

export interface Organization {
  id: string;
  name: string;
  subscription_status: 'active' | 'inactive';
  created_at: string;
}

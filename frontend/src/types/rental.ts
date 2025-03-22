export interface Person {
  id: string;
  name: string;
  email: string;
}

export interface Unit {
  id: string;
  unit_number: string;
  rent_amount: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  status: 'vacant' | 'occupied' | 'deleted';
  floor_plan: string;
  smart_lock_enabled: boolean;
  property_id: string;
  organization_id: string;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  total_units: number;
  owner_id: string;
  organization_id: string;
  property_type: 'residential' | 'commercial';
  units?: Unit[];
  monthly_revenue?: number;
  active_leases?: number;
  occupancy_rate?: number;
}

export interface RentalDetails extends Property {
  type: 'residential' | 'commercial' | 'industrial';
  unit: number;
  status: 'active' | 'inactive' | 'pending';
  propertyName?: string;
  manager?: string;
  propertyId?: string;
  startDate?: string;
  endDate?: string;
  rentAmount?: number;
  paymentFrequency?: string;
  resident?: {
    id: string;
    name: string;
    email: string;
  };
  agreementFile?: string;
  monthly_revenue?: number;
  active_leases?: number;
  occupancy_rate?: number;
}

export type NewRentalDetails = Omit<RentalDetails, 'id' | 'status'>;
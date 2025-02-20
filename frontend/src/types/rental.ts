export interface Person {
  id: string;
  name: string;
  email: string;
}

export interface Unit {
  id: string;
  property_id: string;
  unit_number: string;
  floor_plan?: string;
  square_feet?: number;
  bedrooms?: number;
  bathrooms?: number;
  rent_amount?: number;
  status: 'vacant' | 'occupied' | 'maintenance';
  created_at?: string;
  updated_at?: string;
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
  created_at?: string;
  updated_at?: string;
  units?: Unit[];
  owner?: {
    id: string;
    user: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
    };
  };
}

export interface RentalDetails extends Property {
  type: 'residential' | 'commercial' | 'industrial';
  unit: number;
  status: 'active' | 'inactive';
}

export type NewRentalDetails = Omit<RentalDetails, 'id' | 'status'>;
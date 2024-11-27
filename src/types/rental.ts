export interface Person {
  id: string;
  name: string;
  email: string;
}

export interface Unit {
  id?: string;
  name: string;
  rentAmount: number;
  occupancyStatus: 'occupied' | 'vacant';
  resident?: Person;
}

export interface RentalDetails {
  id: string;
  propertyName: string;
  type: 'residential' | 'commercial';
  owner: Person | null;
  manager: Person | null;
  units: Unit[];
  status: 'active' | 'inactive';
}

export type NewRentalDetails = Omit<RentalDetails, 'id' | 'status'>;
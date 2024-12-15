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
  propertyId: string;
  propertyName: string;
  address: string;
  unit: string;
  type: 'residential' | 'commercial';
  startDate: string;
  endDate: string;
  rentAmount: number;
  paymentFrequency: 'monthly' | 'yearly';
  resident: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  owner: string;
  manager: string;
  status: 'active' | 'inactive';
  agreementFile: string;
}

export type NewRentalDetails = Omit<RentalDetails, 'id' | 'status'>;
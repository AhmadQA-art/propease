export interface Property {
    id: string;
    name: string;
    units: Unit[];
  }
  
  export interface Unit {
    id: string;
    number: string;
    isAvailable: boolean;
  }
  
  export interface Resident {
    id: string;
    name: string;
    email: string;
    phone: string;
  }
  
  export interface RentalDetails {
    id: string;
    propertyId: string;
    propertyName: string;
    unit: string;
    type: 'residential' | 'commercial';
    startDate: string;
    endDate: string;
    rentAmount: number;
    paymentFrequency: 'monthly' | 'quarterly' | 'annually';
    resident: Resident;
    owner: string;
    manager: string;
    status: 'active' | 'pending' | 'expired';
    agreementFile?: string;
  }
  
  export type NewRentalDetails = Omit<RentalDetails, 'id' | 'status'>;
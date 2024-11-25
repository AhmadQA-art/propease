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
    resident: {
      name: string;
      imageUrl: string;
    };
    owner: string;
    manager: string;
    status: 'active' | 'pending' | 'expired';
    agreementFile?: string;
  }
  
  export type NewRentalDetails = Omit<RentalDetails, 'id' | 'status'>;
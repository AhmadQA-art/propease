export interface Tenant {
    id: string;
    name: string;
    email: string;
    phone: string;
    imageUrl?: string | null;
  }
  
  export interface LeaseCharge {
    id: string;
    amount: number;
    type: 'rent' | 'utility' | 'parking' | 'other';
    description: string;
  }
  
  export interface LateFee {
    amount: number;
    daysAfterDue: number;
    frequency: 'once' | 'daily' | 'weekly';
  }
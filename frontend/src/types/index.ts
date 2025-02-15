export interface User {
  id: string;
  email: string;
  role: 'admin' | 'landlord' | 'tenant';
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
}

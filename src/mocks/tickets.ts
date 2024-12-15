import { Ticket } from '../types/maintenance';

export const mockTickets: Ticket[] = [
  {
    id: 1,
    title: 'HVAC System Malfunction',
    description: 'The central air conditioning unit is not cooling properly',
    status: 'new',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    vendorId: 1,
    scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
  },
  {
    id: 2,
    title: 'Electrical Wiring Issue',
    description: 'Intermittent power loss in the east wing',
    status: 'in_progress',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    vendorId: 2,
    scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
  },
  {
    id: 3,
    title: 'Plumbing Leak',
    description: 'Water damage in the basement',
    status: 'new',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    // No vendor assigned
    // No scheduled date
  },
  {
    id: 4,
    title: 'Roof Repair',
    description: 'Damaged shingles after recent storm',
    status: 'resolved',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    vendorId: 3,
    scheduledDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
  }
];

export const mockVendors = [
  { 
    id: 1, 
    name: 'CoolAir HVAC Services', 
    specialty: 'Air Conditioning'
  },
  { 
    id: 2, 
    name: 'ElectriCare Solutions', 
    specialty: 'Electrical Repairs'
  },
  { 
    id: 3, 
    name: 'RoofMasters Inc.', 
    specialty: 'Roofing and Repairs'
  }
];

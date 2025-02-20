import { Ticket } from '../types/maintenance';

export const mockTickets: Ticket[] = [
  {
    id: "1",
    title: "HVAC Repair",
    description: "AC unit not cooling properly in Unit 204",
    priority: "medium",
    status: "new",
    openDate: new Date().toISOString(),
    vendorId: "1",
    scheduledDate: "2024-03-20T10:00:00Z"
  },
  {
    id: "2",
    title: "Plumbing Issue",
    description: "Leaking faucet in kitchen",
    priority: "high",
    status: "in-progress",
    openDate: new Date().toISOString(),
    vendorId: "2"
  },
  {
    id: "3",
    title: "Electrical Issue",
    description: "Power outlet not working",
    priority: "low",
    status: "resolved",
    openDate: new Date().toISOString(),
    vendorId: "3"
  }
];

export const mockVendors = [
  { 
    id: '1',
    name: 'CoolAir HVAC Services', 
    specialty: 'Air Conditioning'
  },
  { 
    id: '2',
    name: 'ElectriCare Solutions', 
    specialty: 'Electrical Repairs'
  },
  { 
    id: '3',
    name: 'RoofMasters Inc.', 
    specialty: 'Roofing and Repairs'
  }
];

import React from 'react';
import { Routes, Route, useParams, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Dashboard from '../pages/Dashboard';
import Rentals from '../pages/Rentals';
import RentalDetailsPage from '../pages/RentalDetails';
import AddRentalForm from './AddRentalForm'; 
import Properties from '../pages/Properties';
import Documents from '../pages/Documents';
import Finances from '../pages/Finances';
import Payments from '../pages/Payments';
import Team from '../pages/Team';
import Communications from '../pages/Communications';
import Maintenance from '../pages/Maintenance';
import { NewRentalDetails } from '../types/rental';

// Mock properties data
const mockProperties = [
  {
    id: 'P001',
    name: 'Sunset Apartments',
    units: [
      { id: 'U001', number: '204', isAvailable: true },
      { id: 'U002', number: '205', isAvailable: true },
      { id: 'U003', number: '206', isAvailable: false }
    ]
  },
  {
    id: 'P002',
    name: 'Harbor View Complex',
    units: [
      { id: 'U004', number: '512', isAvailable: true },
      { id: 'U005', number: '513', isAvailable: true }
    ]
  }
];

// Mock rentals data
const mockRentals = [
  {
    id: 'R001',
    propertyId: 'P001',
    propertyName: 'Sunset Apartments',
    unit: '206',
    type: 'residential',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    rentAmount: 2500,
    paymentFrequency: 'monthly',
    resident: {
      name: 'John Doe',
      imageUrl: 'https://i.pravatar.cc/150?u=john'
    },
    owner: 'Sarah Wilson',
    manager: 'Mike Thompson',
    status: 'active',
    agreementFile: 'rental-agreement-r001.pdf'
  },
  {
    id: 'R002',
    propertyId: 'P001',
    propertyName: 'Sunset Apartments',
    unit: '204',
    type: 'residential',
    startDate: '2024-02-01',
    endDate: '2024-08-31',
    rentAmount: 2200,
    paymentFrequency: 'monthly',
    resident: {
      name: 'Emma Johnson',
      imageUrl: null
    },
    owner: 'Sarah Wilson',
    manager: 'Mike Thompson',
    status: 'pending',
    agreementFile: null
  },
  {
    id: 'R003',
    propertyId: 'P002',
    propertyName: 'Harbor View Complex',
    unit: '512',
    type: 'commercial',
    startDate: '2023-06-01',
    endDate: '2023-12-31',
    rentAmount: 4500,
    paymentFrequency: 'quarterly',
    resident: {
      name: 'Tech Solutions Inc.',
      imageUrl: null
    },
    owner: 'Robert Chen',
    manager: 'Lisa Parker',
    status: 'expired',
    agreementFile: 'rental-agreement-r003.pdf'
  },
  {
    id: 'R004',
    propertyId: 'P002',
    propertyName: 'Harbor View Complex',
    unit: '513',
    type: 'commercial',
    startDate: '2024-01-15',
    endDate: '2025-01-14',
    rentAmount: 5000,
    paymentFrequency: 'monthly',
    resident: {
      name: 'Creative Studios Co.',
      imageUrl: 'https://i.pravatar.cc/150?u=creative'
    },
    owner: 'Robert Chen',
    manager: 'Lisa Parker',
    status: 'active',
    agreementFile: 'rental-agreement-r004.pdf'
  }
];

export default function Layout() {
  const [rentals, setRentals] = React.useState(mockRentals);

  const handleAddRental = (rental: NewRentalDetails) => {
    const newRental = {
      ...rental,
      id: `R${String(rentals.length + 1).padStart(3, '0')}`,
      status: 'active' as const
    };
    setRentals([...rentals, newRental]);
  };

  const handleEditRental = (id: string, updatedRental: NewRentalDetails) => {
    const updatedRentals = rentals.map(rental => {
      if (rental.id === id) {
        return { ...rental, ...updatedRental };
      }
      return rental;
    });
    setRentals(updatedRentals);
  };

  const handleDeleteRental = (id: string) => {
    setRentals(rentals.filter(rental => rental.id !== id));
  };

  return (
    <div className="flex h-screen bg-[#F8F8F8]">
      <Sidebar />
      <div className="flex-1 ml-64 p-4 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-sm min-h-[calc(100vh-2rem)]">
          <div className="p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route 
                path="/rentals" 
                element={<Rentals rentals={rentals} />} 
              />
              <Route 
                path="/rentals/add" 
                element={<AddRentalForm 
                  properties={mockProperties}
                  onSubmit={handleAddRental}
                  mode="add"
                />} 
              />
              <Route 
                path="/rentals/:id/edit" 
                element={<RentalFormWrapper 
                  properties={mockProperties}
                  rentals={rentals}
                  onSubmit={handleEditRental}
                />} 
              />
              <Route 
                path="/rentals/:id" 
                element={<RentalDetailsPageWrapper 
                  rentals={rentals} 
                  onEdit={handleEditRental} 
                  onDelete={handleDeleteRental} 
                />} 
              />
              <Route path="/properties" element={<Properties />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/finances" element={<Finances />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/team" element={<Team />} />
              <Route path="/communications" element={<Communications />} />
              <Route path="/maintenance" element={<Maintenance />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
}

function RentalDetailsPageWrapper({ rentals, onEdit, onDelete }) {
  const { id } = useParams();
  const rental = rentals.find(r => r.id === id);

  return (
    <RentalDetailsPage 
      rental={rental} 
      onEdit={onEdit}
      onDelete={onDelete} 
    />
  );
}

function RentalFormWrapper({ properties, rentals, onSubmit }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const rental = rentals.find(r => r.id === id);

  if (!rental) {
    navigate('/rentals');
    return null;
  }

  return (
    <AddRentalForm 
      properties={properties}
      initialData={rental}
      onSubmit={(updatedRental) => {
        onSubmit(id, updatedRental);
        navigate('/rentals');
      }}
      mode="edit"
    />
  );
}
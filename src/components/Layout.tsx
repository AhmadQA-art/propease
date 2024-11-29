import React from 'react';
import { Routes, Route, useParams, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Dashboard from '../pages/Dashboard';
import Rentals from '../pages/Rentals';
import RentalDetailsPage from '../pages/RentalDetails';
import AddRentalForm from './AddRentalForm';
import AddLeaseForm from './AddLeaseForm';
import Documents from '../pages/Documents';
import Finances from '../pages/Finances';
import Payments from '../pages/Payments';
import People from '../pages/People';
import Communications from '../pages/Communications';
import Maintenance from '../pages/Maintenance';
import Leases from '../pages/Leases';
import { NewRentalDetails, RentalDetails, Person } from '../types/rental';
import { dummyRentals } from '../data/dummyRentals';

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

// Mock data for property managers and owners
const mockPropertyManagers = [
  { id: '1', name: 'John Manager', email: 'john@example.com' },
  { id: '2', name: 'Sarah Manager', email: 'sarah@example.com' },
  { id: '3', name: 'Mike Manager', email: 'mike@example.com' },
];

const mockPropertyOwners = [
  { id: '1', name: 'Alice Owner', email: 'alice@example.com' },
  { id: '2', name: 'Bob Owner', email: 'bob@example.com' },
  { id: '3', name: 'Charlie Owner', email: 'charlie@example.com' },
];

export default function Layout() {
  const navigate = useNavigate();
  const [rentals, setRentals] = React.useState(dummyRentals);
  const [leases, setLeases] = React.useState([]);

  const handleAddLease = (leaseData) => {
    const newLease = {
      ...leaseData,
      id: `L${String(leases.length + 1).padStart(3, '0')}`,
      status: 'active' as const
    };
    setLeases([...leases, newLease]);
  };

  const handleAddRental = (rental: NewRentalDetails) => {
    const newRental = {
      ...rental,
      id: `R${String(rentals.length + 1).padStart(3, '0')}`,
      status: 'active' as const
    };
    setRentals([...rentals, newRental]);
    navigate('/rentals');
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
      <div className="flex-1 ml-64">
        <div className="h-full bg-white">
          <div className="p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/rentals" element={<Rentals rentals={rentals} />} />
              <Route 
                path="/rentals/add" 
                element={
                  <AddRentalForm 
                    onSubmit={handleAddRental}
                    mode="add"
                    propertyManagers={mockPropertyManagers}
                    propertyOwners={mockPropertyOwners}
                  />
                } 
              />
              <Route 
                path="/rentals/:id/edit" 
                element={
                  <RentalFormWrapper 
                    rentals={rentals}
                    onSubmit={handleEditRental}
                    propertyManagers={mockPropertyManagers}
                    propertyOwners={mockPropertyOwners}
                  />
                } 
              />
              <Route 
                path="/rentals/:id" 
                element={
                  <RentalDetailsPageWrapper 
                    rentals={rentals} 
                    onEdit={handleEditRental} 
                    onDelete={handleDeleteRental} 
                  />
                } 
              />
              <Route path="/documents" element={<Documents />} />
              <Route path="/finances" element={<Finances />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/people" element={<People />} />
              <Route path="/communications" element={<Communications />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/leases" element={<Leases leases={leases} />} />
              <Route 
                path="/leases/add" 
                element={
                  <AddLeaseForm 
                    properties={mockProperties}
                    onSubmit={(leaseData, rentalData) => {
                      handleAddRental(rentalData);
                      handleAddLease(leaseData);
                      navigate('/leases');
                    }}
                  />
                } 
              />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
}

interface RentalDetailsWrapperProps {
  rentals: RentalDetails[];
  onEdit: (id: string, rental: NewRentalDetails) => void;
  onDelete: (id: string) => void;
}

interface RentalFormWrapperProps {
  rentals: RentalDetails[];
  onSubmit: (id: string, rental: NewRentalDetails) => void;
  propertyManagers: Person[];
  propertyOwners: Person[];
}

function RentalDetailsPageWrapper({ rentals, onEdit, onDelete }: RentalDetailsWrapperProps) {
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

function RentalFormWrapper({ rentals, onSubmit, propertyManagers, propertyOwners }: RentalFormWrapperProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const rental = rentals.find(r => r.id === id);

  if (!rental) {
    navigate('/rentals');
    return null;
  }

  return (
    <AddRentalForm 
      initialData={rental}
      onSubmit={(updatedRental) => {
        onSubmit(id, updatedRental);
        navigate('/rentals');
      }}
      mode="edit"
      propertyManagers={propertyManagers}
      propertyOwners={propertyOwners}
    />
  );
}
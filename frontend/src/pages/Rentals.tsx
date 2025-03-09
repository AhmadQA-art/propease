import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import RentalCard from '../components/RentalCard';
import AddRentalForm from '../components/AddRentalForm';
import { rentalService } from '../services/rental.service';
import { Property, RentalDetails } from '../types/rental';
import { Person } from '../types/person';

export default function Rentals() {
  const navigate = useNavigate();
  const { isAuthenticated, userProfile } = useAuth();
  const [rentals, setRentals] = useState<RentalDetails[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const propertyManagers: Person[] = [];
  const propertyOwners: Person[] = [];

  const transformPropertyToRentalDetails = (property: Property): RentalDetails => {
    return {
      ...property,
      type: 'residential', // Default type, you might want to store this in the database
      unit: property.total_units,
      status: 'active', // Default status
      propertyName: property.name,
      rentAmount: property.units?.[0]?.rentAmount || 0,
    };
  };

  useEffect(() => {
    if (isAuthenticated && userProfile?.organization_id) {
      loadRentals();
    }
  }, [isAuthenticated, userProfile]);

  const loadRentals = async () => {
    if (!userProfile?.organization_id) {
      setError('No organization found. Please contact support.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await rentalService.getRentals(userProfile.organization_id);
      const transformedData = (data || []).map(transformPropertyToRentalDetails);
      setRentals(transformedData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load rentals';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRental = async (rentalData: Omit<Property, 'id'>) => {
    if (!userProfile?.organization_id) {
      toast.error('No organization found. Please contact support.');
      return;
    }

    try {
      const newRental = {
        ...rentalData,
        organization_id: userProfile.organization_id
      };
      await rentalService.createRental(newRental);
      toast.success('Rental property added successfully');
      loadRentals();
      setShowAddForm(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add rental';
      toast.error(message);
    }
  };

  if (!isAuthenticated) {
    return <div>Please log in to view rentals.</div>;
  }

  if (!userProfile?.organization_id) {
    return <div>No organization found. Please contact support.</div>;
  }

  if (showAddForm) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <AddRentalForm
          onSubmit={handleAddRental}
          onCancel={() => setShowAddForm(false)}
          propertyManagers={propertyManagers}
          propertyOwners={propertyOwners}
          mode="add"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#2C3539]">Rentals</h1>
          <p className="text-gray-500">Manage your rental properties</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center px-4 py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Rental
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2C3539]" />
        </div>
      ) : error ? (
        <div className="text-center text-red-600 py-8">{error}</div>
      ) : rentals.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No rental properties found. Click "Add Rental" to create one.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rentals.map((rental) => (
            <RentalCard
              key={rental.id}
              rental={rental}
              onClick={() => navigate(`/rentals/${rental.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
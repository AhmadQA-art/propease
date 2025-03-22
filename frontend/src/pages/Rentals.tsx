import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import RentalCard from '../components/RentalCard';
import AddRentalForm from '../components/AddRentalForm';
import { rentalService } from '../services/rental.service';
import { Property, RentalDetails } from '../types/rental';
import { Person } from '../types/person';

// Define CustomUnit to match the one in AddRentalForm
interface CustomUnit {
  id?: string;
  unit_number: string;
  rent_amount: number;
  bedrooms: number;
  bathrooms: number;
  area: number; // Changed from square_feet to area
  status: string;
  floor_plan: string;
  smart_lock_enabled: boolean;
  property_id?: string;
}

// Extend Property type to include property_type
interface ExtendedProperty extends Property {
  property_type?: 'residential' | 'commercial';
}

export default function Rentals() {
  const navigate = useNavigate();
  const { isAuthenticated, userProfile } = useAuth();
  const [rentals, setRentals] = useState<RentalDetails[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [propertyManagers, setPropertyManagers] = useState<Person[]>([]);
  const [propertyOwners, setPropertyOwners] = useState<Person[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>('');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const dataLoadedRef = useRef(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  const transformPropertyToRentalDetails = (property: Property): RentalDetails => {
    // Use type assertion to handle property_type
    const extendedProperty = property as unknown as ExtendedProperty;
    return {
      ...property,
      type: extendedProperty.property_type || 'residential', // Use property_type if available
      unit: property.total_units,
      status: 'active', // Default status
      propertyName: property.name,
      rentAmount: property.units?.[0]?.rentAmount || 0,
    };
  };

  useEffect(() => {
    if (isAuthenticated && userProfile?.organization_id && !dataLoadedRef.current) {
      dataLoadedRef.current = true;
      loadRentals();
      loadPropertyOwnersAndManagers();
    }
  }, [isAuthenticated, userProfile]);

  // Clean up ref when organization changes, not every time component unmounts
  useEffect(() => {
    // This effect only runs when organization_id changes
    // When a new organization is selected, we want to reload the data
    if (userProfile?.organization_id) {
      dataLoadedRef.current = false;
    }
    
    return () => {
      // Only reset the ref when organization changes, not on normal unmounts
    };
  }, [userProfile?.organization_id]);

  // Add click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (isFilterDropdownOpen &&
          filterDropdownRef.current &&
          filterButtonRef.current &&
          !filterDropdownRef.current.contains(event.target as Node) &&
          !filterButtonRef.current.contains(event.target as Node)) {
        setIsFilterDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterDropdownOpen]);

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

  const loadPropertyOwnersAndManagers = async () => {
    if (!userProfile?.organization_id) return;
    
    try {
      const owners = await rentalService.getOwners(userProfile.organization_id);
      const managers = await rentalService.getPropertyManagers(userProfile.organization_id);
      
      setPropertyOwners(owners || []);
      setPropertyManagers(managers || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load owners and managers';
      toast.error(message);
    }
  };

  const handleAddRental = async (data: { property: Omit<ExtendedProperty, 'id'>, units: Omit<CustomUnit, 'id' | 'property_id'>[]} ) => {
    if (!userProfile?.organization_id) {
      toast.error('No organization found. Please contact support.');
      return;
    }

    try {
      const propertyData = {
        ...data.property,
        organization_id: userProfile.organization_id
      };
      
      await rentalService.createRental(propertyData, data.units);
      toast.success('Rental property added successfully');
      loadRentals();
      setShowAddForm(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add rental';
      toast.error(message);
    }
  };

  // Filter rentals by name and property type
  const filteredRentals = rentals.filter(rental => {
    const matchesSearch = !searchQuery || 
      (rental.propertyName || rental.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPropertyType = !propertyTypeFilter || 
      rental.type.toLowerCase() === propertyTypeFilter.toLowerCase();
    
    return matchesSearch && matchesPropertyType;
  });

  const handleApplyFilters = () => {
    setIsFilterDropdownOpen(false);
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
      </div>

      {/* Search and Filter Controls */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search rentals by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button 
            ref={filterButtonRef}
            onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
            className="h-10 w-10 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-5 h-5 text-[#2C3539]" />
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-4 py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors whitespace-nowrap"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Rental
          </button>
        </div>
        {isFilterDropdownOpen && (
          <div 
            ref={filterDropdownRef}
            className="absolute right-6 mt-32 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10 p-4"
          >
            <h3 className="font-medium text-[#2C3539] mb-2">Filter Properties</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#6B7280] mb-1">Property Type</label>
                <select 
                  value={propertyTypeFilter}
                  onChange={(e) => setPropertyTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent"
                >
                  <option value="">All Types</option>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>
              <div className="pt-2 flex justify-end">
                <button 
                  onClick={handleApplyFilters}
                  className="px-4 py-2 bg-[#2C3539] text-white rounded-lg text-sm"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2C3539]" />
        </div>
      ) : error ? (
        <div className="text-center text-red-600 py-8">{error}</div>
      ) : filteredRentals.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {searchQuery ? "No rentals match your search." : "No rental properties found. Click \"Add Rental\" to create one."}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRentals.map((rental) => (
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
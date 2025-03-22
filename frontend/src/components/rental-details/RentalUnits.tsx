import React, { useState, useEffect } from 'react';
import { Search, Plus, DoorOpen, DollarSign, User, Wrench, Filter } from 'lucide-react';
import { rentalService } from '../../services/rental.service';
import UnitDetailsDrawer from './UnitDetailsDrawer';
import AddUnitForm from './AddUnitForm';
import { Unit } from '../../types/rental';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

// Helper function to cast Lucide icon components to React elements
const IconWrapper = ({ icon: Icon, size = 20, className = "" }) => {
  return <Icon size={size} className={className} />;
};

interface RentalUnitsProps {
  rentalId: string;
}

export default function RentalUnits({ rentalId }: RentalUnitsProps) {
  const { userProfile } = useAuth();
  const [units, setUnits] = useState<Unit[]>([]);
  const [filteredUnits, setFilteredUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Load all units for this rental
  useEffect(() => {
    const fetchUnits = async () => {
      if (!rentalId || !userProfile?.organization_id) return;
      
      setLoading(true);
      try {
        const response = await rentalService.getRentalById(rentalId, userProfile.organization_id);
        if (response && response.units) {
          setUnits(response.units);
          setFilteredUnits(response.units);
        }
      } catch (error) {
        console.error('Error fetching units:', error);
        toast.error('Failed to load units');
      } finally {
        setLoading(false);
      }
    };

    fetchUnits();
  }, [rentalId, userProfile?.organization_id]);

  // Update the filter effect to handle both search and status filters
  useEffect(() => {
    // First filter out deleted units
    let filtered = units.filter(unit => unit.status.toLowerCase() !== 'deleted');

    // Apply search filter
    if (searchQuery.trim()) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(unit => {
        return (
          String(unit.unit_number).toLowerCase().includes(lowerCaseQuery) ||
          unit.status.toLowerCase().includes(lowerCaseQuery) ||
          (unit.floor_plan && unit.floor_plan.toLowerCase().includes(lowerCaseQuery))
        );
      });
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(unit => unit.status.toLowerCase() === statusFilter.toLowerCase());
    }
    
    setFilteredUnits(filtered);
  }, [searchQuery, units, statusFilter]);

  const handleAddUnit = async (formData: any) => {
    if (!userProfile?.organization_id) {
      toast.error('Organization information is missing');
      return;
    }

    try {
      // There's a mismatch between the TypeScript Unit type and the actual database schema:
      // - TypeScript uses camelCase (e.g. rentAmount)
      // - Database uses snake_case (e.g. rent_amount)
      // - Some fields in the type don't exist in the database (name, occupancyStatus)
      
      // Map status values correctly
      let statusValue = 'vacant';
      if (formData.status) {
        // Convert UI status values to database values
        const statusMap: { [key: string]: 'vacant' | 'occupied' | 'deleted' } = {
          'available': 'vacant',
          'vacant': 'vacant',
          'occupied': 'occupied',
          'maintenance': 'deleted',
          'deleted': 'deleted'
        };
        statusValue = statusMap[formData.status.toLowerCase()] || 'vacant';
      }

      // Create a unit data object with fields matching the actual database schema
      const unitData = {
        unit_number: formData.unitNumber,
        status: statusValue as 'vacant' | 'occupied' | 'deleted',
        rent_amount: formData.rentAmount || 0, // Database expects snake_case
        floor_plan: formData.floorPlan,
        area: formData.area,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms
      };

      // Type assertion to bypass the TypeScript checking
      // We're intentionally using 'any' here because the Unit type
      // does not match the actual database schema structure
      const newUnits = await rentalService.addUnitsToProperty(
        rentalId, 
        [unitData as any],
        userProfile.organization_id
      );
      
      if (newUnits && newUnits.length > 0) {
        // Add the new unit to the list
        setUnits(prevUnits => [...prevUnits, newUnits[0]]);
        toast.success('Unit added successfully');
        setIsAddUnitOpen(false);
      }
    } catch (error) {
      console.error('Error adding unit:', error);
      
      // Provide more specific error messages based on common issues
      let errorMessage = 'Failed to add unit';
      
      if (error instanceof Error) {
        const errorText = error.message;
        
        if (errorText.includes('duplicate key')) {
          errorMessage = 'A unit with this number already exists';
        } else if (errorText.includes('already exist')) {
          errorMessage = errorText;
        } else if (errorText.includes('not found')) {
          errorMessage = 'The rental property was not found';
        } else if (errorText.includes('schema cache')) {
          // This likely means there's a mismatch between frontend and database schema
          errorMessage = 'Database schema error - please contact support';
        } else {
          // Include the actual error for debugging
          errorMessage = `Error: ${errorText}`;
        }
      }
      
      toast.error(errorMessage);
    }
  };

  const handleDeleteUnit = async (unitId: string) => {
    if (!userProfile?.organization_id) {
      toast.error('Organization information is missing');
      return;
    }

    try {
      await rentalService.deleteUnit(unitId, userProfile.organization_id);
      setUnits(prevUnits => prevUnits.filter(unit => unit.id !== unitId));
      toast.success('Unit deleted');
      setIsDrawerOpen(false);
    } catch (error) {
      console.error('Error deleting unit:', error);
      toast.error('Failed to delete unit');
    }
  };

  const openUnitDetails = (unit: Unit) => {
    setSelectedUnit(unit);
    setIsDrawerOpen(true);
  };

  const getUnitStatusClass = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === 'vacant') return 'bg-green-100 text-green-800';
    if (lowerStatus === 'occupied') return 'bg-gray-100 text-gray-800';
    if (lowerStatus === 'deleted') return 'hidden'; // Hide deleted units
    return 'bg-amber-100 text-amber-800'; // maintenance
  };

  const closeAddUnitForm = () => {
    setIsAddUnitOpen(false);
  };

  return (
    <div className="relative">
      {/* Search & Add */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
            <input
              type="text"
              placeholder="Search units..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        <div className="relative ml-4">
          <button 
            onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
            className="h-10 w-10 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-5 h-5 text-[#2C3539]" />
          </button>
          {isFilterDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10 p-4">
              <h3 className="font-medium text-[#2C3539] mb-2">Filter Units</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-1">Status</label>
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent"
                  >
                    <option value="all">All Statuses</option>
                    <option value="vacant">Vacant</option>
                    <option value="occupied">Occupied</option>
                  </select>
                </div>
                <div className="pt-2 flex justify-end">
                  <button 
                    onClick={() => {
                      setStatusFilter('all');
                      setIsFilterDropdownOpen(false);
                    }}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 mr-2"
                  >
                    Reset
                  </button>
                  <button 
                    onClick={() => setIsFilterDropdownOpen(false)}
                    className="px-4 py-2 bg-[#2C3539] text-white rounded-lg text-sm"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <button
          className="h-9 px-4 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors text-sm flex items-center ml-4"
          onClick={() => setIsAddUnitOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Unit
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2C3539]"></div>
        </div>
      ) : filteredUnits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500 space-y-2">
          <svg className="w-12 h-12 text-gray-300" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 4h3a2 2 0 0 1 2 2v14"></path>
            <path d="M2 20h3"></path>
            <path d="M13 20h9"></path>
            <path d="M10 12v.01"></path>
            <path d="M13 4.562v16.157a1 1 0 0 1-1.242.97L5 20V5.562a2 2 0 0 1 1.515-1.94l4-1A2 2 0 0 1 13 4.561Z"></path>
          </svg>
          <p className="text-lg">No units found</p>
          <p className="text-sm">
            {units.length === 0
              ? "This property doesn't have any units yet"
              : "No units match your search criteria"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
        {filteredUnits.map((unit) => (
          <div
            key={unit.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:border-gray-200 transition-colors cursor-pointer"
              onClick={() => openUnitDetails(unit)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-[#2C3539]" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 4h3a2 2 0 0 1 2 2v14"></path>
                    <path d="M2 20h3"></path>
                    <path d="M13 20h9"></path>
                    <path d="M10 12v.01"></path>
                    <path d="M13 4.562v16.157a1 1 0 0 1-1.242.97L5 20V5.562a2 2 0 0 1 1.515-1.94l4-1A2 2 0 0 1 13 4.561Z"></path>
                  </svg>
                  <span className="font-medium text-[#2C3539]">{unit.unit_number}</span>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getUnitStatusClass(unit.status)}`}>
                  {unit.status}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-4">
                {/* Monthly Rent */}
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-[#6B7280] mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path>
                    <path d="M12 18V6"></path>
                  </svg>
                  <span className="text-sm text-[#2C3539]">${unit.rent_amount?.toLocaleString() || 0}/month</span>
                </div>

                {/* Floor Plan */}
                {unit.floor_plan && (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-[#6B7280] mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                    <span className="text-sm text-[#2C3539]">{unit.floor_plan}</span>
                  </div>
                )}

                {/* Status indicator for non-occupied units */}
                {unit.status.toLowerCase() !== 'occupied' && (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-[#6B7280] mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span className="text-sm text-[#2C3539]">{unit.status.charAt(0).toUpperCase() + unit.status.slice(1)}</span>
                  </div>
                )}
              </div>

              {/* Specifications Row */}
              <div className="mt-3 flex items-center space-x-4">
                {unit.bedrooms !== undefined && (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-[#6B7280] mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 9V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5"></path>
                      <path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H6v-2a2 2 0 0 0-4 0Z"></path>
                      <path d="M4 18v3"></path>
                      <path d="M20 18v3"></path>
                      <path d="M12 4v9"></path>
                    </svg>
                    <span className="text-sm text-[#2C3539]">{unit.bedrooms} Bedrooms</span>
                  </div>
                )}
                
                {unit.bathrooms !== undefined && (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-[#6B7280] mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"></path>
                      <line x1="10" y1="5" x2="8" y2="7"></line>
                      <line x1="2" y1="12" x2="22" y2="12"></line>
                      <line x1="7" y1="19" x2="7" y2="21"></line>
                      <line x1="17" y1="19" x2="17" y2="21"></line>
                    </svg>
                    <span className="text-sm text-[#2C3539]">{unit.bathrooms} Bathrooms</span>
                </div>
                )}
                
                {unit.area && (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-[#6B7280] mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
                      <path d="M17 21h-9a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6l5 5v11a2 2 0 0 1-2 2z"></path>
                      <path d="M3 11v10a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V11"></path>
                    </svg>
                    <span className="text-sm text-[#2C3539]">{unit.area} sq m</span>
                </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Unit Details Drawer */}
      {selectedUnit && (
      <UnitDetailsDrawer
        unit={selectedUnit}
        isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          onDelete={handleDeleteUnit}
        />
      )}

      {/* Add Unit Form */}
      {isAddUnitOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
      <AddUnitForm
        onSubmit={handleAddUnit}
              onClose={closeAddUnitForm}
            />
          </div>
        </div>
      )}
      
      {/* Backdrop when drawer is open */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 z-30"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import PersonSelect from './PersonSelect';
import { Person, Property } from '../types/rental';

// Define the CustomUnit interface to match the database schema
interface CustomUnit {
  id?: string;
  unit_number: string;
  rent_amount: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  status: 'vacant' | 'occupied' | 'deleted';
  floor_plan: string;
  smart_lock_enabled: boolean;
  property_id?: string;
}

interface FormUnit {
  id?: string;
  unit_number: string;
  rent_amount: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  status: 'vacant' | 'occupied' | 'deleted';
  floor_plan: string;
  smart_lock_enabled: boolean;
}

interface FormData {
  // Property fields
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  total_units: number;
  owner_id: string;
  organization_id: string;
  property_manager_id?: string;
  property_status?: 'active' | 'inactive' | 'maintenance';
  property_type: 'residential' | 'commercial';
  
  // Units array
  units: FormUnit[];
}

interface AddRentalFormProps {
  onSubmit: (data: { property: Omit<Property, 'id'>, units: Omit<CustomUnit, 'id' | 'property_id'>[]} ) => void;
  onCancel: () => void;
  initialData?: Property;
  mode?: 'add' | 'edit';
  propertyManagers: Person[];
  propertyOwners: Person[];
}

const FLOOR_PLAN_OPTIONS = [
  'Studio',
  '1 Bedroom',
  '2 Bedrooms',
  '3 Bedrooms',
  '4 Bedrooms',
  'Penthouse',
  'Townhouse',
  'Villa'
];

export default function AddRentalForm({ 
  onSubmit, 
  onCancel, 
  initialData, 
  mode = 'add',
  propertyManagers = [],
  propertyOwners = []
}: AddRentalFormProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    total_units: 0,
    owner_id: '',
    organization_id: '',
    property_type: 'residential',
    units: []
  });

  useEffect(() => {
    if (initialData && mode === 'edit') {
      // Map status values from API to the form values
      const mapStatus = (status: string): 'vacant' | 'occupied' | 'deleted' => {
        const statusMap: Record<string, 'vacant' | 'occupied' | 'deleted'> = {
          'Available': 'vacant',
          'Vacant': 'vacant',
          'Occupied': 'occupied',
          'Maintenance': 'vacant',
          'Reserved': 'vacant',
          'Deleted': 'deleted'
        };
        
        // Convert to lowercase first to ensure consistent matching
        const normalizedStatus = status.toLowerCase();
        
        // Direct match for our expected values
        if (normalizedStatus === 'vacant' || normalizedStatus === 'occupied' || normalizedStatus === 'deleted') {
          return normalizedStatus as 'vacant' | 'occupied' | 'deleted';
        }
        
        // Try to map from the status map
        const mappedStatus = statusMap[status];
        
        // Return the mapped status or default to vacant
        return mappedStatus || 'vacant';
      };

      const mappedUnits: FormUnit[] = (initialData.units || []).map(unit => ({
        id: unit.id, // Preserve unit ID for existing units
        unit_number: unit.unit_number || '',
        rent_amount: unit.rent_amount || 0,
        bedrooms: unit.bedrooms || 0,
        bathrooms: unit.bathrooms || 0,
        area: unit.area || 0, // Changed from square_feet to area
        status: mapStatus(unit.status), // Use the mapping function here
        floor_plan: unit.floor_plan || '',
        smart_lock_enabled: unit.smart_lock_enabled || false
      }));
  
      setFormData({
        name: initialData.name,
        address: initialData.address,
        city: initialData.city,
        state: initialData.state,
        zip_code: initialData.zip_code,
        total_units: initialData.total_units,
        owner_id: initialData.owner_id,
        organization_id: initialData.organization_id,
        property_type: initialData.property_type,
        units: mappedUnits
      });
    }
  }, [initialData, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.units.length === 0) {
      toast.error('Please add at least one unit to the property');
      return;
    }
    
    const unitNumbers = formData.units.map(unit => unit.unit_number);
    const uniqueUnitNumbers = new Set(unitNumbers);
    
    if (uniqueUnitNumbers.size !== unitNumbers.length) {
      toast.error('Each unit must have a unique unit number. Please fix duplicate unit numbers.');
      return;
    }
    
    const propertyData = {
      name: formData.name,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zip_code: formData.zip_code,
      total_units: formData.units.length,
      owner_id: formData.owner_id || null,
      organization_id: formData.organization_id,
      property_type: formData.property_type,
    };
    
    // Map status values to ensure they use the expected enum values
    const units = formData.units.map(unit => {
      // Ensure status is one of the expected values: 'vacant', 'occupied', 'deleted'
      let normalizedStatus: 'vacant' | 'occupied' | 'deleted' = 'vacant';
      
      if (typeof unit.status === 'string') {
        const status = unit.status.toLowerCase();
        if (status === 'occupied') normalizedStatus = 'occupied';
        else if (status === 'deleted') normalizedStatus = 'deleted';
        else normalizedStatus = 'vacant'; // Default to vacant for any other value
      }
      
      const unitData: any = {
        unit_number: unit.unit_number,
        rent_amount: unit.rent_amount,
        bedrooms: unit.bedrooms,
        bathrooms: unit.bathrooms,
        area: unit.area,
        status: normalizedStatus,
        floor_plan: unit.floor_plan,
        smart_lock_enabled: unit.smart_lock_enabled
      };
      
      // If this is an existing unit, include its ID
      if (unit.id) {
        unitData.id = unit.id;
      }
      
      return unitData;
    });
    
    onSubmit({
      property: propertyData,
      units: units
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add validation function to check for duplicate unit numbers
  const validateUnitNumber = (unitNumber: string, index: number) => {
    const duplicateIndex = formData.units.findIndex(
      (unit, i) => i !== index && unit.unit_number === unitNumber
    );
    if (duplicateIndex !== -1) {
      toast.error(`Unit number "${unitNumber}" is already used by another unit`);
      return false;
    }
    return true;
  };

  // Update the updateUnit function to check for duplicate unit numbers
  const updateUnit = (index: number, updatedUnit: Partial<FormUnit>) => {
    // If unit number is being updated, check for duplicates
    if ('unit_number' in updatedUnit) {
      const unitNumber = updatedUnit.unit_number as string;
      if (unitNumber && !validateUnitNumber(unitNumber, index)) {
        return; // Don't update if duplicate is found
      }
    }

    setFormData(prev => ({
      ...prev,
      units: prev.units.map((unit, i) => 
        i === index ? { ...unit, ...updatedUnit } : unit
      ),
    }));
  };

  // Update the addUnit function to ensure unique unit numbers
  const addUnit = () => {
    let unitNumber = '';
    let counter = formData.units.length + 1;
    
    do {
      unitNumber = `Unit ${counter}`;
      counter++;
    } while (formData.units.some(unit => unit.unit_number === unitNumber));
    
    setFormData(prev => ({
      ...prev,
      units: [
        ...prev.units,
        {
          unit_number: unitNumber,
          rent_amount: 0,
          bedrooms: 1,
          bathrooms: 1,
          area: 0, // Changed from square_feet to area
          status: 'vacant', // Updated default status
          floor_plan: '',
          smart_lock_enabled: false
        },
      ],
    }));
  };

  const removeUnit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      units: prev.units.filter((_, i) => i !== index),
    }));
  };

  const handleBack = () => {
    onCancel();
    navigate('/rentals');
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <button
          type="button"
          onClick={handleBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#2C3539]" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#2C3539]">
            {mode === 'add' ? 'Add New Rental' : 'Edit Rental'}
          </h1>
          <p className="text-[#6B7280] mt-1">
            {mode === 'add' ? 'Create a new rental property' : 'Update rental property information'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Property Info */}
        <div className="bg-white rounded-lg p-6 w-full">
          <h2 className="text-xl font-semibold text-[#2C3539] mb-6">Property Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#2C3539] mb-2">
                Property Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent bg-white"
                placeholder="Enter property name"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#2C3539] mb-2">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent bg-white"
                placeholder="Enter street address"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2C3539] mb-2">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent bg-white"
                placeholder="Enter city"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2C3539] mb-2">
                State
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent bg-white"
                placeholder="Enter state"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2C3539] mb-2">
                ZIP Code
              </label>
              <input
                type="text"
                name="zip_code"
                value={formData.zip_code}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent bg-white"
                placeholder="Enter ZIP code"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2C3539] mb-2">
                Property Status
              </label>
              <select
                name="property_status"
                value={formData.property_status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent bg-white"
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Property Owner (Optional) */}
            <div>
              <label className="block text-sm font-medium text-[#2C3539] mb-2">
                Property Owner (Optional)
              </label>
              <select
                name="owner_id"
                value={formData.owner_id}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent bg-white"
              >
                <option value="">Select Owner</option>
                {propertyOwners.map(owner => (
                  <option key={owner.id} value={owner.id}>{owner.name}</option>
                ))}
              </select>
            </div>

            {/* Property Manager (Optional) */}
            <div>
              <label className="block text-sm font-medium text-[#2C3539] mb-2">
                Property Manager (Optional)
              </label>
              <select
                name="property_manager_id"
                value={formData.property_manager_id}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent bg-white"
              >
                <option value="">Select Manager</option>
                {propertyManagers.map(manager => (
                  <option key={manager.id} value={manager.id}>{manager.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2C3539] mb-2">
                Property Type
              </label>
              <select
                name="property_type"
                value={formData.property_type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent bg-white"
                required
              >
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
          </div>
        </div>

        {/* Units */}
        <div className="bg-white rounded-lg p-6 w-full mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-[#2C3539]">Units</h2>
            <button
              type="button"
              onClick={addUnit}
              className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Unit
            </button>
          </div>
          
          {formData.units.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500">No units added yet. Click "Add Unit" to create one.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {formData.units.map((unit, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg relative">
                  <button
                    type="button"
                    onClick={() => removeUnit(index)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Remove unit"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  
                  <h3 className="font-semibold text-[#2C3539] mb-4">Unit #{index + 1}</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#2C3539] mb-2">
                        Unit Number/Identifier
                      </label>
                      <input
                        type="text"
                        value={unit.unit_number}
                        onChange={(e) => updateUnit(index, { unit_number: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent bg-white"
                        placeholder="e.g. 101A"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[#2C3539] mb-2">
                        Monthly Rent
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">$</span>
                        <input
                          type="number"
                          value={unit.rent_amount}
                          onChange={(e) => updateUnit(index, { rent_amount: Number(e.target.value) })}
                          className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent bg-white"
                          placeholder="1200"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[#2C3539] mb-2">
                        Bedrooms
                      </label>
                      <input
                        type="number"
                        value={unit.bedrooms}
                        onChange={(e) => updateUnit(index, { bedrooms: Number(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent bg-white"
                        placeholder="2"
                        min="0"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[#2C3539] mb-2">
                        Bathrooms
                      </label>
                      <input
                        type="number"
                        value={unit.bathrooms}
                        onChange={(e) => updateUnit(index, { bathrooms: Number(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent bg-white"
                        placeholder="1"
                        min="0"
                        step="0.5"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[#2C3539] mb-2">
                        Area (m²)
                      </label>
                      <input
                        type="number"
                        value={unit.area}
                        onChange={(e) => updateUnit(index, { area: Number(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent bg-white"
                        placeholder="850"
                        min="0"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[#2C3539] mb-2">
                        Floor Plan
                      </label>
                      <select
                        value={unit.floor_plan}
                        onChange={(e) => updateUnit(index, { floor_plan: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent bg-white"
                      >
                        <option value="">Select Floor Plan</option>
                        {FLOOR_PLAN_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`smartLock-${index}`}
                        checked={unit.smart_lock_enabled}
                        onChange={(e) => updateUnit(index, { smart_lock_enabled: e.target.checked })}
                        className="h-4 w-4 text-[#2C3539] focus:ring-[#2C3539] border-gray-300 rounded"
                      />
                      <label htmlFor={`smartLock-${index}`} className="ml-2 block text-sm text-[#2C3539]">
                        Smart Lock Enabled
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleBack}
            className="px-6 py-2 border border-gray-300 rounded-lg text-[#2C3539] hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3A4449] transition-colors"
          >
            {mode === 'add' ? 'Create Property' : 'Update Property'}
          </button>
        </div>
      </form>
    </div>
  );
}

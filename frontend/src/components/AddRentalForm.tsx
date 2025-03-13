import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import PersonSelect from './PersonSelect';
import { NewRentalDetails, RentalDetails, Person, Unit, Property } from '../types/rental';

interface AddRentalFormProps {
  onSubmit: (data: { property: Omit<Property, 'id'>, units: Omit<Unit, 'id' | 'property_id'>[]} ) => void;
  onCancel: () => void;
  initialData?: Property;
  mode?: 'add' | 'edit';
  propertyManagers: Person[];
  propertyOwners: Person[];
}

interface FormUnit {
  unit_number: string;
  rent_amount: number;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  status: 'Available' | 'Occupied' | 'Maintenance' | 'Reserved';
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
  property_manager_id: string;
  property_status: 'active' | 'inactive' | 'maintenance';
  organization_id: string;
  
  // Units array
  units: FormUnit[];
}

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
    property_manager_id: '',
    property_status: 'active',
    organization_id: '',
    units: []
  });

  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormData({
        name: initialData.name,
        address: initialData.address,
        city: initialData.city,
        state: initialData.state,
        zip_code: initialData.zip_code,
        total_units: initialData.total_units,
        owner_id: initialData.owner_id,
        property_manager_id: initialData.property_manager_id || '',
        property_status: initialData.property_status || 'active',
        organization_id: initialData.organization_id,
        units: initialData.units || []
      });
    }
  }, [initialData, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const propertyData = {
      name: formData.name,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zip_code: formData.zip_code,
      total_units: formData.total_units,
      owner_id: formData.owner_id,
      property_manager_id: formData.property_manager_id,
      property_status: formData.property_status,
      organization_id: formData.organization_id,
    };
    
    onSubmit({
      property: propertyData,
      units: formData.units
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addUnit = () => {
    setFormData(prev => ({
      ...prev,
      units: [
        ...prev.units,
        {
          unit_number: '',
          rent_amount: 0,
          bedrooms: 1,
          bathrooms: 1,
          square_feet: 0,
          status: 'Available',
          floor_plan: '',
          smart_lock_enabled: false
        },
      ],
    }));
  };

  const updateUnit = (index: number, updatedUnit: Partial<FormUnit>) => {
    setFormData(prev => ({
      ...prev,
      units: prev.units.map((unit, i) => 
        i === index ? { ...unit, ...updatedUnit } : unit
      ),
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

            <div>
              <label className="block text-sm font-medium text-[#2C3539] mb-2">
                Property Owner
              </label>
              <select
                name="owner_id"
                value={formData.owner_id}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent bg-white"
                required
              >
                <option value="">Select Owner</option>
                {propertyOwners.map(owner => (
                  <option key={owner.id} value={owner.id}>{owner.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2C3539] mb-2">
                Property Manager
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
          </div>
        </div>

        {/* Units Section */}
        <div className="bg-white rounded-lg p-6 w-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-[#2C3539]">Units</h2>
            <button
              type="button"
              onClick={addUnit}
              className="flex items-center px-4 py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3A4449] transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Unit
            </button>
          </div>

          {formData.units.map((unit, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-[#2C3539]">Unit {index + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeUnit(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2C3539] mb-2">
                    Unit Number
                  </label>
                  <input
                    type="text"
                    value={unit.unit_number}
                    onChange={(e) => updateUnit(index, { unit_number: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent bg-white"
                    placeholder="Enter unit number"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C3539] mb-2">
                    Rent Amount
                  </label>
                  <input
                    type="number"
                    value={unit.rent_amount}
                    onChange={(e) => updateUnit(index, { rent_amount: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent bg-white"
                    placeholder="Enter rent amount"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C3539] mb-2">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    value={unit.bedrooms}
                    onChange={(e) => updateUnit(index, { bedrooms: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent bg-white"
                    placeholder="Number of bedrooms"
                    required
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C3539] mb-2">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    value={unit.bathrooms}
                    onChange={(e) => updateUnit(index, { bathrooms: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent bg-white"
                    placeholder="Number of bathrooms"
                    required
                    min="0"
                    step="0.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C3539] mb-2">
                    Square Feet
                  </label>
                  <input
                    type="number"
                    value={unit.square_feet}
                    onChange={(e) => updateUnit(index, { square_feet: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent bg-white"
                    placeholder="Square footage"
                    required
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C3539] mb-2">
                    Status
                  </label>
                  <select
                    value={unit.status}
                    onChange={(e) => updateUnit(index, { status: e.target.value as FormUnit['status'] })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent bg-white"
                    required
                  >
                    <option value="Available">Available</option>
                    <option value="Occupied">Occupied</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C3539] mb-2">
                    Floor Plan
                  </label>
                  <input
                    type="text"
                    value={unit.floor_plan}
                    onChange={(e) => updateUnit(index, { floor_plan: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent bg-white"
                    placeholder="Floor plan name/type"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={unit.smart_lock_enabled}
                    onChange={(e) => updateUnit(index, { smart_lock_enabled: e.target.checked })}
                    className="h-4 w-4 text-[#2C3539] focus:ring-[#2C3539] border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-[#2C3539]">
                    Smart Lock Enabled
                  </label>
                </div>
              </div>
            </div>
          ))}
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

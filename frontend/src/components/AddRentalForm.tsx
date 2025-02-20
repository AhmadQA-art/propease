import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import PersonSelect from './PersonSelect';
import { NewRentalDetails, RentalDetails, Person, Unit, Property } from '../types/rental';

interface AddRentalFormProps {
  onSubmit: (rental: Omit<Property, 'id'>) => void;
  onCancel: () => void;
  initialData?: Property;
  mode?: 'add' | 'edit';
  propertyManagers: Person[];
  propertyOwners: Person[];
}

interface FormUnit {
  name: string;
  rentAmount: number;
  occupancyStatus: 'vacant' | 'occupied';
  resident?: {
    id: string;
    name: string;
    email: string;
  };
}

interface FormData {
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  total_units: number;
  owner_id: string;
  organization_id: string;
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
        organization_id: initialData.organization_id,
        units: initialData.units || []
      });
    }
  }, [initialData, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
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
        ...(prev.units || []),
        {
          name: '',
          rentAmount: 0,
          occupancyStatus: 'vacant' as const,
        },
      ],
    }));
  };

  const updateUnit = (index: number, updatedUnit: Partial<FormUnit>) => {
    setFormData(prev => ({
      ...prev,
      units: prev.units?.map((unit, i) => 
        i === index ? { ...unit, ...updatedUnit } : unit
      ) || [],
    }));
  };

  const removeUnit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      units: prev.units?.filter((_, i) => i !== index) || [],
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
        {/* General Info */}
        <div className="bg-white rounded-lg p-6 w-full">
          <h2 className="text-xl font-semibold text-[#2C3539] mb-6">General Information</h2>
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
                Total Units
              </label>
              <input
                type="number"
                name="total_units"
                value={formData.total_units}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent bg-white"
                placeholder="Enter number of units"
                required
                min="1"
              />
            </div>

            <div className="md:col-span-2">
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
                <option value="" className="text-gray-500">Select a property owner</option>
                {propertyOwners.map(owner => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name}
                  </option>
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
              className="flex items-center px-4 py-2 text-sm bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Unit
            </button>
          </div>

          <div className="space-y-4">
            {formData.units?.map((unit, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Unit Name */}
                  <div>
                    <label className="block text-sm font-medium text-[#2C3539] mb-2">
                      Unit Name/Number
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent"
                      value={unit.name}
                      onChange={(e) => updateUnit(index, { name: e.target.value })}
                      placeholder="e.g., Unit A1"
                      required
                    />
                  </div>

                  {/* Rent Amount */}
                  <div>
                    <label className="block text-sm font-medium text-[#2C3539] mb-2">
                      Rent Amount
                    </label>
                    <input
                      type="number"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent"
                      value={unit.rentAmount}
                      onChange={(e) => updateUnit(index, { rentAmount: parseFloat(e.target.value) })}
                      placeholder="Enter rent amount"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  {/* Occupancy Status */}
                  <div>
                    <label className="block text-sm font-medium text-[#2C3539] mb-2">
                      Occupancy Status
                    </label>
                    <select
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent"
                      value={unit.occupancyStatus}
                      onChange={(e) => updateUnit(index, { 
                        occupancyStatus: e.target.value as 'occupied' | 'vacant',
                        resident: e.target.value === 'vacant' ? undefined : unit.resident
                      })}
                      required
                    >
                      <option value="vacant">Vacant</option>
                      <option value="occupied">Occupied</option>
                    </select>
                  </div>

                  {/* Resident Information (if occupied) */}
                  {unit.occupancyStatus === 'occupied' && (
                    <div>
                      <label className="block text-sm font-medium text-[#2C3539] mb-2">
                        Resident Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent"
                        value={unit.resident?.name || ''}
                        onChange={(e) => updateUnit(index, { 
                          resident: { 
                            id: unit.resident?.id || '', 
                            name: e.target.value,
                            email: unit.resident?.email || ''
                          } 
                        })}
                        placeholder="Enter resident name"
                        required={unit.occupancyStatus === 'occupied'}
                      />
                    </div>
                  )}

                  {/* Remove Unit Button */}
                  <div className="flex items-center justify-end md:col-span-2 lg:col-span-4">
                    <button
                      type="button"
                      onClick={() => removeUnit(index)}
                      className="flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Remove Unit
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {formData.units?.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No units added yet. Click "Add Unit" to add your first unit.
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 py-4">
          <button
            type="button"
            onClick={handleBack}
            className="px-6 py-2 border border-gray-200 rounded-lg text-[#2C3539] hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors"
          >
            {mode === 'add' ? 'Add Property' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import PersonSelect from './PersonSelect';
import { NewRentalDetails, RentalDetails, Person, Unit } from '../types/rental';

interface AddRentalFormProps {
  onSubmit: (rental: Omit<RentalDetails, 'id' | 'status'>) => void;
  initialData?: RentalDetails;
  mode?: 'add' | 'edit';
  propertyManagers: Person[];
  propertyOwners: Person[];
}

export default function AddRentalForm({ 
  onSubmit, 
  initialData, 
  mode = 'add',
  propertyManagers,
  propertyOwners 
}: AddRentalFormProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<Omit<RentalDetails, 'id' | 'status'>>>({
    propertyName: '',
    type: 'residential',
    owner: null,
    manager: null,
    units: [],
  });

  // Initialize form with existing data if in edit mode
  useEffect(() => {
    if (initialData && mode === 'edit') {
      const selectedManager = propertyManagers.find(m => m.id === initialData.manager?.id);
      const selectedOwner = propertyOwners.find(o => o.id === initialData.owner?.id);

      setFormData({
        propertyName: initialData.propertyName,
        type: initialData.type,
        owner: selectedOwner || null,
        manager: selectedManager || null,
        units: initialData.units || [],
      });
    }
  }, [initialData, mode, propertyManagers, propertyOwners]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData as Omit<RentalDetails, 'id' | 'status'>);
    navigate('/rentals');
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

  const updateUnit = (index: number, updatedUnit: Partial<Unit>) => {
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/rentals')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#2C3539]" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#2C3539]">{mode === 'add' ? 'Add New Rental' : 'Edit Rental'}</h1>
          <p className="text-[#6B7280] mt-1">{mode === 'add' ? 'Create a new rental property' : 'Update rental property information'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* General Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-[#2C3539] mb-4">General Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Property Name */}
            <div>
              <label className="block text-sm font-medium text-[#2C3539] mb-2">
                Property Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent"
                value={formData.propertyName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, propertyName: e.target.value }))}
                placeholder="Enter property name"
                required
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-[#2C3539] mb-2">
                Type
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'residential' | 'commercial' }))}
                required
              >
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>

            {/* Property Manager */}
            <PersonSelect
              persons={propertyManagers}
              value={formData.manager}
              onChange={(value) => setFormData(prev => ({ ...prev, manager: value }))}
              placeholder="Search for property manager..."
              label="Property Manager"
            />

            {/* Property Owner */}
            <PersonSelect
              persons={propertyOwners}
              value={formData.owner}
              onChange={(value) => setFormData(prev => ({ ...prev, owner: value }))}
              placeholder="Search for property owner..."
              label="Property Owner"
            />
          </div>
        </div>

        {/* Units Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-[#2C3539]">Units</h2>
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
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/rentals')}
            className="px-4 py-2 text-[#2C3539] bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors"
          >
            {mode === 'add' ? 'Create Rental' : 'Update Rental'}
          </button>
        </div>
      </form>
    </div>
  );
}

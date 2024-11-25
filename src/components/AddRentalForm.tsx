import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload } from 'lucide-react';
import { NewRentalDetails, Property, RentalDetails } from '../types/rental';

interface AddRentalFormProps {
  properties: Property[];
  onSubmit: (rental: NewRentalDetails) => void;
  initialData?: RentalDetails;
  mode?: 'add' | 'edit';
}

export default function AddRentalForm({ properties, onSubmit, initialData, mode = 'add' }: AddRentalFormProps) {
  const navigate = useNavigate();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [formData, setFormData] = useState<Partial<NewRentalDetails>>({
    type: 'residential',
    paymentFrequency: 'monthly',
  });

  // Initialize form with existing data if in edit mode
  useEffect(() => {
    if (initialData && mode === 'edit') {
      const property = properties.find(p => p.id === initialData.propertyId);
      setSelectedProperty(property || null);
      setFormData({
        propertyId: initialData.propertyId,
        propertyName: initialData.propertyName,
        unit: initialData.unit,
        type: initialData.type,
        startDate: initialData.startDate,
        endDate: initialData.endDate,
        rentAmount: initialData.rentAmount,
        paymentFrequency: initialData.paymentFrequency,
        resident: {
          name: initialData.resident.name,
          imageUrl: initialData.resident.imageUrl || ''
        },
        owner: initialData.owner,
        manager: initialData.manager,
      });
    }
  }, [initialData, properties, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((mode === 'edit' && formData.propertyId) || (mode === 'add' && selectedProperty && formData.unit)) {
      onSubmit({
        ...formData as NewRentalDetails,
        propertyId: mode === 'edit' ? formData.propertyId! : selectedProperty!.id,
        propertyName: mode === 'edit' ? formData.propertyName! : selectedProperty!.name,
      });
      navigate('/rentals');
    }
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
          <p className="text-[#6B7280] mt-1">{mode === 'add' ? 'Create a new rental agreement' : 'Update rental information'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* General Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-[#2C3539] mb-4">General Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Property Selection */}
            <div>
              <label className="block text-sm font-medium text-[#2C3539] mb-2">
                Property
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent"
                value={selectedProperty?.id || ''}
                onChange={(e) => {
                  const property = properties.find(p => p.id === e.target.value);
                  setSelectedProperty(property || null);
                  setFormData(prev => ({ ...prev, unit: '' }));
                }}
                required
                disabled={mode === 'edit'}
              >
                <option value="">Select a property</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Unit Selection */}
            <div>
              <label className="block text-sm font-medium text-[#2C3539] mb-2">
                Unit
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent"
                value={formData.unit || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                required
                disabled={!selectedProperty || mode === 'edit'}
              >
                <option value="">Select a unit</option>
                {selectedProperty?.units
                  .filter(unit => unit.isAvailable || (mode === 'edit' && unit.number === formData.unit))
                  .map((unit) => (
                    <option key={unit.id} value={unit.number}>
                      Unit {unit.number}
                    </option>
                  ))}
              </select>
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

            {/* Payment Frequency */}
            <div>
              <label className="block text-sm font-medium text-[#2C3539] mb-2">
                Payment Frequency
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent"
                value={formData.paymentFrequency}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentFrequency: e.target.value as 'monthly' | 'quarterly' | 'annually' }))}
                required
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-[#2C3539] mb-2">
                Start Date
              </label>
              <input
                type="date"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent"
                value={formData.startDate || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                required
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-[#2C3539] mb-2">
                End Date
              </label>
              <input
                type="date"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent"
                value={formData.endDate || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
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
                value={formData.rentAmount || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, rentAmount: parseFloat(e.target.value) }))}
                required
                min="0"
                step="0.01"
              />
            </div>

            {/* Resident Name */}
            <div>
              <label className="block text-sm font-medium text-[#2C3539] mb-2">
                Resident Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent"
                value={formData.resident?.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, resident: { ...prev.resident, name: e.target.value, imageUrl: prev.resident?.imageUrl || '' } }))}
                required
              />
            </div>

            {/* Owner */}
            <div>
              <label className="block text-sm font-medium text-[#2C3539] mb-2">
                Owner
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent"
                value={formData.owner || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, owner: e.target.value }))}
                required
              />
            </div>

            {/* Manager */}
            <div>
              <label className="block text-sm font-medium text-[#2C3539] mb-2">
                Manager
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent"
                value={formData.manager || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, manager: e.target.value }))}
                required
              />
            </div>
          </div>
        </div>

        {/* Rental Agreement */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-[#2C3539] mb-4">Rental Agreement</h2>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PDF (MAX. 10MB)</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".pdf"
              />
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/rentals')}
            className="px-6 py-2 text-[#2C3539] bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 text-white bg-[#2C3539] rounded-lg hover:bg-[#3d474c] transition-colors"
          >
            {mode === 'add' ? 'Create Rental' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

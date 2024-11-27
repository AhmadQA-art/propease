import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PersonSelect from './PersonSelect';
import { NewRentalDetails, RentalDetails, Person } from '../types/rental';

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
    propertyId: '',
    propertyName: '',
    type: 'residential',
    unit: '',
    startDate: '',
    endDate: '',
    rentAmount: 0,
    paymentFrequency: 'monthly',
    resident: { id: '', name: '', email: '' },
    owner: null,
    manager: null,
    agreementFile: null
  });

  // Initialize form with existing data if in edit mode
  useEffect(() => {
    if (initialData && mode === 'edit') {
      const selectedManager = propertyManagers.find(m => m.id === initialData.manager?.id);
      const selectedOwner = propertyOwners.find(o => o.id === initialData.owner?.id);

      setFormData({
        propertyId: initialData.propertyId,
        propertyName: initialData.propertyName,
        type: initialData.type,
        unit: initialData.unit,
        startDate: initialData.startDate,
        endDate: initialData.endDate,
        rentAmount: initialData.rentAmount,
        paymentFrequency: initialData.paymentFrequency,
        resident: initialData.resident,
        owner: selectedOwner || null,
        manager: selectedManager || null,
        agreementFile: initialData.agreementFile
      });
    }
  }, [initialData, mode, propertyManagers, propertyOwners]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData as Omit<RentalDetails, 'id' | 'status'>);
    navigate('/rentals');
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
            {/* Property ID */}
            <div>
              <label className="block text-sm font-medium text-[#2C3539] mb-2">
                Property ID
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent"
                value={formData.propertyId || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, propertyId: e.target.value }))}
                placeholder="Enter property ID"
                required
              />
            </div>

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

            {/* Unit */}
            <div>
              <label className="block text-sm font-medium text-[#2C3539] mb-2">
                Unit
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent"
                value={formData.unit || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                placeholder="Enter unit number/name"
                required
              />
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
                placeholder="Enter rent amount"
                required
                min="0"
                step="0.01"
              />
            </div>

            {/* Payment Frequency */}
            <div>
              <label className="block text-sm font-medium text-[#2C3539] mb-2">
                Payment Frequency
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent"
                value={formData.paymentFrequency}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentFrequency: e.target.value as 'monthly' | 'weekly' | 'yearly' }))}
                required
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            {/* Resident Information */}
            <div className="md:col-span-2">
              <h3 className="text-md font-medium text-[#2C3539] mb-4">Resident Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#2C3539] mb-2">
                    Resident Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent"
                    value={formData.resident?.name || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      resident: { 
                        ...prev.resident!, 
                        name: e.target.value 
                      } 
                    }))}
                    placeholder="Enter resident name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2C3539] mb-2">
                    Resident Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent"
                    value={formData.resident?.email || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      resident: { 
                        ...prev.resident!, 
                        email: e.target.value 
                      } 
                    }))}
                    placeholder="Enter resident email"
                    required
                  />
                </div>
              </div>
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

            {/* Agreement File */}
            <div>
              <label className="block text-sm font-medium text-[#2C3539] mb-2">
                Agreement File
              </label>
              <input
                type="file"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setFormData(prev => ({ ...prev, agreementFile: file }));
                  }
                }}
                accept=".pdf,.doc,.docx"
              />
            </div>
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

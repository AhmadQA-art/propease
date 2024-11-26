import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Plus } from 'lucide-react';
import { Property } from '../types/rental';

interface AddLeaseFormProps {
  properties: Property[];
  onSubmit: (leaseData: any, rentalData: any) => void;
}

export default function AddLeaseForm({ properties, onSubmit }: AddLeaseFormProps) {
  const navigate = useNavigate();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [formData, setFormData] = useState({
    // Lease specific data
    status: 'pending',
    rentAmount: '',
    securityDeposit: '',
    insuranceRequired: false,
    insuranceAmount: '',
    fixedTerm: true,
    // Rental specific data
    propertyId: '',
    unit: '',
    type: 'residential',
    startDate: '',
    endDate: '',
    paymentFrequency: 'monthly',
    resident: {
      name: '',
      imageUrl: ''
    },
    owner: '',
    manager: ''
  });
  const [showRentalForm, setShowRentalForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const leaseData = {
      status: formData.status,
      rentAmount: parseFloat(formData.rentAmount),
      securityDeposit: parseFloat(formData.securityDeposit),
      insuranceRequired: formData.insuranceRequired,
      insuranceAmount: parseFloat(formData.insuranceAmount || '0'),
      fixedTerm: formData.fixedTerm,
      startDate: formData.startDate,
      endDate: formData.endDate,
      propertyName: selectedProperty?.name,
      unit: formData.unit,
      resident: {
        name: formData.resident.name,
        imageUrl: null
      }
    };

    const rentalData = {
      propertyId: selectedProperty?.id,
      propertyName: selectedProperty?.name,
      unit: formData.unit,
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate,
      rentAmount: parseFloat(formData.rentAmount),
      paymentFrequency: formData.paymentFrequency,
      resident: formData.resident,
      owner: formData.owner,
      manager: formData.manager
    };

    onSubmit(leaseData, rentalData);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/leases')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#2C3539]" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#2C3539]">Add New Lease</h1>
          <p className="text-[#6B7280] mt-1">Create a new lease agreement</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Property Selection Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-[#2C3539] mb-4">Property Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#2C3539] mb-2">
                Property
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                value={selectedProperty?.id || ''}
                onChange={(e) => {
                  const property = properties.find(p => p.id === e.target.value);
                  setSelectedProperty(property || null);
                  setFormData(prev => ({ ...prev, propertyId: e.target.value }));
                }}
                required
              >
                <option value="">Select a property</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2C3539] mb-2">
                Unit
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                value={formData.unit}
                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                required
                disabled={!selectedProperty}
              >
                <option value="">Select a unit</option>
                {selectedProperty?.units
                  .filter(unit => unit.isAvailable)
                  .map((unit) => (
                    <option key={unit.id} value={unit.number}>
                      Unit {unit.number}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {!showRentalForm && (
          <div className="flex justify-end mb-6">
            <button
              type="button"
              onClick={() => setShowRentalForm(true)}
              className="flex items-center px-4 py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Rental Details
            </button>
          </div>
        )}

        {showRentalForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-lg font-semibold text-[#2C3539] mb-4">Rental Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#2C3539] mb-2">
                  Type
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'residential' | 'commercial' }))}
                  required
                >
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2C3539] mb-2">
                  Payment Frequency
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                  value={formData.paymentFrequency}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentFrequency: e.target.value as 'monthly' | 'quarterly' | 'annually' }))}
                  required
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annually">Annually</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Lease Details Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-[#2C3539] mb-4">Lease Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#2C3539] mb-2">
                Status
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                required
              >
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="past">Past</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2C3539] mb-2">
                Rent Amount
              </label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                value={formData.rentAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, rentAmount: e.target.value }))}
                required
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2C3539] mb-2">
                Security Deposit
              </label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                value={formData.securityDeposit}
                onChange={(e) => setFormData(prev => ({ ...prev, securityDeposit: e.target.value }))}
                required
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2C3539] mb-2">
                Insurance Required
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-[#2C3539] focus:ring-[#2C3539]"
                  checked={formData.insuranceRequired}
                  onChange={(e) => setFormData(prev => ({ ...prev, insuranceRequired: e.target.checked }))}
                />
                {formData.insuranceRequired && (
                  <input
                    type="number"
                    placeholder="Insurance amount"
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                    value={formData.insuranceAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, insuranceAmount: e.target.value }))}
                    min="0"
                    step="0.01"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Term Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-[#2C3539] mb-4">Term Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#2C3539] mb-2">
                Term Type
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                value={formData.fixedTerm.toString()}
                onChange={(e) => setFormData(prev => ({ ...prev, fixedTerm: e.target.value === 'true' }))}
              >
                <option value="true">Fixed Term</option>
                <option value="false">Month-to-Month</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2C3539] mb-2">
                Start Date
              </label>
              <input
                type="date"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                required
              />
            </div>

            {formData.fixedTerm && (
              <div>
                <label className="block text-sm font-medium text-[#2C3539] mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  required
                />
              </div>
            )}
          </div>
        </div>

        {/* Stakeholder Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-[#2C3539] mb-4">Stakeholder Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#2C3539] mb-2">
                Resident Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                value={formData.resident.name}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  resident: { ...prev.resident, name: e.target.value }
                }))}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2C3539] mb-2">
                Owner Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                value={formData.owner}
                onChange={(e) => setFormData(prev => ({ ...prev, owner: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2C3539] mb-2">
                Property Manager
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                value={formData.manager}
                onChange={(e) => setFormData(prev => ({ ...prev, manager: e.target.value }))}
                required
              />
            </div>
          </div>
        </div>

        {/* Document Upload */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-[#2C3539] mb-4">Lease Agreement</h2>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PDF (MAX. 10MB)</p>
              </div>
              <input type="file" className="hidden" accept=".pdf" />
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/leases')}
            className="px-6 py-2 text-[#2C3539] bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 text-white bg-[#2C3539] rounded-lg hover:bg-[#3d474c] transition-colors"
          >
            Create Lease
          </button>
        </div>
      </form>
    </div>
  );
} 
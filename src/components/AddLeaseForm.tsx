import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Plus, X, User } from 'lucide-react';
import { Property } from '../types/rental';
import { Tenant, LeaseCharge, LateFee } from '../types/tenant';
import AddTenantDialog from './AddTenantDialog';
import clsx from 'clsx';

interface AddLeaseFormProps {
  properties: Property[];
  onSubmit: (leaseData: any, rentalData: any) => void;
}

// Mock tenants data
const mockTenants: Tenant[] = [
  {
    id: 'T1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '(555) 123-4567'
  },
  {
    id: 'T2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '(555) 234-5678'
  }
];

export default function AddLeaseForm({ properties, onSubmit }: AddLeaseFormProps) {
  const navigate = useNavigate();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isAddTenantOpen, setIsAddTenantOpen] = useState(false);
  const [selectedTenants, setSelectedTenants] = useState<Tenant[]>([]);
  const [charges, setCharges] = useState<LeaseCharge[]>([]);
  const [formData, setFormData] = useState({
    propertyId: '',
    unit: '',
    leaseType: 'fixed' as 'fixed' | 'monthly',
    startDate: '',
    endDate: '',
    firstRentDate: '',
    rentFrequency: 'monthly' as 'monthly' | 'quarterly' | 'annually',
    hasDeposit: false,
    depositAmount: '',
    hasLateFees: false,
    lateFee: {
      amount: '',
      daysAfterDue: '',
      frequency: 'once' as 'once' | 'daily' | 'weekly'
    },
    isDocumentSigned: false,
    documentUrl: '',
    documentType: ''
  });

  const handleAddCharge = () => {
    setCharges([
      ...charges,
      {
        id: `C${Date.now()}`,
        amount: 0,
        type: 'rent',
        description: ''
      }
    ]);
  };

  const handleRemoveCharge = (id: string) => {
    setCharges(charges.filter(charge => charge.id !== id));
  };

  const handleChargeChange = (id: string, field: keyof LeaseCharge, value: any) => {
    setCharges(charges.map(charge =>
      charge.id === id ? { ...charge, [field]: value } : charge
    ));
  };

  const handleAddTenant = (tenant: Tenant) => {
    if (!selectedTenants.find(t => t.id === tenant.id)) {
      setSelectedTenants([...selectedTenants, tenant]);
    }
    setIsAddTenantOpen(false);
  };

  const handleRemoveTenant = (tenantId: string) => {
    setSelectedTenants(selectedTenants.filter(t => t.id !== tenantId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement form submission logic
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
        {/* Property Selection */}
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
                  setFormData(prev => ({ ...prev, propertyId: e.target.value, unit: '' }));
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

        {/* Lease Term */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-[#2C3539] mb-4">Lease Term</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <button
                type="button"
                className={clsx(
                  'flex-1 py-2 px-4 rounded-lg font-medium',
                  formData.leaseType === 'fixed'
                    ? 'bg-[#2C3539] text-white'
                    : 'bg-gray-100 text-[#2C3539]'
                )}
                onClick={() => setFormData(prev => ({ ...prev, leaseType: 'fixed' }))}
              >
                Fixed Term
              </button>
              <button
                type="button"
                className={clsx(
                  'flex-1 py-2 px-4 rounded-lg font-medium',
                  formData.leaseType === 'monthly'
                    ? 'bg-[#2C3539] text-white'
                    : 'bg-gray-100 text-[#2C3539]'
                )}
                onClick={() => setFormData(prev => ({ ...prev, leaseType: 'monthly' }))}
              >
                Month-to-Month
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              {formData.leaseType === 'fixed' && (
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
        </div>

        {/* Tenants */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-[#2C3539]">Tenants</h2>
            <button
              type="button"
              onClick={() => setIsAddTenantOpen(true)}
              className="flex items-center px-4 py-2 text-sm bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Tenant
            </button>
          </div>

          <div className="space-y-3">
            {selectedTenants.map((tenant) => (
              <div
                key={tenant.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-[#2C3539]">{tenant.name}</p>
                    <p className="text-xs text-gray-500">{tenant.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveTenant(tenant.id)}
                  className="p-1 text-gray-400 hover:text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Rent Charges */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-[#2C3539]">Rent Charges</h2>
            <button
              type="button"
              onClick={handleAddCharge}
              className="flex items-center px-4 py-2 text-sm bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Charge
            </button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#2C3539] mb-2">
                  First Rent Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                  value={formData.firstRentDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstRentDate: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2C3539] mb-2">
                  Rent Frequency
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                  value={formData.rentFrequency}
                  onChange={(e) => setFormData(prev => ({ ...prev, rentFrequency: e.target.value as any }))}
                  required
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annually">Annually</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {charges.map((charge) => (
                <div key={charge.id} className="flex gap-4 items-start">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="number"
                      placeholder="Amount"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                      value={charge.amount || ''}
                      onChange={(e) => handleChargeChange(charge.id, 'amount', parseFloat(e.target.value))}
                      required
                    />
                    <select
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                      value={charge.type}
                      onChange={(e) => handleChargeChange(charge.id, 'type', e.target.value)}
                      required
                    >
                      <option value="rent">Rent</option>
                      <option value="utility">Utility</option>
                      <option value="parking">Parking</option>
                      <option value="other">Other</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Description"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                      value={charge.description}
                      onChange={(e) => handleChargeChange(charge.id, 'description', e.target.value)}
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCharge(charge.id)}
                    className="p-2 text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Security Deposit */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-[#2C3539] mb-4">Security Deposit</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-[#2C3539]">Is there a security deposit?</span>
              <div className="flex gap-4">
                <button
                  type="button"
                  className={clsx(
                    'px-4 py-2 rounded-lg text-sm font-medium',
                    formData.hasDeposit
                      ? 'bg-[#2C3539] text-white'
                      : 'bg-gray-100 text-[#2C3539]'
                  )}
                  onClick={() => setFormData(prev => ({ ...prev, hasDeposit: true }))}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className={clsx(
                    'px-4 py-2 rounded-lg text-sm font-medium',
                    !formData.hasDeposit
                      ? 'bg-[#2C3539] text-white'
                      : 'bg-gray-100 text-[#2C3539]'
                  )}
                  onClick={() => setFormData(prev => ({ ...prev, hasDeposit: false, depositAmount: '' }))}
                >
                  No
                </button>
              </div>
            </div>

            {formData.hasDeposit && (
              <div>
                <label className="block text-sm font-medium text-[#2C3539] mb-2">
                  Deposit Amount
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                  value={formData.depositAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, depositAmount: e.target.value }))}
                  required={formData.hasDeposit}
                />
              </div>
            )}
          </div>
        </div>

        {/* Late Fees */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-[#2C3539] mb-4">Late Fees</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-[#2C3539]">Apply late fees?</span>
              <div className="flex gap-4">
                <button
                  type="button"
                  className={clsx(
                    'px-4 py-2 rounded-lg text-sm font-medium',
                    formData.hasLateFees
                      ? 'bg-[#2C3539] text-white'
                      : 'bg-gray-100 text-[#2C3539]'
                  )}
                  onClick={() => setFormData(prev => ({ ...prev, hasLateFees: true }))}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className={clsx(
                    'px-4 py-2 rounded-lg text-sm font-medium',
                    !formData.hasLateFees
                      ? 'bg-[#2C3539] text-white'
                      : 'bg-gray-100 text-[#2C3539]'
                  )}
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    hasLateFees: false,
                    lateFee: { amount: '', daysAfterDue: '', frequency: 'once' }
                  }))}
                >
                  No
                </button>
              </div>
            </div>

            {formData.hasLateFees && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#2C3539] mb-2">
                    Late Fee Amount
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                    value={formData.lateFee.amount}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      lateFee: { ...prev.lateFee, amount: e.target.value }
                    }))}
                    required={formData.hasLateFees}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C3539] mb-2">
                    Days After Due Date
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                    value={formData.lateFee.daysAfterDue}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      lateFee: { ...prev.lateFee, daysAfterDue: e.target.value }
                    }))}
                    required={formData.hasLateFees}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2C3539] mb-2">
                     Frequency
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                    value={formData.lateFee.frequency}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      lateFee: { ...prev.lateFee, frequency: e.target.value as 'once' | 'daily' | 'weekly' }
                    }))}
                    required={formData.hasLateFees}
                  >
                    <option value="once">Once</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Document Upload and Signature */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-[#2C3539] mb-4">Lease Document</h2>
          
          {/* Document Type Selection */}
          <div className="mb-6">
            <span className="text-sm text-[#2C3539] mb-3 block">Select Document Type:</span>
            <div className="flex gap-4">
              <button
                type="button"
                className={clsx(
                  'flex-1 py-2 px-4 rounded-lg font-medium',
                  formData.documentType === 'signed'
                    ? 'bg-[#2C3539] text-white'
                    : 'bg-gray-100 text-[#2C3539]'
                )}
                onClick={() => setFormData(prev => ({ 
                  ...prev, 
                  documentType: 'signed',
                  isDocumentSigned: false,
                  documentUrl: ''
                }))}
              >
                Already Signed Document
              </button>
              <button
                type="button"
                className={clsx(
                  'flex-1 py-2 px-4 rounded-lg font-medium',
                  formData.documentType === 'esign'
                    ? 'bg-[#2C3539] text-white'
                    : 'bg-gray-100 text-[#2C3539]'
                )}
                onClick={() => setFormData(prev => ({ 
                  ...prev, 
                  documentType: 'esign',
                  isDocumentSigned: false,
                  documentUrl: ''
                }))}
              >
                E-Sign
              </button>
            </div>
          </div>

          {/* Document Actions */}
          <div className="flex justify-center">
            {formData.documentType === 'signed' && (
              <button
                type="button"
                className="flex items-center px-6 py-3 text-sm bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.pdf,.doc,.docx';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      setFormData(prev => ({
                        ...prev,
                        documentUrl: URL.createObjectURL(file),
                        isDocumentSigned: true
                      }));
                    }
                  };
                  input.click();
                }}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Signed Document
              </button>
            )}
            
            {formData.documentType === 'esign' && (
              <button
                type="button"
                className="flex items-center px-6 py-3 text-sm bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors"
                onClick={() => setFormData(prev => ({ ...prev, isDocumentSigned: true }))}
              >
                Send for Signature
              </button>
            )}
          </div>

          {/* Success Messages */}
          {formData.documentUrl && formData.documentType === 'signed' && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-[#2C3539]">Signed document uploaded successfully</p>
            </div>
          )}
          {formData.isDocumentSigned && formData.documentType === 'esign' && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-[#2C3539]">Document sent for signature</p>
            </div>
          )}
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

      <AddTenantDialog
        isOpen={isAddTenantOpen}
        onClose={() => setIsAddTenantOpen(false)}
        onAddTenant={handleAddTenant}
        existingTenants={mockTenants}
        onSelectExisting={handleAddTenant}
      />
    </div>
  );
}
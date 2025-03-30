import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Plus, X, User, Calendar, DollarSign } from 'lucide-react';
import { Property } from '../types/rental';
import { Tenant, LeaseCharge, LateFee } from '../types/tenant';
import AddTenantDialog from './AddTenantDialog';
import clsx from 'clsx';
import { supabase } from '../config/supabase';

interface LeaseIssuer {
  id: string;
  name: string;
  email?: string;
  role?: string;
}

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
  const [issuers, setIssuers] = useState<LeaseIssuer[]>([]);
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
    documentStatus: 'not_signed' as 'signed' | 'pending' | 'not_signed',
    documentUrl: '',
    documentType: '',
    leaseStatus: 'Pending' as 'Active' | 'Pending' | 'Terminated' | 'Ended',
    leaseIssuerId: '',
    lastPaymentDate: '',
    nextPaymentDate: '',
    rentAmount: '',
  });

  // Fetch lease issuers (users who can issue leases)
  useEffect(() => {
    const fetchIssuers = async () => {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('id, first_name, last_name, email, role')
          .eq('active', true);
          
        if (error) {
          console.error('Error fetching lease issuers:', error);
          return;
        }
        
        if (data) {
          const formattedIssuers = data.map(user => ({
            id: user.id,
            name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
            email: user.email,
            role: user.role
          }));
          
          setIssuers(formattedIssuers);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    
    fetchIssuers();
  }, []);

  // Calculate payment dates when start date changes
  useEffect(() => {
    if (formData.startDate) {
      const startDate = new Date(formData.startDate);
      
      // Next payment date is 1 month after start date
      const nextPaymentDate = new Date(startDate);
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
      
      // Last payment date is the start date (assuming first payment is on start date)
      setFormData(prev => ({
        ...prev,
        lastPaymentDate: formData.startDate,
        nextPaymentDate: nextPaymentDate.toISOString().split('T')[0],
        firstRentDate: formData.startDate
      }));
    }
  }, [formData.startDate]);

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
    
    // Create lease data object that matches structure expected by LeaseDetailsDrawer
    const leaseData = {
      propertyName: selectedProperty?.name || '',
      unit: formData.unit,
      resident: {
        name: selectedTenants.length > 0 ? selectedTenants[0].name : '',
        imageUrl: null,
        email: selectedTenants.length > 0 ? selectedTenants[0].email : '',
      },
      startDate: formData.startDate,
      endDate: formData.endDate || formData.startDate, // For month-to-month, use start date
      rentAmount: parseFloat(formData.rentAmount),
      securityDeposit: formData.hasDeposit ? parseFloat(formData.depositAmount) : 0,
      status: formData.leaseType === 'fixed' ? 'active' : 'pending',
      lastPaymentDate: formData.lastPaymentDate,
      nextPaymentDate: formData.nextPaymentDate,
      documentStatus: formData.documentStatus,
      signedDate: formData.documentStatus === 'signed' ? new Date().toISOString() : null,
      leaseStatus: formData.leaseStatus,
      paymentFrequency: formData.rentFrequency,
      charges: charges,
      documents: formData.documentUrl 
        ? [{
            id: `doc-${Date.now()}`,
            document_url: formData.documentUrl,
            document_status: formData.documentStatus,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            document_name: 'Lease Agreement.pdf'
          }] 
        : [],
      leaseIssuer: {
        id: formData.leaseIssuerId,
        name: issuers.find(i => i.id === formData.leaseIssuerId)?.name || '',
        email: issuers.find(i => i.id === formData.leaseIssuerId)?.email,
        role: issuers.find(i => i.id === formData.leaseIssuerId)?.role,
      }
    };
    
    // Create database-compatible lease data
    const databaseLeaseData = {
      unit_id: formData.unit,
      tenant_id: selectedTenants.length > 0 ? selectedTenants[0].id : null,
      start_date: formData.startDate,
      end_date: formData.endDate || null,
      rent_amount: formData.rentAmount,
      security_deposit: formData.hasDeposit ? formData.depositAmount : null,
      status: formData.leaseStatus,
      last_payment_date: formData.lastPaymentDate,
      next_payment_date: formData.nextPaymentDate,
      payment_frequency: formData.rentFrequency,
      lease_issuer_id: formData.leaseIssuerId,
      document_status: formData.documentStatus,
      signed_date: formData.documentStatus === 'signed' ? new Date().toISOString() : null,
    };
    
    onSubmit(leaseData, databaseLeaseData);
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

        {/* Lease Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-[#2C3539] mb-4">Lease Status</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#2C3539] mb-2">
                Initial Status
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                value={formData.leaseStatus}
                onChange={(e) => setFormData(prev => ({ ...prev, leaseStatus: e.target.value as 'Active' | 'Pending' | 'Terminated' | 'Ended' }))}
                required
              >
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Terminated">Terminated</option>
                <option value="Ended">Ended</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lease Issuer */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-[#2C3539] mb-4">Lease Issuer</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#2C3539] mb-2">
                Lease Issuer
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                value={formData.leaseIssuerId}
                onChange={(e) => setFormData(prev => ({ ...prev, leaseIssuerId: e.target.value }))}
                required
              >
                <option value="">Select a lease issuer</option>
                {issuers.map((issuer) => (
                  <option key={issuer.id} value={issuer.id}>
                    {issuer.name} {issuer.role ? `(${issuer.role})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Rent Charges */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-[#2C3539]">Payment Details</h2>
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
                  Rent Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    <DollarSign className="w-4 h-4" />
                  </span>
                  <input
                    type="number"
                    className="w-full pl-10 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                    value={formData.rentAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, rentAmount: e.target.value }))}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2C3539] mb-2">
                  Payment Cycle
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#2C3539] mb-2">
                  Last Payment Date
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    <Calendar className="w-4 h-4" />
                  </span>
                  <input
                    type="date"
                    className="w-full pl-10 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                    value={formData.lastPaymentDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastPaymentDate: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2C3539] mb-2">
                  Next Payment Date
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    <Calendar className="w-4 h-4" />
                  </span>
                  <input
                    type="date"
                    className="w-full pl-10 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                    value={formData.nextPaymentDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, nextPaymentDate: e.target.value }))}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {charges.map((charge) => (
                <div key={charge.id} className="flex gap-4 items-start">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        <DollarSign className="w-4 h-4" />
                      </span>
                      <input
                        type="number"
                        placeholder="Amount"
                        className="w-full pl-10 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                        value={charge.amount || ''}
                        onChange={(e) => handleChargeChange(charge.id, 'amount', parseFloat(e.target.value))}
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <select
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                      value={charge.type}
                      onChange={(e) => handleChargeChange(charge.id, 'type', e.target.value)}
                      required
                    >
                      <option value="rent">Rent</option>
                      <option value="utility">Utility</option>
                      <option value="parking">Parking</option>
                      <option value="maintenance">Maintenance</option>
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
          <h2 className="text-lg font-semibold text-[#2C3539] mb-4">Lease Documents</h2>
          
          {/* Document Type Selection */}
          <div className="mb-6">
            <span className="text-sm text-[#2C3539] mb-3 block">Document Status:</span>
            <div className="flex gap-4">
              <button
                type="button"
                className={clsx(
                  'flex-1 py-2 px-4 rounded-lg font-medium',
                  formData.documentStatus === 'signed'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-[#2C3539]'
                )}
                onClick={() => setFormData(prev => ({ 
                  ...prev, 
                  documentStatus: 'signed',
                  documentType: 'signed',
                }))}
              >
                Signed
              </button>
              <button
                type="button"
                className={clsx(
                  'flex-1 py-2 px-4 rounded-lg font-medium',
                  formData.documentStatus === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-[#2C3539]'
                )}
                onClick={() => setFormData(prev => ({ 
                  ...prev, 
                  documentStatus: 'pending',
                  documentType: 'esign',
                }))}
              >
                Pending Signature
              </button>
              <button
                type="button"
                className={clsx(
                  'flex-1 py-2 px-4 rounded-lg font-medium',
                  formData.documentStatus === 'not_signed'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-gray-100 text-[#2C3539]'
                )}
                onClick={() => setFormData(prev => ({ 
                  ...prev, 
                  documentStatus: 'not_signed',
                  documentType: '',
                }))}
              >
                No Document
              </button>
            </div>
          </div>

          {/* Document Actions */}
          <div className="flex justify-center">
            {formData.documentStatus !== 'not_signed' && (
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
                      }));
                    }
                  };
                  input.click();
                }}
              >
                <Upload className="w-4 h-4 mr-2" />
                {formData.documentStatus === 'signed' ? 'Upload Signed Document' : 'Upload Document for Signature'}
              </button>
            )}
          </div>

          {/* Success Messages */}
          {formData.documentUrl && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-[#2C3539]">
                {formData.documentStatus === 'signed' 
                  ? 'Signed document uploaded successfully' 
                  : 'Document uploaded and ready for signature'}
              </p>
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
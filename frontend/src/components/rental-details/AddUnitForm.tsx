import React, { useState } from 'react';
import { X, Search, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Mock resident data - replace with actual data
const mockResidents = [
  { id: '1', name: 'John Smith', email: 'john@example.com' },
  { id: '2', name: 'Jane Doe', email: 'jane@example.com' },
  { id: '3', name: 'Alice Johnson', email: 'alice@example.com' },
  { id: '4', name: 'Bob Wilson', email: 'bob@example.com' },
];

// Floor plan options
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

interface Resident {
  id: string;
  name: string;
  email: string;
}

interface AddUnitFormProps {
  onClose: () => void;
  onSubmit: (unitData: {
    unitNumber: string;
    floorPlan: string;
    area: number; // Changed from square_feet
    bedrooms: number;
    bathrooms: number;
    status: string;
    rentAmount?: number;
    resident?: Resident;
    startDate?: string;
    endDate?: string;
  }) => void;
}

export default function AddUnitForm({ onClose, onSubmit }: AddUnitFormProps) {
  const [formData, setFormData] = useState({
    unitNumber: '',
    floorPlan: 'Studio',
    area: '', // Changed from square_feet
    bedrooms: '1',
    bathrooms: '1',
    status: 'vacant',
    rentAmount: '',
    startDate: '',
    endDate: '',
  });

  const [showResidentSearch, setShowResidentSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);

  const filteredResidents = mockResidents.filter(resident =>
    resident.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resident.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic form validation
    if (!formData.unitNumber.trim()) {
      toast.error('Unit number is required');
      return;
    }
    
    // Type conversions and validation for numeric fields
    let rentAmount: number | undefined = undefined;
    if (formData.rentAmount) {
      rentAmount = Number(formData.rentAmount);
      if (isNaN(rentAmount) || rentAmount < 0) {
        toast.error('Please enter a valid rent amount');
        return;
      }
    }
    
    // Area validation
    let area: number | undefined = undefined;
    if (formData.area) {
      area = Number(formData.area);
      if (isNaN(area) || area < 25) {
        toast.error('Area must be at least 25 square meters');
        return;
      }
    } else {
      toast.error('Area is required and must be at least 25 square meters');
      return;
    }
    
    // Bedrooms validation
    let bedrooms: number = Number(formData.bedrooms);
    if (isNaN(bedrooms) || bedrooms < 1) {
      toast.error('Unit must have at least 1 bedroom');
      return;
    }
    
    // Bathrooms validation
    let bathrooms: number = Number(formData.bathrooms);
    if (isNaN(bathrooms) || bathrooms < 1) {
      toast.error('Unit must have at least 1 bathroom');
      return;
    }
    
    // If we have a resident but no lease dates, warn the user
    if (selectedResident && (!formData.startDate || !formData.endDate)) {
      if (window.confirm('You selected a tenant but didn\'t specify lease dates. Continue anyway?')) {
        // Continue with submission
      } else {
        return; // User chose to go back and fix the dates
      }
    }
    
    // Prepare the data for submission
    onSubmit({
      unitNumber: formData.unitNumber,
      floorPlan: formData.floorPlan,
      area,
      bedrooms,
      bathrooms,
      status: formData.status,
      rentAmount,
      ...(selectedResident && {
        resident: selectedResident,
        startDate: formData.startDate,
        endDate: formData.endDate,
      })
    });
    
    // Close the form
    onClose();
  };

  const handleResidentSelect = (resident: Resident) => {
    setSelectedResident(resident);
    setShowResidentSearch(false);
    setSearchQuery('');
    // If resident is selected, update status to occupied
    setFormData(prev => ({ ...prev, status: 'occupied' }));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold text-[#2C3539]">Add New Unit</h2>
        <button
          type="button"
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="text-[#2C3539]"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
        <div className="text-sm text-gray-500 mb-2">Fields marked with * are required</div>
        
        {/* Unit Number */}
        <div className="space-y-2">
          <label className="text-sm text-[#6B7280]">Unit Number *</label>
          <input
            type="text"
            required
            value={formData.unitNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, unitNumber: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
            placeholder="Enter unit number"
          />
        </div>

        {/* Status */}
        <div className="space-y-2">
          <label className="text-sm text-[#6B7280]">Status *</label>
          <select
            required
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
          >
            <option value="vacant">Vacant</option>
            <option value="occupied">Occupied</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
        
        {/* Floor Plan - now a dropdown */}
        <div className="space-y-2">
          <label className="text-sm text-[#6B7280]">Floor Plan *</label>
          <select
            required
            value={formData.floorPlan}
            onChange={(e) => setFormData(prev => ({ ...prev, floorPlan: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
          >
            {FLOOR_PLAN_OPTIONS.map(plan => (
              <option key={plan} value={plan}>{plan}</option>
            ))}
          </select>
        </div>

        {/* Specifications */}
        <div className="grid grid-cols-3 gap-4">
          {/* Area (sq m) */}
          <div className="space-y-2">
            <label className="text-sm text-[#6B7280]">Area (m²) *</label>
            <input
              type="number"
              required
              value={formData.area}
              onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
              placeholder="Enter unit area in square meters"
              min="25"
            />
          </div>

          {/* Bedrooms */}
          <div className="space-y-2">
            <label className="text-sm text-[#6B7280]">Bedrooms *</label>
            <input
              type="number"
              required
              value={formData.bedrooms}
              onChange={(e) => setFormData(prev => ({ ...prev, bedrooms: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
              placeholder="Min 1"
              min="1"
            />
          </div>

          {/* Bathrooms */}
          <div className="space-y-2">
            <label className="text-sm text-[#6B7280]">Bathrooms *</label>
            <input
              type="number"
              required
              value={formData.bathrooms}
              onChange={(e) => setFormData(prev => ({ ...prev, bathrooms: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
              placeholder="Min 1"
              min="1"
              step="0.5"
            />
          </div>
        </div>

        {/* Monthly Rent */}
        <div className="space-y-2">
          <label className="text-sm text-[#6B7280]">Monthly Rent</label>
          <input
            type="number"
            value={formData.rentAmount}
            onChange={(e) => setFormData(prev => ({ ...prev, rentAmount: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
            placeholder="Enter monthly rent"
            min="0"
          />
        </div>

        {/* Lease Information Section (previously Resident Information) */}
        <div className="space-y-4 pt-2 border-t">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-medium text-[#2C3539]">Lease Information</h3>
            <span className="text-xs text-gray-500">(Optional)</span>
          </div>
          
          {!selectedResident ? (
            <button
              type="button"
              onClick={() => setShowResidentSearch(true)}
              className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors"
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="w-5 h-5 mr-2"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Lease
            </button>
          ) : (
            <div className="space-y-4">
              {/* Lease Dates - moved up for better flow */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-[#6B7280]">Lease Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-[#6B7280]">Lease End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                    min={formData.startDate}
                  />
                </div>
              </div>

              {/* Tenant Information */}
              <div className="space-y-2">
                <label className="text-sm text-[#6B7280]">Tenant</label>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-[#2C3539]">{selectedResident.name}</p>
                    <p className="text-sm text-gray-500">{selectedResident.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedResident(null)}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className="w-4 h-4 text-gray-500"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Resident Search Dropdown */}
          {showResidentSearch && (
            <div className="relative border rounded-lg shadow-lg">
              <div className="flex items-center p-2 border-b">
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="w-5 h-5 text-gray-400 mr-2"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 outline-none text-sm"
                  placeholder="Search tenants..."
                  autoFocus
                />
              </div>
              <div className="max-h-48 overflow-y-auto">
                {filteredResidents.map(resident => (
                  <button
                    key={resident.id}
                    type="button"
                    onClick={() => handleResidentSelect(resident)}
                    className="w-full p-2 text-left hover:bg-gray-50 transition-colors"
                  >
                    <p className="font-medium text-[#2C3539]">{resident.name}</p>
                    <p className="text-sm text-gray-500">{resident.email}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full px-4 py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors"
        >
          Add Unit
        </button>
      </form>
    </div>
  );
}

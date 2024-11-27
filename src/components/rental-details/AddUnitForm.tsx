import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AddUnitFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (unitData: {
    number: string;
    status: 'occupied' | 'vacant';
    rentAmount: number;
    startDate?: string;
    endDate?: string;
    resident?: {
      name: string;
    };
  }) => void;
}

export default function AddUnitForm({ isOpen, onClose, onSubmit }: AddUnitFormProps) {
  const [formData, setFormData] = useState({
    number: '',
    status: 'vacant' as 'occupied' | 'vacant',
    rentAmount: 0,
    startDate: '',
    endDate: '',
    residentName: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      number: formData.number,
      status: formData.status,
      rentAmount: formData.rentAmount,
      ...(formData.status === 'occupied' && {
        startDate: formData.startDate,
        endDate: formData.endDate,
        resident: {
          name: formData.residentName
        }
      })
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-lg z-50">
      {/* Header - Fixed */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 border-b bg-white z-10">
        <h2 className="text-lg font-semibold text-[#2C3539]">Add New Unit</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-[#2C3539]" />
        </button>
      </div>

      {/* Form - Scrollable */}
      <div className="h-full overflow-y-auto pt-[73px] pb-4">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Unit Number */}
          <div className="space-y-2">
            <label className="text-sm text-[#6B7280]">Unit Number *</label>
            <input
              type="text"
              required
              value={formData.number}
              onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
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
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                status: e.target.value as 'occupied' | 'vacant'
              }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
            >
              <option value="vacant">Vacant</option>
              <option value="occupied">Occupied</option>
            </select>
          </div>

          {/* Conditional Fields for Occupied Status */}
          {formData.status === 'occupied' && (
            <>
              {/* Rent Amount */}
              <div className="space-y-2">
                <label className="text-sm text-[#6B7280]">Monthly Rent *</label>
                <input
                  type="number"
                  required
                  value={formData.rentAmount || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, rentAmount: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                  placeholder="Enter monthly rent"
                  min="0"
                />
              </div>

              {/* Resident Name */}
              <div className="space-y-2">
                <label className="text-sm text-[#6B7280]">Resident Name *</label>
                <input
                  type="text"
                  required
                  value={formData.residentName}
                  onChange={(e) => setFormData(prev => ({ ...prev, residentName: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                  placeholder="Enter resident name"
                />
              </div>

              {/* Lease Start Date */}
              <div className="space-y-2">
                <label className="text-sm text-[#6B7280]">Lease Start Date *</label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                />
              </div>

              {/* Lease End Date */}
              <div className="space-y-2">
                <label className="text-sm text-[#6B7280]">Lease End Date *</label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                  min={formData.startDate}
                />
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full px-4 py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors"
          >
            Add Unit
          </button>
        </form>
      </div>
    </div>
  );
}

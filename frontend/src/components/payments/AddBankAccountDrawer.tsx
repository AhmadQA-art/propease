import React, { useState } from 'react';
import { X, Building2 } from 'lucide-react';

interface AddBankAccountDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function AddBankAccountDrawer({
  isOpen,
  onClose,
  onSubmit
}: AddBankAccountDrawerProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'operations',
    institution: '',
    accountNumber: '',
    routingNumber: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl z-50">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 px-6 py-4 border-b bg-white">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#2C3539]">Add Bank Account</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#2C3539]" />
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="h-full overflow-y-auto pt-[73px] pb-[88px]">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Account Name */}
          <div className="space-y-2">
            <label className="text-sm text-[#6B7280]">Account Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
              placeholder="Enter account name"
              required
            />
          </div>

          {/* Account Type */}
          <div className="space-y-2">
            <label className="text-sm text-[#6B7280]">Account Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
              required
            >
              <option value="operations">Operations Account</option>
              <option value="trust">Trust Account</option>
              <option value="reserve">Reserve Account</option>
              <option value="security">Security Deposits Account</option>
            </select>
          </div>

          {/* Bank Institution */}
          <div className="space-y-2">
            <label className="text-sm text-[#6B7280]">Bank Institution</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={formData.institution}
                onChange={(e) => setFormData(prev => ({ ...prev, institution: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                placeholder="Enter bank name"
                required
              />
            </div>
          </div>

          {/* Account Number */}
          <div className="space-y-2">
            <label className="text-sm text-[#6B7280]">Account Number</label>
            <input
              type="text"
              value={formData.accountNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
              placeholder="Enter account number"
              required
            />
          </div>

          {/* Routing Number */}
          <div className="space-y-2">
            <label className="text-sm text-[#6B7280]">Routing Number</label>
            <input
              type="text"
              value={formData.routingNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, routingNumber: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2  ring-[#2C3539]"
              placeholder="Enter routing number"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm text-[#6B7280]">Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
              placeholder="Enter description"
              rows={3}
            />
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t">
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-[#6B7280] hover:text-[#2C3539]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c]"
          >
            Add Account
          </button>
        </div>
      </div>
    </div>
  );
}
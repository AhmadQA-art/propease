import React, { useState } from 'react';
import { X, Calendar, DollarSign } from 'lucide-react';

interface TransactionEntryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function TransactionEntryDrawer({
  isOpen,
  onClose,
  onSubmit
}: TransactionEntryDrawerProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'income',
    amount: '',
    description: '',
    category: '',
    account: '',
    reference: ''
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
          <h2 className="text-lg font-semibold text-[#2C3539]">New Transaction</h2>
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
          {/* Transaction Type */}
          <div className="space-y-2">
            <label className="text-sm text-[#6B7280]">Transaction Type</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className={`px-4 py-2 rounded-lg border text-sm font-medium ${
                  formData.type === 'income'
                    ? 'border-[#2C3539] bg-[#2C3539] text-white'
                    : 'border-gray-200 text-[#2C3539] hover:bg-gray-50'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, type: 'income' }))}
              >
                Income
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded-lg border text-sm font-medium ${
                  formData.type === 'expense'
                    ? 'border-[#2C3539] bg-[#2C3539] text-white'
                    : 'border-gray-200 text-[#2C3539] hover:bg-gray-50'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
              >
                Expense
              </button>
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label className="text-sm text-[#6B7280]">Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                required
              />
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label className="text-sm text-[#6B7280]">Amount</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm text-[#6B7280]">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
              placeholder="Enter description"
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm text-[#6B7280]">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
              required
            >
              <option value="">Select category</option>
              <option value="rent">Rent</option>
              <option value="maintenance">Maintenance</option>
              <option value="utilities">Utilities</option>
              <option value="insurance">Insurance</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Account */}
          <div className="space-y-2">
            <label className="text-sm text-[#6B7280]">Account</label>
            <select
              value={formData.account}
              onChange={(e) => setFormData(prev => ({ ...prev, account: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
              required
            >
              <option value="">Select account</option>
              <option value="operations">Operations Account</option>
              <option value="trust">Trust Account</option>
              <option value="reserve">Reserve Account</option>
            </select>
          </div>

          {/* Reference Number */}
          <div className="space-y-2">
            <label className="text-sm text-[#6B7280]">Reference Number (Optional)</label>
            <input
              type="text"
              value={formData.reference}
              onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
              placeholder="Enter reference number"
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
            Save Transaction
          </button>
        </div>
      </div>
    </div>
  );
}
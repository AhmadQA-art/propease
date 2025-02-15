import React, { useState } from 'react';
import { X, Calendar, DollarSign, Plus } from 'lucide-react';
import { format } from 'date-fns';

interface RecurringPayment {
  id: string;
  description: string;
  amount: number;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'annually';
  nextDate: string;
  category: string;
  account: string;
  status: 'active' | 'paused';
}

const mockRecurringPayments: RecurringPayment[] = [
  {
    id: 'REC001',
    description: 'Property Insurance',
    amount: 1200,
    frequency: 'monthly',
    nextDate: '2024-04-01',
    category: 'Insurance',
    account: 'Operations Account',
    status: 'active'
  },
  {
    id: 'REC002',
    description: 'Landscaping Service',
    amount: 800,
    frequency: 'monthly',
    nextDate: '2024-04-05',
    category: 'Maintenance',
    account: 'Operations Account',
    status: 'active'
  },
  {
    id: 'REC003',
    description: 'Property Tax',
    amount: 5000,
    frequency: 'quarterly',
    nextDate: '2024-06-15',
    category: 'Taxes',
    account: 'Operations Account',
    status: 'active'
  }
];

interface RecurringPaymentsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RecurringPaymentsDrawer({
  isOpen,
  onClose
}: RecurringPaymentsDrawerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    frequency: 'monthly',
    nextDate: '',
    category: '',
    account: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement form submission logic
    console.log('New recurring payment:', formData);
    setShowAddForm(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl z-50">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 px-6 py-4 border-b bg-white">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#2C3539]">Recurring Payments</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#2C3539]" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="h-full overflow-y-auto pt-[73px] pb-[88px]">
        {!showAddForm ? (
          <div className="p-6 space-y-6">
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center w-full px-4 py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Recurring Payment
            </button>

            <div className="space-y-4">
              {mockRecurringPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-[#2C3539]">{payment.description}</h3>
                      <p className="text-sm text-[#6B7280]">{payment.category}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      payment.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {payment.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-[#6B7280]">Amount</p>
                      <p className="text-[#2C3539] font-medium">${payment.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#6B7280]">Frequency</p>
                      <p className="text-[#2C3539] capitalize">{payment.frequency}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#6B7280]">Next Payment</p>
                      <p className="text-[#2C3539]">{format(new Date(payment.nextDate), 'MMM d, yyyy')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#6B7280]">Account</p>
                      <p className="text-[#2C3539]">{payment.account}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
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

            {/* Frequency */}
            <div className="space-y-2">
              <label className="text-sm text-[#6B7280]">Frequency</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                required
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
              </select>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <label className="text-sm text-[#6B7280]">Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  value={formData.nextDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, nextDate: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                  required
                />
              </div>
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
                <option value="maintenance">Maintenance</option>
                <option value="insurance">Insurance</option>
                <option value="utilities">Utilities</option>
                <option value="taxes">Taxes</option>
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
          </form>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t">
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => {
              if (showAddForm) {
                setShowAddForm(false);
              } else {
                onClose();
              }
            }}
            className="px-4 py-2 text-[#6B7280] hover:text-[#2C3539]"
          >
            {showAddForm ? 'Cancel' : 'Close'}
          </button>
          {showAddForm && (
            <button
              type="submit"
              className="px-4 py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c]"
            >
              Save Payment
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
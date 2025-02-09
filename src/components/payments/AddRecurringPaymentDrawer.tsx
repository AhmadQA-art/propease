import React, { useState } from 'react';
import { X, Calendar, Repeat, CreditCard, DollarSign } from 'lucide-react';

type AddRecurringPaymentDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AddRecurringPaymentDrawer({ 
  isOpen, 
  onClose 
}: AddRecurringPaymentDrawerProps) {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    account: '',
    frequency: 'monthly',
    startDate: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement submit logic for recurring payment
    console.log('Recurring Payment Submitted:', formData);
    onClose();
  };

  return (
    <div 
      className={`fixed inset-y-0 right-0 w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } z-50 overflow-hidden`}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 border-b bg-white z-10">
        <h2 className="text-lg font-semibold text-[#2C3539]">Add Recurring Payment</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-[#2C3539]" />
        </button>
      </div>

      {/* Content - Scrollable */}
      <form 
        onSubmit={handleSubmit}
        className="h-full overflow-y-auto pt-[73px] pb-4 px-4 space-y-6"
      >
        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-[#2C3539] mb-2">
            Description
          </label>
          <div className="relative">
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
              placeholder="Enter description"
              required
            />
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-[#2C3539] mb-2">
            Amount
          </label>
          <div className="relative">
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
              placeholder="Enter amount"
              required
            />
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-[#2C3539] mb-2">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
            required
          >
            <option value="">Select Category</option>
            <option value="utilities">Utilities</option>
            <option value="rent">Rent</option>
            <option value="insurance">Insurance</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Account */}
        <div>
          <label htmlFor="account" className="block text-sm font-medium text-[#2C3539] mb-2">
            Account
          </label>
          <select
            id="account"
            name="account"
            value={formData.account}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
            required
          >
            <option value="">Select Account</option>
            <option value="checking">Checking</option>
            <option value="savings">Savings</option>
            <option value="credit">Credit Card</option>
          </select>
        </div>

        {/* Frequency */}
        <div>
          <label htmlFor="frequency" className="block text-sm font-medium text-[#2C3539] mb-2">
            Frequency
          </label>
          <select
            id="frequency"
            name="frequency"
            value={formData.frequency}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
            required
          >
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
            <option value="quarterly">Quarterly</option>
            <option value="annually">Annually</option>
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-[#2C3539] mb-2">
            Start Date
          </label>
          <div className="relative">
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
              required
            />
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-[#2C3539] text-white py-2 rounded-lg hover:bg-opacity-90 transition-colors"
        >
          Add Recurring Payment
        </button>
      </form>
    </div>
  );
}

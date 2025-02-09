import React, { useState } from 'react';
import { Plus, Download, Search } from 'lucide-react';
import { mockAccounts, Account } from '../../data/mockFinancialData';

// Helper function to get category color
const getCategoryColor = (category: Account['category']) => {
  switch (category) {
    case 'Asset': return 'bg-green-100 text-green-800';
    case 'Liability': return 'bg-red-100 text-red-800';
    case 'Equity': return 'bg-blue-100 text-blue-800';
    case 'Income': return 'bg-purple-100 text-purple-800';
    case 'Expense': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Define account categories for dropdown
const accountCategories = ['all', 'Asset', 'Liability', 'Equity', 'Income', 'Expense'];

export default function ChartOfAccounts() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredAccounts = mockAccounts.filter((account: Account) => {
    const matchesSearch = 
      account.number.includes(searchQuery) ||
      account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || account.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header Actions and Search */}
      <div className="flex justify-between items-center">
        <div className="flex-1 flex items-center space-x-3">
          {/* Search and Filter Container */}
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Search accounts by number, name, or description" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B7280] w-5 h-5" />
          </div>

          {/* Category Dropdown */}
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
          >
            {accountCategories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="ml-4 flex items-center space-x-3">
          <button className="flex items-center px-4 py-2 text-sm border border-[#2C3539] text-[#2C3539] rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button className="flex items-center px-4 py-2 text-sm bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Add Account
          </button>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Account Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Account Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[#6B7280] uppercase tracking-wider">Balance ($)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAccounts.map((account: Account) => (
                <tr key={account.number} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#2C3539]">
                    {account.number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2C3539]">
                    {account.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(account.category)}`}>
                      {account.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#6B7280]">
                    {account.description}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                    account.balance && account.balance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {account.balance?.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* No Results State */}
          {filteredAccounts.length === 0 && (
            <div className="text-center py-10 text-[#6B7280]">
              No accounts found matching your search criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
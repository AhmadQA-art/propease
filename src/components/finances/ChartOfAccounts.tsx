import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, FileText, Download, Edit2, Trash2 } from 'lucide-react';

interface Account {
  number: string;
  name: string;
  category: 'Asset' | 'Liability' | 'Income' | 'Expense' | 'Equity';
  description: string;
  balance?: number;
}

const mockAccounts: Account[] = [
  {
    number: '1000',
    name: 'Operating Bank Account',
    category: 'Asset',
    description: 'Primary bank account for operations.',
    balance: 250000
  },
  {
    number: '1001',
    name: 'Security Deposits Held',
    category: 'Asset',
    description: 'Funds held as tenant security deposits.',
    balance: 75000
  },
  {
    number: '1002',
    name: 'Accounts Receivable',
    category: 'Asset',
    description: 'Rent and other payments due from tenants.',
    balance: 15000
  },
  {
    number: '2000',
    name: 'Accounts Payable',
    category: 'Liability',
    description: 'Amounts owed to vendors or contractors.',
    balance: -35000
  },
  {
    number: '2001',
    name: 'Security Deposit Liability',
    category: 'Liability',
    description: 'Liability for tenant security deposits.',
    balance: -75000
  },
  {
    number: '3000',
    name: 'Rental Income',
    category: 'Income',
    description: 'Income from tenant rents collected.',
    balance: 180000
  },
  {
    number: '3001',
    name: 'Management Fee Income',
    category: 'Income',
    description: 'Revenue from property management services.',
    balance: 25000
  },
  {
    number: '4000',
    name: 'Maintenance Expenses',
    category: 'Expense',
    description: 'Costs of property repairs and upkeep.',
    balance: -45000
  },
  {
    number: '4001',
    name: 'Utilities',
    category: 'Expense',
    description: 'Utility costs (electricity, water, gas).',
    balance: -12000
  },
  {
    number: '4002',
    name: 'Office Supplies',
    category: 'Expense',
    description: 'Costs for office equipment and supplies.',
    balance: -3500
  },
  {
    number: '5000',
    name: 'Retained Earnings',
    category: 'Equity',
    description: 'Accumulated profits not distributed to owners.',
    balance: 150000
  }
];

const getCategoryColor = (category: Account['category']) => {
  switch (category) {
    case 'Asset':
      return 'bg-blue-100 text-blue-800';
    case 'Liability':
      return 'bg-red-100 text-red-800';
    case 'Income':
      return 'bg-green-100 text-green-800';
    case 'Expense':
      return 'bg-yellow-100 text-yellow-800';
    case 'Equity':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function ChartOfAccounts() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredAccounts = mockAccounts.filter(account => {
    const matchesSearch = 
      account.number.includes(searchQuery) ||
      account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || account.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div className="flex gap-3">
          <button className="flex items-center px-4 py-2 text-sm bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Add Account
          </button>
          <button className="flex items-center px-4 py-2 text-sm border border-[#2C3539] text-[#2C3539] rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export
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
                <th className="px-6 py-3 text-right text-xs font-medium text-[#6B7280] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAccounts.map((account) => (
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
                    account.balance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {account.balance?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className="flex justify-end space-x-2">
                      <button className="p-1.5 text-[#6B7280] hover:bg-gray-100 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-[#6B7280] hover:bg-gray-100 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
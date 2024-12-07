import React, { useState } from 'react';
import { Search, Filter, Calendar, ChevronDown, ChevronRight, FileText, Download, Eye, MessageSquare, Bell } from 'lucide-react';
import { format } from 'date-fns';
import DateRangeSelector from './DateRangeSelector';

interface Transaction {
  id: string;
  date: string;
  account: string;
  transactionType: string;
  debit: number | null;
  credit: number | null;
  balance: number;
  linkedEntity: string;
  propertyName: string;
  description?: string;
}

const mockTransactions: Transaction[] = [
  {
    id: 'T001',
    date: '2024-01-12',
    account: 'Operating Bank Account',
    transactionType: 'Rent Payment',
    debit: 1200,
    credit: null,
    balance: 26200,
    linkedEntity: 'Tenant A',
    propertyName: 'Sunrise Apartments'
  },
  {
    id: 'T002',
    date: '2024-03-12',
    account: 'Accounts Payable',
    transactionType: 'Maintenance Expense',
    debit: null,
    credit: 800,
    balance: -800,
    linkedEntity: 'Contractor XYZ',
    propertyName: 'Sunset Villas'
  },
  {
    id: 'T003',
    date: '2024-05-12',
    account: 'Utilities',
    transactionType: 'Operating Expense',
    debit: null,
    credit: 300,
    balance: -300,
    linkedEntity: 'Utility Company ABC',
    propertyName: 'Sunrise Apartments'
  }
];

export default function GeneralLedger() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState('monthly');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  const filteredTransactions = mockTransactions.filter(transaction => {
    const matchesSearch = 
      transaction.account.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.transactionType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.linkedEntity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.propertyName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesAccount = selectedAccount === 'all' || transaction.account === selectedAccount;
    
    return matchesSearch && matchesAccount;
  });

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search transactions..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <DateRangeSelector
          selected={selectedDateRange}
          onChange={setSelectedDateRange}
        />

        <div className="relative">
          <button
            onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
            className="flex items-center px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>

          {isFilterDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-100 p-4 z-10">
              <div>
                <label className="block text-sm font-medium text-[#6B7280] mb-2">
                  Account
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                >
                  <option value="all">All Accounts</option>
                  <option value="Operating Bank Account">Operating Bank Account</option>
                  <option value="Accounts Payable">Accounts Payable</option>
                  <option value="Utilities">Utilities</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Account</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Transaction Type</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[#6B7280] uppercase tracking-wider">Debit ($)</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[#6B7280] uppercase tracking-wider">Credit ($)</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[#6B7280] uppercase tracking-wider">Balance ($)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Linked Entity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">Property Name</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[#6B7280] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2C3539]">
                    {format(new Date(transaction.date), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2C3539]">
                    {transaction.account}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2C3539]">
                    {transaction.transactionType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-[#2C3539]">
                    {transaction.debit?.toLocaleString() || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-[#2C3539]">
                    {transaction.credit?.toLocaleString() || '-'}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                    transaction.balance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.balance.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2C3539]">
                    {transaction.linkedEntity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2C3539]">
                    {transaction.propertyName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className="flex justify-end space-x-2">
                      <button className="p-1.5 text-[#6B7280] hover:bg-gray-100 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-[#6B7280] hover:bg-gray-100 rounded-lg transition-colors">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-[#6B7280] hover:bg-gray-100 rounded-lg transition-colors">
                        <Bell className="w-4 h-4" />
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
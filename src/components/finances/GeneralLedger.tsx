import React, { useState } from 'react';
import { Search, Filter, Calendar, ChevronDown, ChevronRight, FileText, Download } from 'lucide-react';
import { format } from 'date-fns';
import DateRangeSelector from './DateRangeSelector';

interface Transaction {
  id: string;
  date: Date;
  account: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  category: string;
  attachments?: string[];
  details?: string;
}

const mockTransactions: Transaction[] = [
  {
    id: 'TXN001',
    date: new Date(2024, 2, 15),
    account: 'Rental Income',
    description: 'Monthly Rent - Unit 204',
    amount: 2500,
    type: 'credit',
    category: 'Income',
    attachments: ['receipt.pdf'],
    details: 'Rent payment for March 2024'
  },
  {
    id: 'TXN002',
    date: new Date(2024, 2, 14),
    account: 'Maintenance Expense',
    description: 'HVAC Repair',
    amount: 450,
    type: 'debit',
    category: 'Expense',
    attachments: ['invoice.pdf', 'work_order.pdf'],
    details: 'Emergency HVAC repair in Unit 301'
  }
];

export default function GeneralLedger() {
  const [expandedTransactions, setExpandedTransactions] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState('monthly');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  const toggleTransaction = (id: string) => {
    setExpandedTransactions(prev =>
      prev.includes(id) ? prev.filter(txnId => txnId !== id) : [...prev, id]
    );
  };

  const filteredTransactions = mockTransactions.filter(transaction => {
    const matchesSearch = 
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.account.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === 'all' || transaction.type === selectedType;
    const matchesCategory = selectedCategory === 'all' || transaction.category === selectedCategory;
    
    return matchesSearch && matchesType && matchesCategory;
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
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-2">
                    Transaction Type
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    <option value="credit">Credit</option>
                    <option value="debit">Debit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-2">
                    Category
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    <option value="Income">Income</option>
                    <option value="Expense">Expense</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                  Account
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <React.Fragment key={transaction.id}>
                  <tr
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleTransaction(transaction.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2C3539]">
                      {format(transaction.date, 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2C3539]">
                      {transaction.account}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#2C3539]">
                      <div className="flex items-center">
                        {expandedTransactions.includes(transaction.id) ? (
                          <ChevronDown className="w-4 h-4 mr-2 text-[#6B7280]" />
                        ) : (
                          <ChevronRight className="w-4 h-4 mr-2 text-[#6B7280]" />
                        )}
                        {transaction.description}
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                      transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toLocaleString()}
                    </td>
                  </tr>

                  {/* Expanded Details */}
                  {expandedTransactions.includes(transaction.id) && (
                    <tr className="bg-gray-50">
                      <td colSpan={4} className="px-6 py-4">
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-[#2C3539] mb-2">Details</h4>
                            <p className="text-sm text-[#6B7280]">{transaction.details}</p>
                          </div>

                          {transaction.attachments && transaction.attachments.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-[#2C3539] mb-2">Attachments</h4>
                              <div className="flex gap-2">
                                {transaction.attachments.map((attachment, index) => (
                                  <button
                                    key={index}
                                    className="flex items-center px-3 py-1.5 text-sm text-[#2C3539] bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                                  >
                                    <FileText className="w-4 h-4 mr-2" />
                                    {attachment}
                                    <Download className="w-4 h-4 ml-2" />
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
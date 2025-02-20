import { useState } from 'react';
import { Search, Filter, Calendar, ArrowUpRight, ArrowDownRight, Repeat, ArrowDownToLine } from 'lucide-react';
import { format } from 'date-fns';
import TransactionDetailsDrawer from './TransactionDetailsDrawer';
import AddRecurringPaymentDrawer from './AddRecurringPaymentDrawer';

interface Transaction {
  id: string;
  date: string;
  description: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  account: string;
  status: 'completed' | 'pending' | 'failed';
  reference?: string;
  transactionType: 'recurring' | 'one-time';
}

const mockTransactions: Transaction[] = [
  {
    id: 'TXN001',
    date: '2024-03-15',
    description: 'Rent Payment - Unit 204',
    type: 'income',
    amount: 2500,
    category: 'Rent',
    account: 'Operations Account',
    status: 'completed',
    reference: 'PMT-2024-001',
    transactionType: 'recurring'
  },
  {
    id: 'TXN002',
    date: '2024-03-14',
    description: 'Maintenance Service',
    type: 'expense',
    amount: 450,
    category: 'Maintenance',
    account: 'Operations Account',
    status: 'completed',
    transactionType: 'one-time'
  },
  {
    id: 'TXN003',
    date: '2024-03-16',
    description: 'Security Deposit - Unit 512',
    type: 'income',
    amount: 3000,
    category: 'Security Deposit',
    account: 'Trust Account',
    status: 'pending',
    transactionType: 'one-time'
  }
].map(transaction => ({
  ...transaction,
  transactionType: transaction.transactionType || 'one-time'
}));

const getStatusColor = (status: Transaction['status']) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getTransactionTypeIcon = (transactionType: string) => {
  switch (transactionType) {
    case 'recurring':
      return (
        <Repeat className="w-4 h-4 text-[#6B7280]" />
      );
    case 'one-time':
      return (
        <ArrowDownToLine className="w-4 h-4 text-[#6B7280]" />
      );
    default:
      return null;
  }
};

export default function TransactionsView({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddRecurringPaymentOpen, setIsAddRecurringPaymentOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
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

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="h-10 w-10 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-5 h-5 text-[#2C3539]" />
          </button>

          <button
            onClick={() => setIsAddRecurringPaymentOpen(true)}
            className="flex items-center px-4 py-2 border border-[#2C3539] text-[#2C3539] rounded-lg hover:bg-gray-50"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Add Recurring Payment
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-8">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-4 text-left text-sm font-medium text-[#6B7280]">Type</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-[#6B7280]">Date</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-[#6B7280]">Description</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-[#6B7280]">Category</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-[#6B7280]">Account</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-[#6B7280]">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-[#6B7280]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockTransactions.map((transaction) => (
                <tr 
                  key={transaction.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedTransaction(transaction)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2C3539]">
                    {getTransactionTypeIcon(transaction.transactionType)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2C3539]">
                    {format(new Date(transaction.date), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#2C3539]">
                    <div>
                      <p>{transaction.description}</p>
                      {transaction.reference && (
                        <p className="text-xs text-[#6B7280] mt-0.5">Ref: {transaction.reference}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2C3539]">
                    {transaction.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2C3539]">
                    {transaction.account}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className="flex items-center justify-end space-x-1">
                      {transaction.type === 'income' ? (
                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-500" />
                      )}
                      <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                        ${transaction.amount.toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Recurring Payment Drawer */}
      <AddRecurringPaymentDrawer
        isOpen={isAddRecurringPaymentOpen}
        onClose={() => setIsAddRecurringPaymentOpen(false)}
      />

      {/* Transaction Details Drawer */}
      <TransactionDetailsDrawer
        transaction={selectedTransaction}
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </div>
  );
}
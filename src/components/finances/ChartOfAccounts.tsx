import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, FileText } from 'lucide-react';
import AccountEntry from './AccountEntry';

interface Account {
  id: string;
  name: string;
  type: 'asset' | 'liability' | 'income' | 'expense' | 'equity';
  balance: number;
  children?: Account[];
}

const mockAccounts: Account[] = [
  {
    id: '1',
    name: 'Assets',
    type: 'asset',
    balance: 250000,
    children: [
      {
        id: '1.1',
        name: 'Accounts Receivable',
        type: 'asset',
        balance: 75000
      },
      {
        id: '1.2',
        name: 'Operating Bank Account',
        type: 'asset',
        balance: 125000
      },
      {
        id: '1.3',
        name: 'Security Deposits',
        type: 'asset',
        balance: 50000
      }
    ]
  },
  {
    id: '2',
    name: 'Liabilities',
    type: 'liability',
    balance: 85000,
    children: [
      {
        id: '2.1',
        name: 'Accounts Payable',
        type: 'liability',
        balance: 35000
      },
      {
        id: '2.2',
        name: 'Security Deposit Liability',
        type: 'liability',
        balance: 50000
      }
    ]
  },
  {
    id: '3',
    name: 'Income',
    type: 'income',
    balance: 180000,
    children: [
      {
        id: '3.1',
        name: 'Rental Income',
        type: 'income',
        balance: 150000
      },
      {
        id: '3.2',
        name: 'Late Fees',
        type: 'income',
        balance: 5000
      },
      {
        id: '3.3',
        name: 'Service Fees',
        type: 'income',
        balance: 25000
      }
    ]
  }
];

export default function ChartOfAccounts() {
  const [expandedAccounts, setExpandedAccounts] = useState<string[]>(['1', '2', '3']);

  const toggleAccount = (accountId: string) => {
    setExpandedAccounts(prev =>
      prev.includes(accountId)
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    );
  };

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
            <FileText className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Accounts List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 space-y-4">
          {mockAccounts.map((account) => (
            <AccountEntry
              key={account.id}
              account={account}
              isExpanded={expandedAccounts.includes(account.id)}
              onToggle={() => toggleAccount(account.id)}
              level={0}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { Plus, Building2, DollarSign, TrendingUp, MoreHorizontal, Link } from 'lucide-react';
import AddBankAccountDrawer from './AddBankAccountDrawer';

interface BankAccount {
  id: string;
  name: string;
  type: 'trust' | 'operations' | 'reserve' | 'security';
  accountNumber: string;
  balance: number;
  institution: string;
  status: 'active' | 'inactive';
  lastSync?: string;
}

const mockAccounts: BankAccount[] = [
  {
    id: 'ACC001',
    name: 'Main Operations Account',
    type: 'operations',
    accountNumber: '****1234',
    balance: 125000,
    institution: 'Bank of America',
    status: 'active',
    lastSync: '2024-03-15T14:30:00Z'
  },
  {
    id: 'ACC002',
    name: 'Trust Account',
    type: 'trust',
    accountNumber: '****5678',
    balance: 250000,
    institution: 'Wells Fargo',
    status: 'active',
    lastSync: '2024-03-15T14:30:00Z'
  },
  {
    id: 'ACC003',
    name: 'Security Deposits',
    type: 'security',
    accountNumber: '****9012',
    balance: 75000,
    institution: 'Chase',
    status: 'active',
    lastSync: '2024-03-15T14:30:00Z'
  },
  {
    id: 'ACC004',
    name: 'Reserve Account',
    type: 'reserve',
    accountNumber: '****3456',
    balance: 100000,
    institution: 'Citibank',
    status: 'active',
    lastSync: '2024-03-15T14:30:00Z'
  }
];

const getAccountTypeColor = (type: BankAccount['type']) => {
  switch (type) {
    case 'trust':
      return 'bg-blue-100 text-blue-800';
    case 'operations':
      return 'bg-green-100 text-green-800';
    case 'reserve':
      return 'bg-purple-100 text-purple-800';
    case 'security':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function BankAccountsView() {
  const [isAddAccountDrawerOpen, setIsAddAccountDrawerOpen] = useState(false);

  const handleAddAccount = (accountData: any) => {
    // Implement account creation logic
    console.log('New account:', accountData);
    setIsAddAccountDrawerOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <div className="flex items-center px-4 py-2 bg-white rounded-lg border border-gray-200">
            <DollarSign className="w-5 h-5 text-[#2C3539] mr-2" />
            <div>
              <p className="text-sm text-[#6B7280]">Total Balance</p>
              <p className="text-lg font-semibold text-[#2C3539]">
                ${(550000).toLocaleString()}
              </p>
            </div>
          </div>
          <button className="flex items-center px-4 py-2 bg-white rounded-lg border border-gray-200 text-[#2C3539] hover:bg-gray-50">
            <Link className="w-4 h-4 mr-2" />
            Connect Bank
          </button>
        </div>
        <button
          onClick={() => setIsAddAccountDrawerOpen(true)}
          className="flex items-center px-4 py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Account
        </button>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockAccounts.map((account) => (
          <div
            key={account.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <Building2 className="w-10 h-10 text-[#2C3539] mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-[#2C3539]">{account.name}</h3>
                  <p className="text-sm text-[#6B7280]">{account.institution}</p>
                </div>
              </div>
              <button className="p-2 text-[#6B7280] hover:bg-gray-100 rounded-lg transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-[#6B7280] mb-1">Account Number</p>
                <p className="text-[#2C3539]">{account.accountNumber}</p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#6B7280] mb-1">Current Balance</p>
                  <p className="text-xl font-semibold text-[#2C3539]">
                    ${account.balance.toLocaleString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getAccountTypeColor(account.type)}`}>
                  {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                </span>
              </div>

              {account.lastSync && (
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm text-[#6B7280]">
                    <span>Last synced {new Date(account.lastSync).toLocaleTimeString()}</span>
                    <div className="flex items-center text-green-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span>Active</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <AddBankAccountDrawer
        isOpen={isAddAccountDrawerOpen}
        onClose={() => setIsAddAccountDrawerOpen(false)}
        onSubmit={handleAddAccount}
      />
    </div>
  );
}
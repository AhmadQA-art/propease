import React, { useState } from 'react';
import { Plus, Landmark, Building2, TrendingUp, Link } from 'lucide-react';
import AddBankAccountDrawer from './AddBankAccountDrawer';

interface BankAccount {
  id: string;
  name: string;
  type: string;
  balance: number;
  institution: string;
  accountNumber: string;
  lastSync: string;
  status: 'active' | 'pending' | 'inactive';
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
        <div>
          <div className="flex items-center px-4 py-2 bg-white rounded-lg border border-gray-200">
            <div>
              <p className="text-sm text-[#6B7280]">Total Balance</p>
              <p className="text-lg font-semibold text-[#2C3539]">
                ${(550000).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsAddAccountDrawerOpen(true)}
          className="flex items-center px-4 py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Account
        </button>
      </div>

      {/* Accounts List */}
      <div className="space-y-3">
        {mockAccounts.map((account) => (
          <div
            key={account.id}
            className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
          >
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Landmark className="w-5 h-5 text-[#2C3539]" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-[#2C3539]">{account.name}</p>
                  <span className="text-sm text-gray-500">•</span>
                  <p className="text-sm text-gray-500">{account.institution}</p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>{account.type} Account</span>
                  <span>•</span>
                  <span>Last synced {new Date(account.lastSync).toLocaleTimeString()}</span>
                  <span>•</span>
                  <span className={`text-${account.status === 'active' ? 'green' : 'red'}-600`}>{account.status}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-[#2C3539]">${account.balance.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Available Balance</p>
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
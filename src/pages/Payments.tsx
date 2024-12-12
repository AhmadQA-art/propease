import React, { useState } from 'react';
import TabHeader from '../components/tabs/TabHeader';
import TransactionsView from '../components/payments/TransactionsView';
import BankAccountsView from '../components/payments/BankAccountsView';

const tabs = ['Transactions', 'Bank Accounts'];

export default function Payments() {
  const [activeTab, setActiveTab] = useState('Transactions');
  const [isTransactionsDrawerOpen, setIsTransactionsDrawerOpen] = useState(false);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Transactions':
        return (
          <div className="relative">
            <TransactionsView 
              isOpen={isTransactionsDrawerOpen}
              onClose={() => setIsTransactionsDrawerOpen(false)}
            />
          </div>
        );
      case 'Bank Accounts':
        return <BankAccountsView />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#2C3539]">Payments</h1>
        <p className="text-[#6B7280] mt-1">Manage transactions and bank accounts</p>
      </div>

      <TabHeader
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="mt-6">
        {renderTabContent()}
      </div>
    </div>
  );
}
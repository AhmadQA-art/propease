import React, { useState } from 'react';
import TabHeader from '../components/tabs/TabHeader';
import FinancialOverview from '../components/finances/FinancialOverview';
import ChartOfAccounts from '../components/finances/ChartOfAccounts';

const tabs = ['Financial Overview', 'Chart of Accounts'];

export default function Finances() {
  const [activeTab, setActiveTab] = useState('Financial Overview');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Financial Overview':
        return <FinancialOverview />;
      case 'Chart of Accounts':
        return <ChartOfAccounts />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#2C3539]">Finances</h1>
        <p className="text-[#6B7280] mt-1">Track and manage your financial performance</p>
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
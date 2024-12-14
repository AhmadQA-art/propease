import React, { useState } from 'react';
import TabHeader from '../components/tabs/TabHeader';
import Announcements from '../components/communications/Announcements';
import CommunicationsLog from '../components/communications/CommunicationsLog';

const tabs = ['Announcements', 'Communications Log'];

export default function Communications() {
  const [activeTab, setActiveTab] = useState('Announcements');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Announcements':
        return <Announcements />;
      case 'Communications Log':
        return <CommunicationsLog />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#2C3539]">Communications</h1>
        <p className="text-[#6B7280] mt-1">Manage announcements and communication logs</p>
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
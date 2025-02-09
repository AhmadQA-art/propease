import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { RentalDetails } from '../types/rental';
import TabHeader from '../components/tabs/TabHeader';
import RentalOverview from '../components/rental-details/RentalOverview';
import RentalUnits from '../components/rental-details/RentalUnits';
import RentalApplications from '../components/rental-details/RentalApplications';
import RentalTasks from '../components/rental-details/RentalTasks';
import RentalActivities from '../components/rental-details/RentalActivities';

interface RentalDetailsPageProps {
  rental?: RentalDetails;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const tabs = ['Overview', 'Units', 'Rental Applications', 'Tasks', 'Activities'];

export default function RentalDetailsPage({ rental, onEdit, onDelete }: RentalDetailsPageProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');

  if (!rental) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Rental not found</p>
      </div>
    );
  }

  const handleEdit = () => {
    navigate(`/rentals/${rental.id}/edit`);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this rental? This action cannot be undone.')) {
      onDelete(rental.id);
      navigate('/rentals');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Overview':
        return <RentalOverview rental={rental} onEdit={handleEdit} onDelete={handleDelete} />;
      case 'Units':
        return <RentalUnits />;
      case 'Rental Applications':
        return <RentalApplications />;
      case 'Tasks':
        return <RentalTasks />;
      case 'Activities':
        return <RentalActivities />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/rentals')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#2C3539]" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#2C3539]">{rental.propertyName}</h1>
        </div>
      </div>

      {/* Tabs */}
      <TabHeader
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Tab Content */}
      <div className="mt-2">
        {renderTabContent()}
      </div>
    </div>
  );
}
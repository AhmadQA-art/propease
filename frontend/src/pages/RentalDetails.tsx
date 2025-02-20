import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const tabs = ['Overview', 'Units', 'Rental Applications', 'Tasks', 'Activities'];

export default function RentalDetailsPage({ rental }: RentalDetailsPageProps) {
  const navigate = useNavigate();
  const { id } = useParams();

  const handleEdit = () => {
    navigate(`/rentals/${id}/edit`);
  };

  const handleDelete = () => {
    navigate('/rentals');
  };

  if (!rental) {
    return <div>Loading...</div>;
  }

  return (
    <RentalOverview 
      rental={rental} 
      onEdit={handleEdit} 
      onDelete={handleDelete}
    />
  );
}
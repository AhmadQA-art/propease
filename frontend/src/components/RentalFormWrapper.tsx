import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { RentalDetails, Person } from '../types/rental';
import AddRentalForm from './AddRentalForm';

interface RentalFormWrapperProps {
  rentals: RentalDetails[];
  onSubmit: (id: string, rental: Omit<RentalDetails, 'id' | 'status'>) => void;
  propertyManagers: Person[];
  propertyOwners: Person[];
}

export default function RentalFormWrapper({ 
  rentals, 
  onSubmit,
  propertyManagers,
  propertyOwners 
}: RentalFormWrapperProps) {
  const { id } = useParams<{ id: string }>();
  const rental = rentals.find(r => r.id === id);

  if (!rental) {
    return <Navigate to="/rentals" />;
  }

  const initialData = {
    propertyId: rental.propertyId,
    propertyName: rental.propertyName,
    type: rental.type,
    unit: rental.unit,
    startDate: rental.startDate,
    endDate: rental.endDate,
    rentAmount: rental.rentAmount,
    paymentFrequency: rental.paymentFrequency,
    resident: rental.resident,
    owner: rental.owner,
    manager: rental.manager,
    agreementFile: rental.agreementFile
  };

  return (
    <AddRentalForm
      initialData={initialData}
      mode="edit"
      onSubmit={(values) => onSubmit(rental.id, values)}
      propertyManagers={propertyManagers}
      propertyOwners={propertyOwners}
    />
  );
}

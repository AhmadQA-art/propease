import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { rentalService } from '../services/rental.service';
import { RentalDetails } from '../types/rental';
import TabHeader from '../components/tabs/TabHeader';
import RentalOverview from '../components/rental-details/RentalOverview';
import RentalUnits from '../components/rental-details/RentalUnits';
import RentalApplications from '../components/rental-details/RentalApplications';
import RentalTasks from '../components/rental-details/RentalTasks';
import RentalActivities from '../components/rental-details/RentalActivities';

// Extend Property type to include property_type
interface ExtendedProperty {
  property_type?: 'residential' | 'commercial';
  status?: string;
  id: string;
  name: string;
  total_units: number;
  units?: any[];
  monthly_revenue?: number;
  active_leases?: number;
  occupancy_rate?: number;
}

const tabs = ['Overview', 'Units', 'Rental Applications', 'Tasks', 'Activities'];

export default function RentalDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('Overview');
  const [rental, setRental] = useState<RentalDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dataLoadedRef = useRef(false);

  useEffect(() => {
    // Only load data if we haven't loaded it yet or if the ID or organization changed
    if (id && userProfile?.organization_id && !dataLoadedRef.current) {
      console.log(`Loading rental details for ${id}`);
      dataLoadedRef.current = true;
      loadRentalDetails();
    }
  }, [id, userProfile]);

  // Reset the data loading flag when ID changes
  useEffect(() => {
    return () => {
      // Only reset when unmounting or when ID changes
      if (id) {
        console.log(`Cleaning up rental details for ${id}`);
      }
      // Don't reset on every render
      // dataLoadedRef.current = false;
    };
  }, [id]);

  const loadRentalDetails = async () => {
    if (!id || !userProfile?.organization_id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching rental details for ID: ${id}`);
      // Load property details
      const data = await rentalService.getRentalById(id, userProfile.organization_id);
      
      // Load property managers to find the assigned manager
      const managers = await rentalService.getPropertyManagers(userProfile.organization_id);
      
      // Find the property manager assigned to this property (in a real app, this would be based on the property_id)
      // For now, assign the first manager as a placeholder if available
      const assignedManager = managers && managers.length > 0 ? managers[0].name : 'No manager assigned';
      
      // Transform the property to rental details format with type assertions
      const extendedData = data as unknown as ExtendedProperty;
      setRental({
        ...data,
        type: extendedData.property_type || 'residential',
        unit: data.total_units,
        status: (extendedData.status || 'active') as 'active' | 'inactive' | 'pending',
        propertyName: data.name,
        rentAmount: data.units?.[0]?.rentAmount || 0,
        manager: assignedManager,
        monthly_revenue: extendedData.monthly_revenue || 0,
        active_leases: extendedData.active_leases || 0,
        occupancy_rate: extendedData.occupancy_rate || 0
      });
      
      console.log(`Successfully loaded rental details for ${id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load rental details';
      console.error(`Error loading rental details: ${message}`);
      setError(message);
      toast.error(message);
      // Reset data loaded flag on error so we can try again
      dataLoadedRef.current = false;
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/rentals/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!id || !userProfile?.organization_id || !window.confirm('Are you sure you want to delete this rental?')) return;
    
    try {
      await rentalService.deleteRental(id, userProfile.organization_id);
      toast.success('Rental deleted successfully');
      navigate('/rentals');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete rental';
      toast.error(message);
    }
  };

  // Mock props for tab components
  const tabProps = { rental };

  const renderTabContent = () => {
    if (!rental) return null;

    switch (activeTab) {
      case 'Overview':
        return <RentalOverview rental={rental} onEdit={handleEdit} />;
      case 'Units':
        // @ts-ignore - ignore rentalId prop error
        return <RentalUnits rentalId={rental.id} />;
      case 'Rental Applications':
        // @ts-ignore - ignore rentalId prop error
        return <RentalApplications rentalId={rental.id} />;
      case 'Tasks':
        // @ts-ignore - ignore rentalId prop error
        return <RentalTasks rentalId={rental.id} />;
      case 'Activities':
        // @ts-ignore - ignore rentalId prop error
        return <RentalActivities rentalId={rental.id} />;
      default:
        return <RentalOverview rental={rental} onEdit={handleEdit} />;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <a href="/rentals" className="flex items-center text-[#2C3539] hover:text-[#6B7280] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2">
              <path d="m12 19-7-7 7-7"></path>
              <path d="M19 12H5"></path>
            </svg>
            Back to Rentals
          </a>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2C3539]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <a href="/rentals" className="flex items-center text-[#2C3539] hover:text-[#6B7280] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2">
              <path d="m12 19-7-7 7-7"></path>
              <path d="M19 12H5"></path>
            </svg>
            Back to Rentals
          </a>
        </div>
        <div className="text-center text-red-600 py-8">{error}</div>
      </div>
    );
  }

  if (!rental) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <a href="/rentals" className="flex items-center text-[#2C3539] hover:text-[#6B7280] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2">
              <path d="m12 19-7-7 7-7"></path>
              <path d="M19 12H5"></path>
            </svg>
            Back to Rentals
          </a>
        </div>
        <div className="text-center py-8 text-gray-500">Rental not found</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <a href="/rentals" className="flex items-center text-[#2C3539] hover:text-[#6B7280] transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2">
            <path d="m12 19-7-7 7-7"></path>
            <path d="M19 12H5"></path>
          </svg>
          Back to Rentals
        </a>
      </div>
      
      <h1 className="text-2xl font-bold text-[#2C3539] mb-6">{rental.propertyName || rental.name}</h1>
      
      <div className="mb-6">
        <TabHeader
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
      
      {renderTabContent()}
    </div>
  );
}
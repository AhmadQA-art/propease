import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { rentalService } from '../services/rental.service';
import { RentalDetails, Property } from '../types/rental';
import TabHeader from '../components/tabs/TabHeader';
import RentalOverview from '../components/rental-details/RentalOverview';
import RentalUnits from '../components/rental-details/RentalUnits';
import RentalApplications from '../components/rental-details/RentalApplications';
import RentalTasks from '../components/rental-details/RentalTasks';
import RentalActivities from '../components/rental-details/RentalActivities';
import { isDevelopmentUser } from '../config/constants';
import AddRentalForm from '../components/AddRentalForm';

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

// Define CustomUnit interface
interface CustomUnit {
  id?: string;
  unit_number: string;
  rent_amount: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  status: 'vacant' | 'occupied' | 'deleted';
  floor_plan: string;
  smart_lock_enabled: boolean;
  property_id?: string;
}

const getAvailableTabs = (userEmail: string | undefined) => {
  const baseTabs = ['Overview', 'Units', 'Rental Applications'];
  const devOnlyTabs = ['Tasks', 'Activities'];
  
  return userEmail && isDevelopmentUser(userEmail)
    ? [...baseTabs, ...devOnlyTabs]
    : baseTabs;
};

interface RentalDetailsPageProps {
  mode?: 'view' | 'edit';
}

export default function RentalDetailsPage({ mode = 'view' }: RentalDetailsPageProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('Overview');
  const [rental, setRental] = useState<RentalDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [propertyManagers, setPropertyManagers] = useState([]);
  const [propertyOwners, setPropertyOwners] = useState([]);
  const dataLoadedRef = useRef(false);

  const availableTabs = getAvailableTabs(userProfile?.email);

  useEffect(() => {
    // Only load data if we haven't loaded it yet or if the ID or organization changed
    if (id && userProfile?.organization_id && !dataLoadedRef.current) {
      console.log(`Loading rental details for ${id}`);
      dataLoadedRef.current = true;
      loadRentalDetails();
      loadPropertyOwnersAndManagers();
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
      const transformedRental: RentalDetails = {
        ...data,
        type: extendedData.property_type || 'residential',
        unit: data.total_units,
        status: (extendedData.status || 'active') as 'active' | 'inactive' | 'pending',
        propertyName: data.name,
        manager: assignedManager,
        monthly_revenue: extendedData.monthly_revenue || 0,
        active_leases: extendedData.active_leases || 0,
        occupancy_rate: extendedData.occupancy_rate || 0
      };
      
      setRental(transformedRental);
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

  const loadPropertyOwnersAndManagers = async () => {
    if (!userProfile?.organization_id) return;
    
    try {
      const owners = await rentalService.getOwners(userProfile.organization_id);
      const managers = await rentalService.getPropertyManagers(userProfile.organization_id);
      
      setPropertyOwners(owners || []);
      setPropertyManagers(managers || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load owners and managers';
      console.error(message);
    }
  };

  const handleEdit = () => {
    navigate(`/rentals/${id}/edit`);
  };

  const handleEditSubmit = async (values: any) => {
    if (!userProfile?.organization_id || !id) return;
    
    try {
      console.log("Form values received:", values);
      
      // Access units from the right structure (values or values.units)
      const units = Array.isArray(values.units) ? values.units : 
                   (values.property && Array.isArray(values.property.units)) ? values.property.units : 
                   [];
                   
      // Get property data from the right structure
      const property = values.property || values;
      
      // Step 1: Calculate the actual total_units based on active units
      const activeUnits = units.filter((unit: CustomUnit) => 
        (unit.status || '').toLowerCase() !== 'deleted'
      );
      
      // Ensure total_units is at least 1 to prevent constraint violation
      const newTotalUnits = Math.max(1, activeUnits.length);
      
      // Step 2: Prepare property update data
      const rentalUpdate = {
        name: property.name,
        address: property.address,
        city: property.city,
        state: property.state,
        zip_code: property.zip_code,
        property_type: property.property_type,
        owner_id: property.owner_id,
        total_units: newTotalUnits, // Set total_units based on active units count (minimum 1)
        organization_id: userProfile.organization_id
      };
      
      console.log("Rental update data:", rentalUpdate);
      
      // Step 3: Categorize units into add, update, and delete operations
      // Get current units for comparison
      const currentUnits = rental?.units || [];
      
      // Create maps for quick lookups
      const currentUnitIdMap = new Map();
      currentUnits.forEach(unit => {
        if (unit.id) currentUnitIdMap.set(unit.id, unit);
      });
      
      // Categorize units by operation type
      const unitsToAdd = units
        .filter((unit: CustomUnit) => !unit.id && (unit.status || '').toLowerCase() !== 'deleted')
        .map((unit: CustomUnit) => ({
          unit_number: unit.unit_number,
          rent_amount: unit.rent_amount,
          bedrooms: unit.bedrooms,
          bathrooms: unit.bathrooms,
          area: unit.area,
          status: (unit.status || 'vacant').toLowerCase() as 'vacant' | 'occupied' | 'deleted',
          floor_plan: unit.floor_plan,
          smart_lock_enabled: unit.smart_lock_enabled,
          organization_id: userProfile.organization_id
        }));
        
      const unitsToUpdate = units
        .filter((unit: CustomUnit) => unit.id && (unit.status || '').toLowerCase() !== 'deleted')
        .map((unit: CustomUnit) => ({
          id: unit.id,
          unit_number: unit.unit_number,
          rent_amount: unit.rent_amount,
          bedrooms: unit.bedrooms,
          bathrooms: unit.bathrooms,
          area: unit.area,
          status: (unit.status || 'vacant').toLowerCase() as 'vacant' | 'occupied' | 'deleted',
          floor_plan: unit.floor_plan,
          smart_lock_enabled: unit.smart_lock_enabled,
          organization_id: userProfile.organization_id
        }));
        
      // Find units to mark as deleted (not in the new values or explicitly marked as deleted)
      // First, get all IDs from the form submission
      const formUnitIds = new Set(
        units
          .filter((unit: CustomUnit) => unit.id)
          .map((unit: CustomUnit) => unit.id)
      );
      
      // Units that exist in the database but not in the form (deleted directly)
      const missingUnitIds = currentUnits
        .filter(unit => !formUnitIds.has(unit.id) && unit.status !== 'deleted')
        .map(unit => unit.id);
        
      // Units that are in the form but marked as deleted
      const markedAsDeletedIds = units
        .filter((unit: CustomUnit) => unit.id && (unit.status || '').toLowerCase() === 'deleted')
        .map((unit: CustomUnit) => unit.id);
        
      // Combine both types of deleted units
      const unitsToMarkAsDeleted = [...new Set([...missingUnitIds, ...markedAsDeletedIds])];
      
      // Step 4: Use the new service method to handle all operations in one call
      const unitsData = {
        add: unitsToAdd,
        update: unitsToUpdate,
        markAsDeleted: unitsToMarkAsDeleted
      };
      
      const updatedRental = await rentalService.updateRentalWithUnits(
        id,
        rentalUpdate,
        unitsData,
        userProfile.organization_id
      );
      
      // Step 5: Update UI with transformed rental data
      const transformedRental: RentalDetails = {
        ...updatedRental,
        type: property.property_type || 'residential',
        unit: newTotalUnits,
        status: 'active',
        propertyName: property.name,
        monthly_revenue: updatedRental.monthly_revenue || 0,
        active_leases: updatedRental.active_leases || 0,
        occupancy_rate: updatedRental.occupancy_rate || 0
      };
      
      setRental(transformedRental);
      navigate(`/rentals/${id}`);
      toast.success('Rental property updated successfully');
      
    } catch (error) {
      console.error('Error updating rental:', error);
      toast.error('Failed to update rental: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleEditCancel = () => {
    navigate(`/rentals/${id}`);
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

    const isDevelopmentAccount = userProfile?.email && isDevelopmentUser(userProfile.email);

    switch (activeTab) {
      case 'Overview':
        return <RentalOverview rental={rental} onEdit={handleEdit} showAddTask={isDevelopmentAccount} />;
      case 'Units':
        return <RentalUnits rentalId={rental.id} />;
      case 'Rental Applications':
        return <RentalApplications rentalId={rental.id} />;
      case 'Tasks':
        return isDevelopmentAccount ? <RentalTasks rentalId={rental.id} /> : null;
      case 'Activities':
        return isDevelopmentAccount ? <RentalActivities rentalId={rental.id} /> : null;
      default:
        return <RentalOverview rental={rental} onEdit={handleEdit} showAddTask={isDevelopmentAccount} />;
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

  if (mode === 'edit') {
    return (
      <AddRentalForm
        initialData={rental}
        mode="edit"
        onSubmit={handleEditSubmit}
        onCancel={handleEditCancel}
        propertyManagers={propertyManagers}
        propertyOwners={propertyOwners}
      />
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
          tabs={availableTabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
      
      {renderTabContent()}
    </div>
  );
}
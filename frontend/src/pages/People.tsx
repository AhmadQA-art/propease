import React, { useState, useRef, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import TabHeader from '../components/tabs/TabHeader';
import PeopleTable, { Column } from '../components/people/PeopleTable';
import TableToolbar from '../components/people/TableToolbar';
import FilterPanel from '../components/people/FilterPanel';
import TeamView from '../components/people/TeamView';
import type { Person, PersonType, TeamMember, Vendor, Tenant, Owner } from '../types/people';
import { mockTeamMembers, mockTasks, mockActivities } from '../data/mockTeamData';
import * as Popover from '@radix-ui/react-popover';
import AddPersonDialog from '../components/people/AddPersonDialog';
import AddTenantDialog from '../components/people/AddTenantDialog';
import AddVendorDialog from '../components/people/AddVendorDialog';
import { peopleApi } from '../services/api/people';
import { useNavigate } from 'react-router-dom';
import * as Tabs from '@radix-ui/react-tabs';
import { useAuth } from '../contexts/AuthContext';
import { isDevelopmentUser } from '../config/constants';
import TenantDetailsDrawer from '../components/people/TenantDetailsDrawer';
import OwnerDetailsDrawer from '../components/people/OwnerDetailsDrawer';
import { apiToUiOwner, UiOwner } from '../services/adapters/ownerAdapter';

const baseTabs = ['All People', 'Team', 'Owners', 'Tenants', 'Vendors'];

const baseColumns = [
  {
    key: 'name',
    label: 'Name',
  },
  {
    key: 'phone',
    label: 'Phone',
  },
  {
    key: 'status',
    label: 'Status',
  },
];

const columnsByType = {
  tenant: [
    {
      key: 'name',
      label: 'Name',
    },
    {
      key: 'phone',
      label: 'Phone',
    },
    { 
      key: 'lease', 
      label: 'Lease',
      render: (row: Person) => {
        if (row.type !== 'tenant') return null;
        
        const tenant = row as Tenant;
        if (!tenant.lease) {
          return (
            <div className="text-sm text-gray-500 italic">No active lease</div>
          );
        }
        
        return (
          <div>
            <div className="text-sm font-medium text-gray-900">
              {tenant.lease.unitName} - {tenant.lease.property}
            </div>
            <div className="text-sm text-gray-500">
              ${tenant.lease.rentAmount?.toLocaleString()} / month
            </div>
          </div>
        );
      }
    },
  ],
  owner: [
    {
      key: 'name',
      label: 'Name',
    },
    {
      key: 'phone',
      label: 'Phone',
    },
    { key: 'status', label: 'Status' },
  ],
  vendor: [
    {
      key: 'name',
      label: 'Name',
    },
    {
      key: 'phone',
      label: 'Phone',
    },
    { key: 'company', label: 'Company' },
    { key: 'service', label: 'Service' },
    { key: 'status', label: 'Status' },
  ],
};

// Helper to get columns based on active tab
const getColumns = (tab: string): Column[] => {
  const baseColumns = [
    { key: 'name', label: 'Name' },
    { key: 'status', label: 'Status' }
  ];

  const columnsMap = {
    'All People': [...baseColumns],
    'Team': [...baseColumns, { key: 'role', label: 'Role' }],
    'Owners': [...baseColumns, { key: 'company', label: 'Company' }],
    'Tenants': [
      { key: 'name', label: 'Name' },
      { key: 'phone', label: 'Phone' },
      {
        key: 'lease', 
        label: 'Lease',
        render: (row: Person) => {
          if (row.type !== 'tenant') return null;
          
          const tenant = row as Tenant;
          if (!tenant.lease) {
            return (
              <div className="text-sm text-gray-500 italic">No active lease</div>
            );
          }
          
          return (
            <div>
              <div className="text-sm font-medium text-gray-900">
                {tenant.lease.unitName} - {tenant.lease.property}
              </div>
              <div className="text-sm text-gray-500">
                ${tenant.lease.rentAmount?.toLocaleString()} / month
              </div>
            </div>
          );
        }
      }
    ],
    'Vendors': [
      ...baseColumns,
      { key: 'serviceType', label: 'Service Type' },
      {
        key: 'performance',
        label: 'Performance',
        render: (row: Person) => {
          if (row.type !== 'vendor') return null;
          
          // Type assertion to handle the performance property
          const vendor = row as Vendor & { performance?: number };
          if (!vendor.performance) return null;
          
          const stars = [];
          for (let i = 0; i < 5; i++) {
            stars.push(
              <svg
                key={i}
                className={`h-4 w-4 ${i < vendor.performance ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            );
          }
          return <div className="flex">{stars}</div>;
        }
      }
    ]
  };

  return columnsMap[tab as keyof typeof columnsMap] || baseColumns;
};

export default function People() {
  const [activeTab, setActiveTab] = useState('Team');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<{
    types: PersonType[];
    status: string[];
    hasLease: string[];
  }>({
    types: [],
    status: [],
    hasLease: [],
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedPersonType, setSelectedPersonType] = useState<PersonType | 'team'>('owner');
  
  // Get current user profile to check if development account
  const { userProfile } = useAuth();
  
  // Filter tabs based on user role
  const tabs = userProfile?.email && isDevelopmentUser(userProfile.email) 
    ? baseTabs 
    : baseTabs.filter(tab => tab !== 'All People');
  
  // Reset to "Team" tab if current tab is "All People" and user is not a development account
  useEffect(() => {
    if (activeTab === 'All People' && userProfile?.email && !isDevelopmentUser(userProfile.email)) {
      setActiveTab('Team');
    }
  }, [activeTab, userProfile]);
  
  // Dropdown state
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isAddPopoverOpen, setIsAddPopoverOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Data state
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Person[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Dialog state
  const [ownerDialogOpen, setOwnerDialogOpen] = useState(false);
  const [tenantDialogOpen, setTenantDialogOpen] = useState(false);
  const [vendorDialogOpen, setVendorDialogOpen] = useState(false);

  // Add state for tenant details drawer
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isTenantDetailsOpen, setIsTenantDetailsOpen] = useState(false);
  
  // Add state for owner details drawer
  const [selectedOwner, setSelectedOwner] = useState<UiOwner | null>(null);
  const [isOwnerDetailsOpen, setIsOwnerDetailsOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  // Fetch data based on active tab
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Check if user is attempting to access the "All People" tab when they shouldn't
      if (activeTab === 'All People' && userProfile?.email && !isDevelopmentUser(userProfile.email)) {
        setActiveTab('Team');
        setLoading(false);
        return;
      }
      
      let result;
      const params = {
        page: currentPage,
        pageSize: pageSize,
        searchQuery: searchQuery || undefined,
        filters: {
          types: filters.types,
          status: filters.status,
          hasLease: filters.hasLease
        }
      };

      switch (activeTab) {
        case 'All People':
          result = await peopleApi.getAllPeople(params);
          setData(result.data || []);
          setTotalPages(result.totalPages || 1);
          break;
        case 'Owners':
          result = await peopleApi.getOwners(params);
          setOwners(result.data || []);
          setData(result.data || []);
          setTotalPages(result.totalPages || 1);
          break;
        case 'Tenants':
          result = await peopleApi.getTenants(params);
          setTenants(result.data || []);
          setData(result.data || []);
          setTotalPages(result.totalPages || 1);
          break;
        case 'Vendors':
          result = await peopleApi.getVendors(params);
          setVendors(result.data || []);
          setData(result.data || []);
          setTotalPages(result.totalPages || 1);
          break;
        case 'Team':
          // Fetch team members from the API instead of using mock data
          result = await peopleApi.getTeamMembers(params);
          setData(result.data || []);
          setTotalPages(result.totalPages || 1);
          break;
        default:
          setData([]);
          setTotalPages(1);
      }
    } catch (err: any) {
      console.error(`Error fetching ${activeTab} data:`, err);
      setError(`Failed to load ${activeTab} data: ${err.message}`);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when tab, page, search, or filters change
  useEffect(() => {
    fetchData();
  }, [activeTab, currentPage, pageSize, searchQuery, filters]);

  // Apply lease filters to tenant data after it's fetched
  const applyLeaseFilter = (people: Person[]) => {
    // Skip filtering if no lease filters are applied
    if (filters.hasLease.length === 0) {
      return people;
    }

    return people.filter(person => {
      // Only apply lease filter to tenants
      if (person.type !== 'tenant') {
        return true;
      }

      const tenant = person as Tenant;
      const hasLease = tenant.lease !== null && tenant.lease !== undefined;

      if (filters.hasLease.includes('has_lease') && hasLease) {
        return true;
      }

      if (filters.hasLease.includes('no_lease') && !hasLease) {
        return true;
      }

      // If we get here, this tenant doesn't match the filter criteria
      return false;
    });
  };

  const handleAction = async (action: string, person: Person) => {
    try {
      switch (action) {
        case 'edit':
          // Handle edit (would open edit dialog)
          console.log('Edit', person);
          break;
        case 'delete':
          await peopleApi.deletePerson(person.id, person.type);
          // Refresh data after deletion
          if (activeTab === 'All People') {
            fetchData();
          } else {
            // Refresh specific tab data
            switch (person.type) {
              case 'owner':
                fetchData();
                break;
              case 'tenant':
                fetchData();
                break;
              case 'vendor':
                fetchData();
                break;
            }
          }
          break;
        case 'activate':
        case 'deactivate':
          const newStatus = action === 'activate' ? 'active' : 'inactive';
          await peopleApi.updatePerson(person.id, person.type, { ...person, status: newStatus });
          // Refresh data after status change (similar to delete)
          fetchData();
          break;
        case 'view':
          // Handle viewing details based on person type
          if (person.type === 'tenant') {
            setSelectedTenant(person as Tenant);
            setIsTenantDetailsOpen(true);
          } else if (person.type === 'owner') {
            setSelectedOwner(apiToUiOwner(person as Owner));
            setIsOwnerDetailsOpen(true);
          }
          break;
        default:
          break;
      }
    } catch (err) {
      console.error(`Error performing ${action}:`, err);
      setError(`Failed to ${action} person. Please try again.`);
    }
  };

  const handleSort = (key: string) => {
    // Handle sorting
    console.log('Sort by', key);
    // Would update sorting state and trigger API call
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    
    try {
      // This is simplified as we'd need to know the type for each ID
      // In a real implementation, we might track selectedItems with their types
      // Or make separate bulk operations based on active tab
      
      // Example for the active tab (assuming all selected items are of the same type):
      let personType: PersonType;
      switch (activeTab) {
        case 'Owners':
          personType = 'owner';
          break;
        case 'Tenants':
          personType = 'tenant';
          break;
        case 'Vendors':
          personType = 'vendor';
          break;
        case 'Team':
          personType = 'team';
          break;
        default:
          // For All People tab, we'd need to track item types with IDs
          console.error('Bulk delete not implemented for All People tab');
          return;
      }
      
      await peopleApi.bulkDelete(selectedIds, personType);
      
      // Refresh data
      fetchData();
    } catch (err) {
      console.error('Error performing bulk delete:', err);
      setError('Failed to delete selected items. Please try again.');
    }
  };

  const handleExport = () => {
    // Handle export
    console.log('Export', selectedIds);
    // In a real implementation, this would generate a CSV/Excel file
  };

  const handleAdd = async (personType?: PersonType) => {
    // If we're on a specific tab, use that tab's person type
    if (!personType) {
      switch (activeTab) {
        case 'Team':
          personType = 'team';
          break;
        case 'Owners':
          personType = 'owner';
          break;
        case 'Tenants':
          personType = 'tenant';
          break;
        case 'Vendors':
          personType = 'vendor';
          break;
        default:
          // For "All People" tab, open the dropdown menu
          return;
      }
    }
    
    setSelectedPersonType(personType);
    setIsAddDialogOpen(true);
  };

  const handleAddPerson = async (personType: PersonType, personData: any) => {
    try {
      switch (personType) {
        case 'owner':
          await peopleApi.createOwner(personData);
          break;
        case 'tenant':
          await peopleApi.createTenant(personData);
          break;
        case 'vendor':
          await peopleApi.createVendor(personData);
          break;
        case 'team':
          // Team member invitation logic (existing)
          break;
      }
      
      // Refresh data after adding
      setIsAddDialogOpen(false);
      
      // Refresh the relevant data
      if (activeTab === 'All People' || activeTab === personType + 's') {
        fetchData();
      }
    } catch (error) {
      console.error(error);
      setError(`Failed to create ${personType}. Please try again.`);
    }
  };

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setShowFilters(false);
    // The useEffect will trigger a data refresh
  };

  const renderContent = () => {
    // Don't render All People tab content for non-development users
    if (activeTab === 'All People' && userProfile?.email && !isDevelopmentUser(userProfile.email)) {
      return null;
    }
    
    if (loading) {
      return <div className="py-6 text-center">Loading...</div>;
    }

    if (error) {
      return (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
          <button 
            onClick={fetchData}
            className="ml-4 px-3 py-1 bg-red-100 rounded-md hover:bg-red-200 text-sm"
          >
            Retry
          </button>
        </div>
      );
    }

    if (activeTab === 'Team') {
      // Use real API data for team members, but keep using mock data for tasks and activities
      // since they match the component's expected structure
      return (
        <TeamView 
          teamMembers={data as TeamMember[]} 
          tasks={mockTasks} 
          activities={mockActivities} 
        />
      );
    } else {
      // All other tabs use the same table structure but with different columns and data
      // The data filtering happens in fetchData() where we update the main data state
      // based on which tab is selected, so we're reusing the same table component
      return (
        <PeopleTable
          data={applyLeaseFilter(data)}
          columns={getColumns(activeTab)}
          onSort={handleSort}
          onAction={handleAction}
          selectedIds={selectedIds}
          onSelect={setSelectedIds}
          loading={loading}
          onRowClick={handleRowClick}
        />
      );
    }
  };

  const renderAddButton = () => {
    // Don't render All People tab button for non-development users
    if (activeTab === 'All People') {
      // This should never happen for non-development users due to our tab filtering,
      // but adding this as an extra safety measure
      if (userProfile?.email && !isDevelopmentUser(userProfile.email)) {
        return null;
      }
      
      return (
        <Popover.Root open={isAddPopoverOpen} onOpenChange={setIsAddPopoverOpen}>
          <Popover.Anchor>
            <button
              className="px-3 py-2 bg-[#2C3539] text-white rounded-lg flex items-center gap-2 hover:bg-[#3d474c] transition-colors"
              aria-label="Add new person"
            >
              <span>Add New</span>
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 16 16" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M8 3.33325V12.6666M3.33334 7.99992H12.6667" 
                  stroke="currentColor" 
                  strokeWidth="1.33333" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </Popover.Anchor>
          
          <Popover.Content 
            className="min-w-[180px] bg-white rounded-lg shadow-lg border border-gray-200 p-1 z-50" 
            side="bottom" 
            align="end" 
            sideOffset={5}
          >
            <div className="py-1">
              <button
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer transition-colors"
                onClick={() => {
                  setIsAddPopoverOpen(false);
                  handleAddOwner();
                }}
              >
                Add Owner
              </button>
            </div>
            <div className="py-1">
              <button
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer transition-colors"
                onClick={() => {
                  setIsAddPopoverOpen(false);
                  handleAddTenant();
                }}
              >
                Add Tenant
              </button>
            </div>
            <div className="py-1">
              <button
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer transition-colors"
                onClick={() => {
                  setIsAddPopoverOpen(false);
                  handleAddVendor();
                }}
              >
                Add Vendor
              </button>
            </div>
          </Popover.Content>
        </Popover.Root>
      );
    } else if (activeTab === 'Owners') {
      return (
        <button
          onClick={handleAddOwner}
          className="px-3 py-2 bg-[#2C3539] text-white rounded-lg flex items-center gap-2 hover:bg-[#3d474c] transition-colors"
        >
          Add Owner
        </button>
      );
    } else if (activeTab === 'Tenants') {
      return (
        <button
          onClick={handleAddTenant}
          className="px-3 py-2 bg-[#2C3539] text-white rounded-lg flex items-center gap-2 hover:bg-[#3d474c] transition-colors"
        >
          Add Tenant
        </button>
      );
    } else if (activeTab === 'Vendors') {
      return (
        <button
          onClick={handleAddVendor}
          className="px-3 py-2 bg-[#2C3539] text-white rounded-lg flex items-center gap-2 hover:bg-[#3d474c] transition-colors"
        >
          Add Vendor
        </button>
      );
    } else if (activeTab === 'Team') {
      return (
        <button
          onClick={() => setIsAddDialogOpen(true)}
          className="px-3 py-2 bg-[#2C3539] text-white rounded-lg flex items-center gap-2 hover:bg-[#3d474c] transition-colors"
        >
          Add Team Member
        </button>
      );
    }
    
    return null;
  };

  const handleAddOwner = () => {
    setOwnerDialogOpen(true);
  };

  const handleOwnerDialogClose = () => {
    setOwnerDialogOpen(false);
    // Refresh data after potentially adding an owner
    if (activeTab === 'Owners' || activeTab === 'All People') {
      fetchData();
    }
  };

  const handleAddTenant = () => {
    setTenantDialogOpen(true);
  };

  const handleAddVendor = () => {
    setVendorDialogOpen(true);
  };

  // Success handlers
  const handleTenantAdded = (newTenant: Tenant) => {
    console.log('New tenant added:', newTenant);
    // Refresh data based on active tab
    if (activeTab === 'Tenants' || activeTab === 'All People') {
      fetchData();
    }
  };

  const handleVendorAdded = (newVendor: Vendor) => {
    console.log('New vendor added:', newVendor);
    // Refresh data based on active tab
    if (activeTab === 'Vendors' || activeTab === 'All People') {
      fetchData();
    }
  };

  // Add handler for row click
  const handleRowClick = (person: Person) => {
    if (person.type === 'tenant') {
      setSelectedTenant(person as Tenant);
      setIsTenantDetailsOpen(true);
    } else if (person.type === 'owner') {
      setSelectedOwner(apiToUiOwner(person as Owner));
      setIsOwnerDetailsOpen(true);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#2C3539]">People</h1>
        <p className="text-[#6B7280] mt-1">Manage team members, owners, tenants, and vendors</p>
      </div>

      <TabHeader
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Hide All People tab content from non-development users */}
      {(activeTab !== 'All People' || (userProfile?.email && isDevelopmentUser(userProfile.email))) && (
        <div className="mt-6 space-y-4">
          {activeTab !== 'Team' && (
            <div className="w-full">
              <TableToolbar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onFilter={activeTab !== 'Team' ? () => setShowFilters(!showFilters) : undefined}
                onAdd={() => handleAdd()}
                selectedIds={selectedIds}
                onBulkDelete={handleBulkDelete}
                onExport={handleExport}
                customAddButton={renderAddButton()}
                tabType={activeTab}
              />

              {activeTab !== 'Team' && (
                <Popover.Root open={showFilters} onOpenChange={setShowFilters}>
                  <Popover.Anchor />
                  <Popover.Portal>
                    <Popover.Content
                      className="z-10"
                      side="bottom"
                      align="end"
                      sideOffset={8}
                    >
                      <FilterPanel
                        filters={filters}
                        onFiltersChange={handleFiltersChange}
                        tabType={activeTab}
                      />
                    </Popover.Content>
                  </Popover.Portal>
                </Popover.Root>
              )}
            </div>
          )}

          {renderContent()}
        </div>
      )}

      {/* Dialog Components */}
      <AddPersonDialog 
        isOpen={isAddDialogOpen && selectedPersonType === 'team'} 
        onClose={() => setIsAddDialogOpen(false)} 
        personType="team"
      />
      <AddPersonDialog
        isOpen={ownerDialogOpen}
        onClose={handleOwnerDialogClose}
        personType="owner"
        skipInvitation={true}
      />
      <AddTenantDialog
        isOpen={tenantDialogOpen}
        onClose={() => setTenantDialogOpen(false)}
        onSuccess={handleTenantAdded}
      />
      <AddVendorDialog
        isOpen={vendorDialogOpen}
        onClose={() => setVendorDialogOpen(false)}
        onSuccess={handleVendorAdded}
      />
      
      {/* Tenant Details Drawer */}
      {selectedTenant && (
        <TenantDetailsDrawer
          tenant={{
            id: selectedTenant.id,
            name: selectedTenant.name,
            email: selectedTenant.email || '',
            phone: selectedTenant.phone || '',
            imageUrl: selectedTenant.imageUrl
          }}
          isOpen={isTenantDetailsOpen}
          onClose={() => setIsTenantDetailsOpen(false)}
        />
      )}
      
      {/* Owner Details Drawer */}
      {selectedOwner && (
        <OwnerDetailsDrawer
          owner={selectedOwner}
          isOpen={isOwnerDetailsOpen}
          onClose={() => setIsOwnerDetailsOpen(false)}
          onUpdate={fetchData}
        />
      )}
    </div>
  );
}
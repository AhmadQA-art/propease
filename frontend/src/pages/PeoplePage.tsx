import React, { useState } from 'react';
import PeopleTable from '../components/people/PeopleTable';
import TableToolbar from '../components/people/TableToolbar';
import TableActions from '../components/people/TableActions';
import FilterPanel from '../components/people/FilterPanel';
import type { Person, PersonType } from '../types/people';
import * as Popover from '@radix-ui/react-popover';

const PeoplePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<{
    types: PersonType[];
    status: string[];
  }>({
    types: [],
    status: [],
  });

  // Mock data - replace with API call
  const mockData: Person[] = [
    {
      id: '1',
      type: 'tenant',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      type: 'owner',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+0987654321',
      status: 'active',
      createdAt: new Date().toISOString(),
    },
    // Add more mock data as needed
  ];

  const columns = [
    {
      key: 'name',
      label: 'Name',
    },
    {
      key: 'type',
      label: 'Type',
      render: (row: Person) => (
        <span className="capitalize">{row.type}</span>
      ),
    },
    {
      key: 'email',
      label: 'Email',
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

  const handleAction = (action: string, person: Person) => {
    switch (action) {
      case 'edit':
        // Handle edit
        console.log('Edit', person);
        break;
      case 'delete':
        // Handle delete
        console.log('Delete', person);
        break;
      case 'activate':
      case 'deactivate':
        // Handle status change
        console.log('Status change', person);
        break;
      default:
        break;
    }
  };

  const handleSort = (key: string) => {
    // Handle sorting
    console.log('Sort by', key);
  };

  const handleBulkDelete = () => {
    // Handle bulk delete
    console.log('Bulk delete', selectedIds);
  };

  const handleExport = () => {
    // Handle export
    console.log('Export', selectedIds);
  };

  const handleAdd = () => {
    // Handle add new person
    console.log('Add new person');
  };

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setShowFilters(false);
  };

  // Filter data based on search query and filters
  const filteredData = mockData.filter((person) => {
    const matchesSearch = 
      searchQuery === '' ||
      person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.phone.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = 
      filters.types.length === 0 ||
      filters.types.includes(person.type);

    const matchesStatus =
      filters.status.length === 0 ||
      filters.status.includes(person.status);

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">People</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage all people associated with your properties
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <TableToolbar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onFilter={() => setShowFilters(!showFilters)}
              onAdd={handleAdd}
              selectedIds={selectedIds}
              onBulkDelete={handleBulkDelete}
              onExport={handleExport}
            />
          </div>

          <Popover.Root open={showFilters} onOpenChange={setShowFilters}>
            <Popover.Anchor className="w-80" />
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
                />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>

        <PeopleTable
          data={filteredData}
          columns={columns}
          onSort={handleSort}
          onSelect={setSelectedIds}
          selectedIds={selectedIds}
          onAction={handleAction}
        />
      </div>
    </div>
  );
};

export default PeoplePage; 
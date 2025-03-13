import React, { useState } from 'react';
import TabHeader from '../components/tabs/TabHeader';
import PeopleList from '../components/people/PeopleList';
import TeamView from '../components/people/TeamView';
import VendorView from '../components/people/VendorView';
import TenantView from '../components/people/TenantView';
import OwnersView from '../components/people/OwnersView';
import { Person, TeamMember, Vendor, Task, Activity, Tenant, Owner } from '../types/people';
import { mockTeamMembers, mockTasks, mockActivities } from '../data/mockTeamData';

const mockOwners: Owner[] = [
  {
    id: '201',
    type: 'owner',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '(555) 123-4567',
    status: 'active',
    createdAt: '2024-01-15',
    company_name: 'Johnson Properties LLC',
    properties: [
      { id: '1', name: 'Sunset Apartments' },
      { id: '2', name: 'Ocean View Complex' }
    ]
  },
  {
    id: '202',
    type: 'owner',
    name: 'David Chen',
    email: 'david.c@email.com',
    phone: '(555) 987-6543',
    status: 'active',
    createdAt: '2024-02-01',
    company_name: 'Chen Real Estate Group',
    properties: [
      { id: '3', name: 'Mountain View Residences' }
    ]
  }
];

const mockPeople: Person[] = [
  ...mockTeamMembers,
  ...mockOwners,
  {
    id: '101',
    type: 'tenant',
    name: 'John Smith',
    email: 'john.s@email.com',
    phone: '(555) 234-5678',
    status: 'active',
    createdAt: '2024-02-01',
    unit: '204',
    property: 'Sunset Apartments',
    leaseStart: '2024-01-01',
    leaseEnd: '2024-12-31',
    rentStatus: 'current'
  },
  {
    id: '102',
    type: 'vendor',
    name: 'Mike Wilson',
    email: 'mike@acmeservices.com',
    phone: '(555) 345-6789',
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'active',
    createdAt: '2024-01-20',
    company: 'Acme Maintenance Services',
    service: 'General Maintenance',
    rating: 4.8,
    lastService: '2024-03-10',
    totalServices: 45
  }
] as Person[];

const tabs = ['All People', 'Team', 'Owners', 'Tenants', 'Vendors'];

export default function People() {
  const [activeTab, setActiveTab] = useState('All People');

  const teamMembers = mockTeamMembers;
  const vendors = mockPeople.filter((person): person is Vendor => person.type === 'vendor');
  const tenants = mockPeople.filter((person): person is Tenant => person.type === 'tenant');
  const owners = mockPeople.filter((person): person is Owner => person.type === 'owner');

  const renderContent = () => {
    switch (activeTab) {
      case 'All People':
        return <PeopleList people={mockPeople} />;
      case 'Team':
        return <TeamView teamMembers={teamMembers} tasks={mockTasks} activities={mockActivities} />;
      case 'Owners':
        return <OwnersView owners={owners} />;
      case 'Tenants':
        return <TenantView tenants={tenants} />;
      case 'Vendors':
        return <VendorView vendors={vendors} />;
      default:
        return null;
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

      <div className="mt-6">
        {renderContent()}
      </div>
    </div>
  );
}
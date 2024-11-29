import React, { useState } from 'react';
import TabHeader from '../components/tabs/TabHeader';
import PeopleList from '../components/people/PeopleList';
import TeamView from '../components/people/TeamView';
import VendorView from '../components/people/VendorView';
import TenantView from '../components/people/TenantView';
import { Person, TeamMember, Vendor, Task, Activity, Tenant } from '../types/people';

const mockPeople: Person[] = [
  {
    id: '1',
    type: 'team',
    name: 'Sarah Johnson',
    email: 'sarah.j@propease.com',
    phone: '(555) 123-4567',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'active',
    createdAt: '2024-01-15',
    role: 'Property Manager',
    department: 'Operations',
    assignedTasks: 5,
    lastActive: '2024-03-15T14:30:00Z'
  },
  {
    id: '2',
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
    id: '3',
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

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Review Lease Renewals',
    description: 'Review and process upcoming lease renewals for Sunset Apartments',
    assignee: mockPeople[0] as TeamMember,
    dueDate: '2024-03-20',
    status: 'in-progress',
    priority: 'high'
  },
  {
    id: '2',
    title: 'Maintenance Inspection',
    description: 'Conduct quarterly maintenance inspection for Building A',
    assignee: mockPeople[0] as TeamMember,
    dueDate: '2024-03-25',
    status: 'pending',
    priority: 'medium'
  }
];

const mockActivities: Activity[] = [
  {
    id: '1',
    user: mockPeople[0] as TeamMember,
    action: 'completed',
    target: 'lease renewal for Unit 204',
    timestamp: '2024-03-15T14:30:00Z'
  },
  {
    id: '2',
    user: mockPeople[0] as TeamMember,
    action: 'assigned',
    target: 'maintenance request to Mike Wilson',
    timestamp: '2024-03-15T11:20:00Z'
  }
];

const tabs = ['All People', 'Team', 'Tenants', 'Vendors'];

export default function People() {
  const [activeTab, setActiveTab] = useState('All People');

  const teamMembers = mockPeople.filter((person): person is TeamMember => person.type === 'team');
  const vendors = mockPeople.filter((person): person is Vendor => person.type === 'vendor');
  const tenants = mockPeople.filter((person): person is Tenant => person.type === 'tenant');

  const renderContent = () => {
    switch (activeTab) {
      case 'All People':
        return <PeopleList people={mockPeople} />;
      case 'Team':
        return <TeamView teamMembers={teamMembers} tasks={mockTasks} activities={mockActivities} />;
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
        <p className="text-[#6B7280] mt-1">Manage team members, tenants, and vendors</p>
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
import React, { useState } from 'react';
import { Search, Filter, Plus, Home, Calendar } from 'lucide-react';
import { Tenant } from '../../types/people';
import AddPersonDialog from './AddPersonDialog';
import TenantDetailsDrawer from './TenantDetailsDrawer';

// Mock data for tenants
const mockTenants = [
  {
    id: 'T1',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '(555) 123-4567',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    property: 'Sunset Apartments',
    unit: '204',
    leaseStart: '2024-01-01',
    leaseEnd: '2024-12-31',
    rentAmount: 1500,
    rentStatus: 'paid',
    status: 'active',
    documents: [
      { name: 'Lease Agreement.pdf', date: '2024-01-01' },
      { name: 'Background Check.pdf', date: '2023-12-15' }
    ],
    paymentHistory: [
      { amount: 1500, date: '2024-03-01', status: 'paid' },
      { amount: 1500, date: '2024-02-01', status: 'paid' },
      { amount: 1500, date: '2024-01-01', status: 'paid' }
    ]
  },
  {
    id: 'T2',
    name: 'Michael Chen',
    email: 'michael.c@example.com',
    phone: '(555) 234-5678',
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    property: 'Harbor View Complex',
    unit: '512',
    leaseStart: '2024-02-01',
    leaseEnd: '2025-01-31',
    rentAmount: 2000,
    rentStatus: 'overdue',
    status: 'active',
    documents: [
      { name: 'Lease Agreement.pdf', date: '2024-02-01' },
      { name: 'Rental Application.pdf', date: '2024-01-15' }
    ],
    paymentHistory: [
      { amount: 2000, date: '2024-03-01', status: 'overdue' },
      { amount: 2000, date: '2024-02-01', status: 'paid' }
    ]
  },
  {
    id: 'T3',
    name: 'Emily Rodriguez',
    email: 'emily.r@example.com',
    phone: '(555) 345-6789',
    imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    property: 'Green Valley Residences',
    unit: '105',
    leaseStart: '2024-03-01',
    leaseEnd: '2025-02-28',
    rentAmount: 1800,
    rentStatus: 'pending',
    status: 'active',
    documents: [
      { name: 'Lease Agreement.pdf', date: '2024-03-01' }
    ],
    paymentHistory: [
      { amount: 1800, date: '2024-03-01', status: 'pending' }
    ]
  }
];

interface TenantViewProps {
  tenants: Tenant[];
  onRefresh?: () => void;
}

export default function TenantView({ tenants, onRefresh }: TenantViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isAddTenantDialogOpen, setIsAddTenantDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<typeof mockTenants[0] | null>(null);
  const [isDetailsDrawerOpen, setIsDetailsDrawerOpen] = useState(false);

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    setIsFilterDropdownOpen(false);
  };

  const handleTenantClick = (tenant: typeof mockTenants[0]) => {
    setSelectedTenant(tenant);
    setIsDetailsDrawerOpen(true);
  };

  const filteredTenants = mockTenants.filter(tenant =>
    tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.property.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex-1 flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tenants..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2C3539] text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              className="h-10 w-10 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-5 h-5 text-[#2C3539]" />
            </button>
            {isFilterDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsFilterDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-20">
                  <button
                    onClick={() => handleTypeSelect('all')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-[#2C3539]"
                  >
                    All Tenants
                  </button>
                  <button
                    onClick={() => handleTypeSelect('active')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-[#2C3539]"
                  >
                    Active Leases
                  </button>
                  <button
                    onClick={() => handleTypeSelect('expiring')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-[#2C3539]"
                  >
                    Expiring Soon
                  </button>
                  <button
                    onClick={() => handleTypeSelect('overdue')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-[#2C3539]"
                  >
                    Payment Overdue
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        <button 
          onClick={() => setIsAddTenantDialogOpen(true)}
          className="flex items-center px-4 py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Tenant
        </button>
      </div>

      <div className="space-y-4">
        {filteredTenants.map((tenant) => (
          <div
            key={tenant.id}
            onClick={() => handleTenantClick(tenant)}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-gray-200 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {tenant.imageUrl ? (
                  <img
                    src={tenant.imageUrl}
                    alt={tenant.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-xl font-medium text-gray-600">
                      {tenant.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="text-[11px] font-normal text-[#2C3539]">{tenant.name}</h3>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center text-[10px] font-normal text-[#6B7280]">
                      <Home className="w-3 h-3 mr-1" />
                      {tenant.property} - Unit {tenant.unit}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="flex items-center text-[10px] font-normal text-[#6B7280] mb-1">
                    <Calendar className="w-3 h-3 mr-1" />
                    Lease ends {new Date(tenant.leaseEnd).toLocaleDateString()}
                  </div>
                  <span className={`text-[10px] font-normal ${
                    tenant.rentStatus === 'overdue' ? 'text-red-600' : 
                    tenant.rentStatus === 'paid' ? 'text-green-600' : 
                    'text-[#6B7280]'
                  }`}>
                    {tenant.rentStatus.charAt(0).toUpperCase() + tenant.rentStatus.slice(1)}
                  </span>
                </div>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-normal ${
                  tenant.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {tenant.status}
                </span>
              </div>
            </div>
          </div>
        ))}

        {filteredTenants.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#6B7280]">No tenants found matching your search criteria</p>
          </div>
        )}
      </div>

      <AddPersonDialog
        isOpen={isAddTenantDialogOpen}
        onClose={() => setIsAddTenantDialogOpen(false)}
        personType="tenant"
      />

      <TenantDetailsDrawer
        tenant={{
          id: selectedTenant?.id || '',
          name: selectedTenant?.name || '',
          email: selectedTenant?.email || '',
          phone: selectedTenant?.phone || '',
          imageUrl: selectedTenant?.imageUrl,
          property: selectedTenant?.property,
          unit: selectedTenant?.unit,
          leaseStart: selectedTenant?.leaseStart,
          leaseEnd: selectedTenant?.leaseEnd,
          rentAmount: selectedTenant?.rentAmount,
          rentStatus: selectedTenant?.rentStatus
        }}
        isOpen={isDetailsDrawerOpen}
        onClose={() => {
          setIsDetailsDrawerOpen(false);
          setSelectedTenant(null);
        }}
        onUpdate={onRefresh}
      />

      {/* Backdrop for drawer */}
      {isDetailsDrawerOpen && (
        <TenantDetailsDrawer
          tenant={{
            id: selectedTenant?.id || '',
            name: selectedTenant?.name || '',
            email: selectedTenant?.email || '',
            phone: selectedTenant?.phone || '',
            imageUrl: selectedTenant?.imageUrl,
            property: selectedTenant?.property,
            unit: selectedTenant?.unit,
            leaseStart: selectedTenant?.leaseStart,
            leaseEnd: selectedTenant?.leaseEnd,
            rentAmount: selectedTenant?.rentAmount,
            rentStatus: selectedTenant?.rentStatus
          }}
          isOpen={isDetailsDrawerOpen}
          onClose={() => {
            setIsDetailsDrawerOpen(false);
            setSelectedTenant(null);
          }}
          onUpdate={onRefresh}
        />
      )}
    </div>
  );
}
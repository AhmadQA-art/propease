import React, { useState } from 'react';
import { Search, Filter, Plus, DollarSign, Bell, CreditCard, Calendar, Building2, User } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import LeaseDetailsDrawer from '../components/LeaseDetailsDrawer';

interface Lease {
  id: string;
  propertyName: string;
  unit: string;
  resident: {
    name: string;
    imageUrl: string | null;
  };
  startDate: string;
  endDate: string;
  rentAmount: number;
  securityDeposit: number;
  balance: number;
  status: 'active' | 'pending' | 'past';
  lastPaymentDate: string;
  nextPaymentDate: string;
}

const leases: Lease[] = [
  {
    id: 'L001',
    propertyName: 'Sunset Apartments',
    unit: '204',
    resident: {
      name: 'Sarah Johnson',
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    rentAmount: 2000,
    securityDeposit: 2000,
    balance: 0,
    status: 'active',
    lastPaymentDate: '2024-03-01',
    nextPaymentDate: '2024-04-01'
  },
  {
    id: 'L002',
    propertyName: 'Harbor View Complex',
    unit: '512',
    resident: {
      name: 'Michael Chen',
      imageUrl: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    startDate: '2024-04-01',
    endDate: '2025-03-31',
    rentAmount: 2500,
    securityDeposit: 2500,
    balance: 2500,
    status: 'pending',
    lastPaymentDate: '',
    nextPaymentDate: '2024-04-01'
  },
  {
    id: 'L003',
    propertyName: 'Green Valley Homes',
    unit: '105',
    resident: {
      name: 'Emily Rodriguez',
      imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    rentAmount: 1800,
    securityDeposit: 1800,
    balance: 150,
    status: 'past',
    lastPaymentDate: '2023-12-01',
    nextPaymentDate: ''
  }
];

const getStatusColor = (status: Lease['status']) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'past':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getBalanceColor = (balance: number) => {
  if (balance === 0) return 'text-green-600';
  return 'text-red-600';
};

export default function Leases() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLease, setSelectedLease] = useState<Lease | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const filteredLeases = leases.filter(lease =>
    lease.propertyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lease.resident.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lease.unit.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateLease = () => {
    navigate('/leases/add');
  };

  const handleEditLease = (leaseId: string) => {
    navigate(`/leases/edit/${leaseId}`);
  };

  const handleDeleteLease = (leaseId: string) => {
    // Add delete confirmation logic here
    console.log('Delete lease:', leaseId);
    setIsDrawerOpen(false);
  };

  const handleRowClick = (lease: Lease) => {
    setSelectedLease(lease);
    setIsDrawerOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-[#2C3539]">Leases</h1>
        <p className="text-[#6B7280] mt-1">Manage your property leases</p>
      </div>

      {/* Search and Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search leases..."
            className="w-full pl-10 pr-4 h-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <button className="h-10 w-10 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <Filter className="w-5 h-5 text-[#2C3539]" />
        </button>

        <button 
          onClick={handleCreateLease}
          className="h-10 flex items-center px-4 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Lease
        </button>
      </div>

      {/* Leases Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-4 text-left text-sm font-medium text-[#6B7280]">
                  Property
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-[#6B7280]">
                  Resident
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-[#6B7280]">
                  Lease Term
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-[#6B7280]">
                  Rent
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-[#6B7280]">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-[#6B7280]">
                  Balance
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-[#6B7280]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLeases.map((lease) => (
                <tr
                  key={lease.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleRowClick(lease)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Building2 className="w-5 h-5 text-[#6B7280] mr-3" />
                      <div>
                        <div className="text-sm font-medium text-[#2C3539]">{lease.propertyName}</div>
                        <div className="text-xs text-[#6B7280]">Unit {lease.unit}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      {lease.resident.imageUrl ? (
                        <img
                          src={lease.resident.imageUrl}
                          alt={lease.resident.name}
                          className="w-8 h-8 rounded-full mr-3 object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full mr-3 bg-gray-200 flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-500" />
                        </div>
                      )}
                      <span className="text-sm text-[#2C3539]">{lease.resident.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-[#6B7280] mr-2" />
                      <span className="text-sm text-[#2C3539]">
                        {format(new Date(lease.startDate), 'MMM d, yyyy')} -{' '}
                        {format(new Date(lease.endDate), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-[#2C3539]">${lease.rentAmount.toLocaleString()}</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lease.status)}`}>
                      {lease.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className={`text-sm font-medium ${getBalanceColor(lease.balance)}`}>
                      ${lease.balance.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // handlePostCharge(lease.id);
                        }}
                        className="p-2 text-[#6B7280] hover:bg-gray-100 rounded-lg transition-colors"
                        title="Post Charge"
                      >
                        <DollarSign className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // handleReceivePayment(lease.id);
                        }}
                        className="p-2 text-[#6B7280] hover:bg-gray-100 rounded-lg transition-colors"
                        title="Receive Payment"
                      >
                        <CreditCard className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // handleNotifyResident(lease.id);
                        }}
                        className="p-2 text-[#6B7280] hover:bg-gray-100 rounded-lg transition-colors"
                        title="Notify Resident"
                      >
                        <Bell className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredLeases.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[#6B7280]">No leases found</p>
        </div>
      )}

      {/* Lease Details Drawer */}
      <LeaseDetailsDrawer
        lease={selectedLease}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onEdit={handleEditLease}
        onDelete={handleDeleteLease}
      />
    </div>
  );
}
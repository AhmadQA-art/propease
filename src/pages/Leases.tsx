import React, { useState } from 'react';
import { Search, Filter, Plus, DollarSign, Bell, CreditCard, Calendar, Building2, User } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Lease['status']>('all');
  const navigate = useNavigate();

  const filteredLeases = leases.filter(lease => {
    const matchesSearch = 
      lease.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lease.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lease.resident.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || lease.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handlePostCharge = (leaseId: string) => {
    // Implement post charge functionality
    console.log('Post charge for lease:', leaseId);
  };

  const handleReceivePayment = (leaseId: string) => {
    // Implement receive payment functionality
    console.log('Receive payment for lease:', leaseId);
  };

  const handleNotifyResident = (leaseId: string) => {
    // Implement notify resident functionality
    console.log('Notify resident for lease:', leaseId);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#2C3539]">Leases</h1>
          <p className="text-[#6B7280] mt-1">Manage and track lease agreements</p>
        </div>
        <button 
          onClick={() => navigate('/leases/add')} 
          className="flex items-center px-4 py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Lease
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-4 flex-1">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search leases..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              className="pl-10 pr-8 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent appearance-none bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | Lease['status'])}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="past">Past</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leases List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-4 text-left text-sm font-medium text-[#6B7280]">Property & Unit</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-[#6B7280]">Resident</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-[#6B7280]">Start Date</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-[#6B7280]">End Date</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-[#6B7280]">Rent</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-[#6B7280]">Deposit</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-[#6B7280]">Balance</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-[#6B7280]">Status</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-[#6B7280]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLeases.map((lease) => (
                <tr key={lease.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Building2 className="w-5 h-5 text-[#6B7280] mr-3" />
                      <div>
                        <div className="text-sm font-medium text-[#2C3539]">{lease.propertyName}</div>
                        <div className="text-xs text-[#6B7280]">Unit {lease.unit}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
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
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-[#6B7280] mr-2" />
                      <span className="text-sm text-[#2C3539]">
                        {format(new Date(lease.startDate), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-[#6B7280] mr-2" />
                      <span className="text-sm text-[#2C3539]">
                        {format(new Date(lease.endDate), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                  <div className="text-sm text-[#2C3539]">${lease.rentAmount.toLocaleString()}</div>

                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-[#2C3539]">${lease.securityDeposit.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`text-sm font-medium ${getBalanceColor(lease.balance)}`}>
                      ${lease.balance.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lease.status)}`}>
                      {lease.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handlePostCharge(lease.id)}
                        className="p-2 text-[#6B7280] hover:bg-gray-100 rounded-lg transition-colors"
                        title="Post Charge"
                      >
                        <DollarSign className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleReceivePayment(lease.id)}
                        className="p-2 text-[#6B7280] hover:bg-gray-100 rounded-lg transition-colors"
                        title="Receive Payment"
                      >
                        <CreditCard className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleNotifyResident(lease.id)}
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
    </div>
  );
}
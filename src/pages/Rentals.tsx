import React, { useState } from 'react';
import { Search, Filter, Calendar, User, Home, Clock } from 'lucide-react';
import { format, addMonths } from 'date-fns';

interface Rental {
  id: string;
  propertyName: string;
  unit: string;
  status: 'active' | 'pending' | 'expired';
  resident: {
    name: string;
    imageUrl: string;
  };
  startDate: Date;
  duration: number; // in months
  nextPaymentDate: Date;
}

const rentals: Rental[] = [
  {
    id: 'R001',
    propertyName: 'Sunset Apartments',
    unit: '204',
    status: 'active',
    resident: {
      name: 'Sarah Johnson',
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    startDate: new Date(2023, 6, 1),
    duration: 12,
    nextPaymentDate: new Date(2024, 3, 1)
  },
  {
    id: 'R002',
    propertyName: 'Harbor View Complex',
    unit: '512',
    status: 'pending',
    resident: {
      name: 'Michael Chen',
      imageUrl: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    startDate: new Date(2024, 3, 1),
    duration: 6,
    nextPaymentDate: new Date(2024, 4, 1)
  },
  {
    id: 'R003',
    propertyName: 'Green Valley Homes',
    unit: '105',
    status: 'expired',
    resident: {
      name: 'Emily Rodriguez',
      imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    startDate: new Date(2023, 1, 1),
    duration: 12,
    nextPaymentDate: new Date(2024, 2, 1)
  }
];

const getStatusColor = (status: Rental['status']) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'expired':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function Rentals() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Rental['status']>('all');

  const filteredRentals = rentals.filter(rental => {
    const matchesSearch = 
      rental.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rental.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rental.resident.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || rental.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#2C3539]">Rentals</h1>
        <p className="text-[#6B7280] mt-1">Manage and track all rental agreements</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search rentals..."
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
            onChange={(e) => setStatusFilter(e.target.value as 'all' | Rental['status'])}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Rentals List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-4 text-left text-sm font-medium text-[#6B7280]">Property</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-[#6B7280]">Resident</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-[#6B7280]">Duration</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-[#6B7280]">Next Payment</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-[#6B7280]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRentals.map((rental) => {
                const endDate = addMonths(rental.startDate, rental.duration);
                
                return (
                  <tr key={rental.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Home className="w-5 h-5 text-[#6B7280] mr-3" />
                        <div>
                          <div className="text-sm font-medium text-[#2C3539]">{rental.propertyName}</div>
                          <div className="text-xs text-[#6B7280]">Unit {rental.unit}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          src={rental.resident.imageUrl}
                          alt={rental.resident.name}
                          className="w-8 h-8 rounded-full mr-3"
                        />
                        <span className="text-sm text-[#2C3539]">{rental.resident.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-[#6B7280] mr-2" />
                        <div>
                          <div className="text-sm text-[#2C3539]">{rental.duration} months</div>
                          <div className="text-xs text-[#6B7280]">
                            {format(rental.startDate, 'MMM d, yyyy')} - {format(endDate, 'MMM d, yyyy')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-[#6B7280] mr-2" />
                        <span className="text-sm text-[#2C3539]">
                          {format(rental.nextPaymentDate, 'MMM d, yyyy')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(rental.status)}`}>
                        {rental.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
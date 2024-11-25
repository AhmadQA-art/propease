import React, { useState } from 'react';
import { Search, Filter, Calendar, User, Home, Clock, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { RentalDetails } from '../types/rental';

interface RentalsProps {
  rentals: RentalDetails[];
}

const getStatusColor = (status: RentalDetails['status']) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'expired':
      return 'bg-red-100 text-red-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const rentals: RentalDetails[] = [
  {
    id: 'R001',
    propertyId: 'P001',
    propertyName: 'Sunset Apartments',
    unit: '204',
    type: 'residential',
    status: 'active',
    resident: {
      name: 'Sarah Johnson',
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    startDate: '2023-07-01',
    endDate: '2024-06-30',
    rentAmount: 2000,
    paymentFrequency: 'monthly',
    owner: 'John Smith',
    manager: 'Mike Wilson'
  },
  {
    id: 'R002',
    propertyId: 'P002',
    propertyName: 'Harbor View Complex',
    unit: '512',
    type: 'commercial',
    status: 'pending',
    resident: {
      name: 'Michael Chen',
      imageUrl: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    startDate: '2024-04-01',
    endDate: '2024-09-30',
    rentAmount: 3500,
    paymentFrequency: 'monthly',
    owner: 'Alice Brown',
    manager: 'Mike Wilson'
  },
  {
    id: 'R003',
    propertyId: 'P003',
    propertyName: 'Green Valley Homes',
    unit: '105',
    type: 'residential',
    status: 'expired',
    resident: {
      name: 'Emily Rodriguez',
      imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    startDate: '2023-02-01',
    endDate: '2024-01-31',
    rentAmount: 1800,
    paymentFrequency: 'monthly',
    owner: 'David Lee',
    manager: 'Sarah Parker'
  }
];

export default function Rentals({ rentals }: RentalsProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | RentalDetails['status']>('all');

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#2C3539]">Rentals</h1>
          <p className="text-[#6B7280] mt-1">Manage and track all rental agreements</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-4 flex-1">
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
              onChange={(e) => setStatusFilter(e.target.value as 'all' | RentalDetails['status'])}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
        <button
          onClick={() => navigate('/rentals/add')}
          className="flex items-center px-4 py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Rental
        </button>
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
                const nextPaymentDate = new Date();
                nextPaymentDate.setDate(1);
                nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
                
                return (
                  <tr
                    key={rental.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/rentals/${rental.id}`)}
                  >
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
                        {rental.resident.imageUrl ? (
                          <img
                            src={rental.resident.imageUrl}
                            alt={rental.resident.name}
                            className="w-8 h-8 rounded-full mr-3 object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full mr-3 bg-gray-200 flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-500" />
                          </div>
                        )}
                        <span className="text-sm text-[#2C3539]">{rental.resident.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-[#6B7280] mr-2" />
                        <div>
                          <div className="text-sm text-[#2C3539]">
                            {format(new Date(rental.startDate), 'MMM d, yyyy')} - {format(new Date(rental.endDate), 'MMM d, yyyy')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-[#6B7280] mr-2" />
                        <span className="text-sm text-[#2C3539]">
                          {format(nextPaymentDate, 'MMM d, yyyy')}
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

      {/* Empty State */}
      {filteredRentals.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[#6B7280]">No rentals found</p>
        </div>
      )}
    </div>
  );
}
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
      <div>
        <h1 className="text-2xl font-bold text-[#2C3539]">Rentals</h1>
        <p className="text-[#6B7280] mt-1">Manage and track all rental agreements</p>
      </div>

      {/* Search and Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search rentals..."
            className="w-full pl-10 pr-4 h-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <button className="h-10 w-10 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-5 h-5 text-[#2C3539]" />
          </button>

          <button 
            onClick={() => navigate('/rentals/add')}
            className="h-10 flex items-center px-4 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Rental
          </button>
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
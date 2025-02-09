import React, { useState } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RentalDetails } from '../types/rental';
import RentalCard from '../components/RentalCard';

interface RentalsProps {
  rentals: RentalDetails[];
}

export default function Rentals({ rentals }: RentalsProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRentals = rentals.filter(rental => {
    const matchesSearch = 
      rental.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rental.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rental.resident.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
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

      <div>
        {/* List Header */}
        <div className="mb-2">
          <div className="flex items-center p-2">
            <div className="flex-1 text-sm font-medium text-[#6B7280]">Property</div>
            <div className="flex items-center px-4 min-w-[200px] text-sm font-medium text-[#6B7280]">Type</div>
            <div className="flex items-center px-4 min-w-[150px] justify-end text-sm font-medium text-[#6B7280]">Active Units</div>
            <div className="w-10"></div>
          </div>
        </div>

        {/* Rentals List */}
        <div className="space-y-4">
          {filteredRentals.map((rental) => (
            <div key={rental.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all">
              <RentalCard
                rental={rental}
                onClick={() => navigate(`/rentals/${rental.id}`)}
              />
            </div>
          ))}
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
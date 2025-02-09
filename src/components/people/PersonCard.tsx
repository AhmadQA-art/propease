import React from 'react';
import { Mail, Phone, Building2, Calendar, DollarSign, Star, Activity, Briefcase, User } from 'lucide-react';
import { Person } from '../../types/people';
import { format } from 'date-fns';

interface PersonCardProps {
  person: Person;
}

export default function PersonCard({ person }: PersonCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderPersonSpecificInfo = () => {
    switch (person.type) {
      case 'team':
        return (
          <>
            <div className="flex items-center text-sm text-[#6B7280]">
              <Briefcase className="w-4 h-4 mr-2" />
              {person.role} - {person.department}
            </div>
            <div className="flex items-center text-sm text-[#6B7280]">
              <Activity className="w-4 h-4 mr-2" />
              {person.assignedTasks} Active Tasks
            </div>
          </>
        );
      case 'tenant':
        return (
          <>
            <div className="flex items-center text-sm text-[#6B7280]">
              <Building2 className="w-4 h-4 mr-2" />
              {person.property} - Unit {person.unit}
            </div>
            <div className="flex items-center text-sm text-[#6B7280]">
              <Calendar className="w-4 h-4 mr-2" />
              Lease: {format(new Date(person.leaseStart || ''), 'MMM d, yyyy')} -{' '}
              {format(new Date(person.leaseEnd || ''), 'MMM d, yyyy')}
            </div>
            <div className="flex items-center text-sm text-[#6B7280]">
              <DollarSign className="w-4 h-4 mr-2" />
              Rent Status:{' '}
              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(person.rentStatus)}`}>
                {person.rentStatus}
              </span>
            </div>
          </>
        );
      case 'vendor':
        return (
          <>
            <div className="flex items-center text-sm text-[#6B7280]">
              <Building2 className="w-4 h-4 mr-2" />
              {person.company} - {person.service}
            </div>
            <div className="flex items-center text-sm text-[#6B7280]">
              <Star className="w-4 h-4 mr-2" />
              Rating: {person.rating}/5
            </div>
            <div className="flex items-center text-sm text-[#6B7280]">
              <Activity className="w-4 h-4 mr-2" />
              {person.totalServices} Total Services
            </div>
          </>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          {person.imageUrl ? (
            <img
              src={person.imageUrl}
              alt={person.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-6 h-6 text-gray-500" />
            </div>
          )}
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-[#2C3539]">{person.name}</h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(person.status)}`}>
              {person.status}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center text-sm text-[#6B7280]">
          <Mail className="w-4 h-4 mr-2" />
          {person.email}
        </div>
        <div className="flex items-center text-sm text-[#6B7280]">
          <Phone className="w-4 h-4 mr-2" />
          {person.phone}
        </div>
        {renderPersonSpecificInfo()}
      </div>
    </div>
  );
}
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Download, User } from 'lucide-react';
import { format } from 'date-fns';
import { RentalDetails } from '../types/rental';

interface RentalDetailsPageProps {
  rental?: RentalDetails;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function RentalDetailsPage({ rental, onEdit, onDelete }: RentalDetailsPageProps) {
  const navigate = useNavigate();

  if (!rental) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Rental not found</p>
      </div>
    );
  }

  const handleEdit = () => {
    navigate(`/rentals/${rental.id}/edit`);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this rental? This action cannot be undone.')) {
      onDelete(rental.id);
      navigate('/rentals');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/rentals')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#2C3539]" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#2C3539]">Rental Details</h1>
            <p className="text-[#6B7280] mt-1">View and manage rental information</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleEdit}
            className="flex items-center px-4 py-2 text-[#2C3539] bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center px-4 py-2 text-red-600 bg-white border border-gray-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Property Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-[#2C3539] mb-4">Property Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-[#6B7280]">Property Name</p>
                <p className="text-[#2C3539] font-medium mt-1">{rental.propertyName}</p>
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Unit Number</p>
                <p className="text-[#2C3539] font-medium mt-1">{rental.unit}</p>
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Type</p>
                <p className="text-[#2C3539] font-medium mt-1 capitalize">{rental.type}</p>
              </div>
            </div>
          </div>

          {/* Rental Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-[#2C3539] mb-4">Rental Details</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-[#6B7280]">Duration</p>
                <p className="text-[#2C3539] font-medium mt-1">
                  {format(new Date(rental.startDate), 'MMM d, yyyy')} - {format(new Date(rental.endDate), 'MMM d, yyyy')}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Rent Amount</p>
                <p className="text-[#2C3539] font-medium mt-1">
                  ${rental.rentAmount.toLocaleString()} / {rental.paymentFrequency}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1
                  ${rental.status === 'active' ? 'bg-green-100 text-green-800' : 
                    rental.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'}`}>
                  {rental.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Stakeholder Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-[#2C3539] mb-4">Stakeholder Details</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                {rental.resident.imageUrl ? (
                  <img
                    src={rental.resident.imageUrl}
                    alt={rental.resident.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                )}
                <div className="ml-3">
                  <p className="text-sm text-[#6B7280]">Resident</p>
                  <p className="text-[#2C3539] font-medium">{rental.resident.name}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Owner</p>
                <p className="text-[#2C3539] font-medium mt-1">{rental.owner}</p>
              </div>
              <div>
                <p className="text-sm text-[#6B7280]">Property Manager</p>
                <p className="text-[#2C3539] font-medium mt-1">{rental.manager}</p>
              </div>
            </div>
          </div>

          {/* Rental Agreement */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-[#2C3539] mb-4">Rental Agreement</h2>
            {rental.agreementFile ? (
              <button className="flex items-center text-[#2C3539] hover:text-[#3d474c]">
                <Download className="w-4 h-4 mr-2" />
                Download Agreement
              </button>
            ) : (
              <p className="text-[#6B7280] text-sm">No agreement file uploaded</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { X, DoorOpen, BadgeDollarSign, Calendar, User, Wrench } from 'lucide-react';

interface UnitDetailsDrawerProps {
  unit: {
    id: string;
    number: string;
    status: 'occupied' | 'vacant';
    maintenance: boolean;
    rentAmount: number;
    startDate?: string;
    endDate?: string;
    resident?: {
      name: string;
    };
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function UnitDetailsDrawer({ unit, isOpen, onClose }: UnitDetailsDrawerProps) {
  if (!isOpen || !unit) return null;

  const leaseDuration = unit.startDate && unit.endDate
    ? Math.round((new Date(unit.endDate).getTime() - new Date(unit.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30))
    : null;

  return (
    <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-lg z-50">
      {/* Header - Fixed */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 border-b bg-white z-10">
        <h2 className="text-lg font-semibold text-[#2C3539]">Unit Details</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-[#2C3539]" />
        </button>
      </div>

      {/* Content - Scrollable */}
      <div className="h-full overflow-y-auto pt-[73px] pb-4">
        <div className="p-6 space-y-6">
          {/* Unit Name */}
          <div className="space-y-2">
            <label className="text-sm text-[#6B7280]">Unit Name</label>
            <div className="flex items-center space-x-2">
              <DoorOpen className="w-5 h-5 text-[#2C3539]" />
              <span className="text-[#2C3539] font-medium">Unit {unit.number}</span>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm text-[#6B7280]">Status</label>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-sm rounded-full capitalize
                ${unit.status === 'occupied' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'}`}
              >
                {unit.status}
              </span>
              {unit.maintenance && (
                <span className="flex items-center space-x-1 text-amber-600">
                  <Wrench className="w-4 h-4" />
                  <span className="text-sm">Maintenance Required</span>
                </span>
              )}
            </div>
          </div>

          {/* Rent Amount */}
          {unit.status === 'occupied' && (
            <div className="space-y-2">
              <label className="text-sm text-[#6B7280]">Rent Amount</label>
              <div className="flex items-center space-x-2">
                <BadgeDollarSign className="w-5 h-5 text-[#2C3539]" />
                <span className="text-[#2C3539]">${unit.rentAmount.toLocaleString()}/month</span>
              </div>
            </div>
          )}

          {/* Resident */}
          {unit.resident && (
            <div className="space-y-2">
              <label className="text-sm text-[#6B7280]">Resident</label>
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-[#2C3539]" />
                <span className="text-[#2C3539]">{unit.resident.name}</span>
              </div>
            </div>
          )}

          {/* Lease Details */}
          {unit.status === 'occupied' && unit.startDate && unit.endDate && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-[#6B7280]">Lease Duration</label>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-[#2C3539]" />
                  <span className="text-[#2C3539]">{leaseDuration} months</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-[#6B7280]">Lease End Date</label>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-[#2C3539]" />
                  <span className="text-[#2C3539]">{new Date(unit.endDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

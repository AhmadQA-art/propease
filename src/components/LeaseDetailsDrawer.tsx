import React from 'react';
import { X, Edit2, Trash2, User, Building2, Calendar, DollarSign, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface LeaseDetailsDrawerProps {
  lease: {
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
    documentStatus: 'signed' | 'pending' | 'not_signed';
    signedDate: string | null;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (leaseId: string) => void;
  onDelete: (leaseId: string) => void;
}

export default function LeaseDetailsDrawer({
  lease,
  isOpen,
  onClose,
  onEdit,
  onDelete
}: LeaseDetailsDrawerProps) {
  if (!lease) return null;

  return (
    <div
      className={`fixed inset-y-0 right-0 w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Fixed Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-6 border-b bg-white z-10">
        <h2 className="text-xl font-semibold text-[#2C3539]">Lease Details</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="h-full overflow-y-auto pt-[88px] pb-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
        <div className="p-6 space-y-6">
          {/* Property Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Building2 className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-[#2C3539]">{lease.propertyName}</p>
                <p className="text-sm text-gray-500">Unit {lease.unit}</p>
              </div>
            </div>
          </div>

          {/* Resident Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                {lease.resident.imageUrl ? (
                  <img
                    src={lease.resident.imageUrl}
                    alt={lease.resident.name}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <User className="w-5 h-5 text-gray-500" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-[#2C3539]">{lease.resident.name}</p>
                <p className="text-sm text-gray-500">Resident</p>
              </div>
            </div>
          </div>

          {/* Lease Terms */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[#2C3539]">Lease Terms</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Start Date</p>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <p className="text-sm text-[#2C3539]">
                    {format(new Date(lease.startDate), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">End Date</p>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <p className="text-sm text-[#2C3539]">
                    {format(new Date(lease.endDate), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Document Status */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[#2C3539]">Document Status</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-[#2C3539]">Lease Agreement</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  lease.documentStatus === 'signed' 
                    ? 'bg-green-100 text-green-800'
                    : lease.documentStatus === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {lease.documentStatus === 'signed' ? 'Signed' : 
                   lease.documentStatus === 'pending' ? 'Pending Signature' : 'Not Signed'}
                </span>
              </div>
              {lease.documentStatus === 'signed' && lease.signedDate && (
                <p className="text-xs text-gray-500">
                  Signed on {format(new Date(lease.signedDate), 'MMM d, yyyy')}
                </p>
              )}
            </div>
          </div>

          {/* Financial Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[#2C3539]">Financial Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Monthly Rent</p>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <p className="text-sm text-[#2C3539]">
                    ${lease.rentAmount.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Security Deposit</p>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <p className="text-sm text-[#2C3539]">
                    ${lease.securityDeposit.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[#2C3539]">Payment Status</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Last Payment</p>
                <p className="text-sm text-[#2C3539]">
                  {format(new Date(lease.lastPaymentDate), 'MMM d, yyyy')}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Next Payment</p>
                <p className="text-sm text-[#2C3539]">
                  {format(new Date(lease.nextPaymentDate), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Current Balance</p>
              <p className={`text-sm font-medium ${
                lease.balance > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                ${Math.abs(lease.balance).toLocaleString()}
                {lease.balance > 0 ? ' due' : ' paid'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="absolute bottom-0 left-0 right-0 p-6 border-t bg-white">
        <div className="flex space-x-4">
          <button
            onClick={() => onEdit(lease.id)}
            className="flex-1 flex items-center justify-center px-4 py-2 text-sm bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Lease
          </button>
          <button
            onClick={() => onDelete(lease.id)}
            className="flex items-center justify-center px-4 py-2 text-sm border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

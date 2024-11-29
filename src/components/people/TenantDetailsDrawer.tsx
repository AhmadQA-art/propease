import React from 'react';
import { X, Mail, Phone, Home, Calendar, CreditCard, FileText, User } from 'lucide-react';
import { format } from 'date-fns';

interface TenantDetailsDrawerProps {
  tenant: {
    id: string;
    name: string;
    email: string;
    phone: string;
    imageUrl?: string;
    property: string;
    unit: string;
    leaseStart?: string;
    leaseEnd?: string;
    rentAmount?: number;
    rentStatus: string;
    documents?: { name: string; date: string }[];
    paymentHistory?: { amount: number; date: string; status: string }[];
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TenantDetailsDrawer({ tenant, isOpen, onClose }: TenantDetailsDrawerProps) {
  if (!isOpen || !tenant) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-xl font-semibold text-[#2C3539]">Tenant Details</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="overflow-y-auto h-[calc(100vh-76px)]">
        <div className="p-6 space-y-6">
          {/* Tenant Info */}
          <div className="flex items-center space-x-4">
            {tenant.imageUrl ? (
              <img
                src={tenant.imageUrl}
                alt={tenant.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-8 h-8 text-gray-500" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-[#2C3539]">{tenant.name}</h3>
              <div className="space-y-1 mt-1">
                <div className="flex items-center text-sm text-[#6B7280]">
                  <Mail className="w-4 h-4 mr-2" />
                  {tenant.email}
                </div>
                <div className="flex items-center text-sm text-[#6B7280]">
                  <Phone className="w-4 h-4 mr-2" />
                  {tenant.phone}
                </div>
              </div>
            </div>
          </div>

          {/* Property Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-[#6B7280]">Property Information</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Home className="w-4 h-4 text-[#6B7280]" />
                <span className="text-sm font-medium text-[#2C3539]">{tenant.property}</span>
              </div>
              <p className="text-sm text-[#6B7280]">Unit {tenant.unit}</p>
            </div>
          </div>

          {/* Lease Details */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-[#6B7280]">Lease Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-1">
                  <Calendar className="w-4 h-4 text-[#6B7280]" />
                  <span className="text-sm text-[#6B7280]">Start Date</span>
                </div>
                <p className="text-sm font-medium text-[#2C3539]">
                  {tenant.leaseStart ? format(new Date(tenant.leaseStart), 'MMM d, yyyy') : 'N/A'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-1">
                  <Calendar className="w-4 h-4 text-[#6B7280]" />
                  <span className="text-sm text-[#6B7280]">End Date</span>
                </div>
                <p className="text-sm font-medium text-[#2C3539]">
                  {tenant.leaseEnd ? format(new Date(tenant.leaseEnd), 'MMM d, yyyy') : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Payment History */}
          {tenant.paymentHistory && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-[#6B7280]">Recent Payments</h4>
              <div className="space-y-2">
                {tenant.paymentHistory.map((payment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-[#2C3539]">{format(new Date(payment.date), 'MMM d, yyyy')}</p>
                      <p className="text-sm text-[#6B7280]">{payment.amount.toLocaleString()} rent payment</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      payment.status === 'paid' ? 'bg-green-100 text-green-800' : 
                      payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {payment.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          {tenant.documents && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-[#6B7280]">Documents</h4>
              <div className="space-y-2">
                {tenant.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-[#6B7280]" />
                      <div>
                        <p className="text-sm font-medium text-[#2C3539]">{doc.name}</p>
                        <p className="text-xs text-[#6B7280]">{format(new Date(doc.date), 'MMM d, yyyy')}</p>
                      </div>
                    </div>
                    <button className="text-sm text-[#2C3539] hover:text-[#3d474c]">View</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
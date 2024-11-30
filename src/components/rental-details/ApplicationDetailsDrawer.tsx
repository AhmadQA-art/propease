import React from 'react';
import { X, User, Calendar, DollarSign, FileText, Phone, Mail, CreditCard, Check, X as XIcon } from 'lucide-react';
import { format } from 'date-fns';

interface ApplicationDetailsDrawerProps {
  application: {
    id: string;
    applicant: {
      name: string;
      email: string;
      phone: string;
      imageUrl?: string;
    };
    submitDate: string;
    desiredMoveIn: string;
    status: 'pending' | 'approved' | 'rejected';
    creditScore: number;
    income: number;
    documents: string[];
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate?: (applicationId: string, newStatus: 'approved' | 'rejected') => void;
}

export default function ApplicationDetailsDrawer({ application, isOpen, onClose, onStatusUpdate }: ApplicationDetailsDrawerProps) {
  if (!isOpen || !application) return null;

  const isPending = application.status === 'pending';

  const handleStatusUpdate = (newStatus: 'approved' | 'rejected') => {
    onStatusUpdate?.(application.id, newStatus);
    onClose();
  };

  return (
    <div className="fixed right-0 top-0 h-screen w-[32rem] bg-white shadow-lg z-50">
      {/* Header - Fixed */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 border-b bg-white z-10">
        <h2 className="text-lg font-semibold text-[#2C3539]">Application Details</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-[#2C3539]" />
        </button>
      </div>

      {/* Content - Scrollable */}
      <div className="h-full overflow-y-auto pt-[73px] pb-[88px] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
        <div className="p-6 space-y-6">
          {/* Applicant Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[#6B7280]">Applicant Information</h3>
            <div className="flex items-center">
              {application.applicant.imageUrl ? (
                <img
                  src={application.applicant.imageUrl}
                  alt={application.applicant.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-500" />
                </div>
              )}
              <div className="ml-4">
                <h4 className="text-lg font-semibold text-[#2C3539]">{application.applicant.name}</h4>
                <div className="mt-1 space-y-1">
                  <div className="flex items-center text-sm text-[#6B7280]">
                    <Mail className="w-4 h-4 mr-2" />
                    {application.applicant.email}
                  </div>
                  <div className="flex items-center text-sm text-[#6B7280]">
                    <Phone className="w-4 h-4 mr-2" />
                    {application.applicant.phone}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Application Status */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-[#6B7280]">Application Status</h3>
            <span className={`inline-block px-3 py-1 text-sm rounded-full capitalize
              ${application.status === 'approved' 
                ? 'bg-green-100 text-green-800' 
                : application.status === 'rejected'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'}`}
            >
              {application.status}
            </span>
          </div>

          {/* Dates */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[#6B7280]">Important Dates</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center text-sm text-[#6B7280] mb-1">
                  <Calendar className="w-4 h-4 mr-2" />
                  Submit Date
                </div>
                <p className="text-[#2C3539] font-medium">
                  {format(new Date(application.submitDate), 'MMM d, yyyy')}
                </p>
              </div>
              <div>
                <div className="flex items-center text-sm text-[#6B7280] mb-1">
                  <Calendar className="w-4 h-4 mr-2" />
                  Desired Move-in
                </div>
                <p className="text-[#2C3539] font-medium">
                  {format(new Date(application.desiredMoveIn), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[#6B7280]">Financial Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center text-sm text-[#6B7280] mb-1">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Credit Score
                </div>
                <p className="text-[#2C3539] font-medium">{application.creditScore}</p>
              </div>
              <div>
                <div className="flex items-center text-sm text-[#6B7280] mb-1">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Annual Income
                </div>
                <p className="text-[#2C3539] font-medium">
                  ${application.income.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[#6B7280]">Documents</h3>
            <div className="space-y-2">
              {application.documents.map((doc, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 text-[#6B7280] mr-2" />
                    <span className="text-sm text-[#2C3539]">{doc}</span>
                  </div>
                  <button className="text-sm text-[#2C3539] hover:text-[#3d474c]">
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Actions */}
      {isPending && onStatusUpdate && (
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t">
          <div className="flex gap-4">
            <button
              onClick={() => handleStatusUpdate('approved')}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Check className="w-4 h-4 mr-2" />
              Approve Application
            </button>
            <button
              onClick={() => handleStatusUpdate('rejected')}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <XIcon className="w-4 h-4 mr-2" />
              Reject Application
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

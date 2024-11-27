import React from 'react';
import { User, Calendar, DollarSign, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface RentalApplication {
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
}

const mockApplications: RentalApplication[] = [
  {
    id: 'APP001',
    applicant: {
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      phone: '(555) 123-4567',
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80'
    },
    submitDate: '2024-03-15',
    desiredMoveIn: '2024-04-01',
    status: 'pending',
    creditScore: 720,
    income: 75000,
    documents: ['background_check.pdf', 'employment_verification.pdf']
  },
  {
    id: 'APP002',
    applicant: {
      name: 'Michael Chen',
      email: 'michael.c@example.com',
      phone: '(555) 234-5678'
    },
    submitDate: '2024-03-14',
    desiredMoveIn: '2024-04-15',
    status: 'approved',
    creditScore: 750,
    income: 85000,
    documents: ['background_check.pdf', 'employment_verification.pdf', 'reference_letter.pdf']
  }
];

const getStatusColor = (status: RentalApplication['status']) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function RentalApplications() {
  return (
    <div className="space-y-6">
      {mockApplications.map((application) => (
        <div key={application.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center">
              {application.applicant.imageUrl ? (
                <img
                  src={application.applicant.imageUrl}
                  alt={application.applicant.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-500" />
                </div>
              )}
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-[#2C3539]">{application.applicant.name}</h3>
                <p className="text-sm text-[#6B7280]">{application.applicant.email}</p>
              </div>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
              {application.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <div>
              <div className="flex items-center text-sm text-[#6B7280] mb-1">
                <DollarSign className="w-4 h-4 mr-2" />
                Annual Income
              </div>
              <p className="text-[#2C3539] font-medium">
                ${application.income.toLocaleString()}
              </p>
            </div>
            <div>
              <div className="flex items-center text-sm text-[#6B7280] mb-1">
                <FileText className="w-4 h-4 mr-2" />
                Documents
              </div>
              <p className="text-[#2C3539] font-medium">
                {application.documents.length} files
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
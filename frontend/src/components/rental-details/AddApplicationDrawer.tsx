import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AddApplicationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (applicationData: any) => void;
}

export default function AddApplicationDrawer({ isOpen, onClose, onSubmit }: AddApplicationDrawerProps) {
  const [formData, setFormData] = useState({
    applicant: {
      name: '',
      email: '',
      phone: '',
    },
    desiredMoveIn: '',
    income: '',
    documents: [] as File[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-screen w-[32rem] bg-white shadow-lg z-50">
      {/* Header - Fixed */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 border-b bg-white z-10">
        <h2 className="text-lg font-semibold text-[#2C3539]">New Application</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-[#2C3539]" />
        </button>
      </div>

      {/* Content - Scrollable */}
      <div className="h-full overflow-y-auto pt-[73px] pb-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Applicant Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[#6B7280]">Applicant Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#6B7280] mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.applicant.name}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    applicant: { ...prev.applicant, name: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-[#6B7280] mb-1">Email</label>
                <input
                  type="email"
                  value={formData.applicant.email}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    applicant: { ...prev.applicant, email: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-[#6B7280] mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.applicant.phone}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    applicant: { ...prev.applicant, phone: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Move-in Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[#6B7280]">Move-in Details</h3>
            <div>
              <label className="block text-sm text-[#6B7280] mb-1">Desired Move-in Date</label>
              <input
                type="date"
                value={formData.desiredMoveIn}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  desiredMoveIn: e.target.value
                }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[#6B7280]">Financial Information</h3>
            <div>
              <label className="block text-sm text-[#6B7280] mb-1">Annual Income</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]">$</span>
                <input
                  type="number"
                  value={formData.income}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    income: e.target.value
                  }))}
                  className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[#6B7280]">Required Documents</h3>
            <div>
              <label className="block text-sm text-[#6B7280] mb-1">Upload Documents</label>
              <input
                type="file"
                multiple
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  documents: Array.from(e.target.files || [])
                }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent"
                accept=".pdf,.doc,.docx"
              />
              <p className="mt-1 text-xs text-[#6B7280]">
                Accepted formats: PDF, DOC, DOCX
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full px-4 py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors"
            >
              Submit Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

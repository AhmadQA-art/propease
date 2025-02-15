import React, { useState } from 'react';
import { FileText, Download, Eye, Plus, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';

interface Document {
  id: string;
  title: string;
  type: 'lease' | 'addendum' | 'notice';
  resident: string;
  property: string;
  unit: string;
  dateCreated: Date;
  dateExpires: Date | null;
  status: 'active' | 'expired' | 'pending';
  fileSize: string;
}

const documents: Document[] = [
  {
    id: 'DOC-001',
    title: 'Lease Agreement',
    type: 'lease',
    resident: 'John Smith',
    property: 'Sunset Apartments',
    unit: 'Unit 204',
    dateCreated: new Date(2024, 0, 15),
    dateExpires: new Date(2025, 0, 14),
    status: 'active',
    fileSize: '2.4 MB'
  },
  {
    id: 'DOC-002',
    title: 'Lease Renewal',
    type: 'lease',
    resident: 'Sarah Johnson',
    property: 'Harbor View Complex',
    unit: 'Unit 512',
    dateCreated: new Date(2024, 1, 1),
    dateExpires: new Date(2025, 1, 1),
    status: 'pending',
    fileSize: '2.1 MB'
  },
  {
    id: 'DOC-003',
    title: 'Parking Addendum',
    type: 'addendum',
    resident: 'Michael Chen',
    property: 'Sunset Apartments',
    unit: 'Unit 308',
    dateCreated: new Date(2024, 2, 1),
    dateExpires: null,
    status: 'active',
    fileSize: '1.1 MB'
  },
  {
    id: 'DOC-004',
    title: 'Lease Agreement',
    type: 'lease',
    resident: 'Emily Rodriguez',
    property: 'Green Valley Homes',
    unit: 'Unit 105',
    dateCreated: new Date(2023, 11, 15),
    dateExpires: new Date(2024, 11, 14),
    status: 'active',
    fileSize: '2.3 MB'
  }
];

const getStatusColor = (status: Document['status']) => {
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

const getTypeIcon = (type: Document['type']) => {
  return FileText;
};

export default function Documents() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.resident.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.property.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || doc.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#2C3539]">Documents</h1>
          <p className="text-[#6B7280] mt-1">Manage lease documents and agreements</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          New Document
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search documents..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            className="pl-10 pr-8 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent appearance-none bg-white"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="lease">Lease</option>
            <option value="addendum">Addendum</option>
            <option value="notice">Notice</option>
          </select>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-4 text-left text-sm font-medium text-[#6B7280]">Document</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-[#6B7280]">Resident</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-[#6B7280]">Property</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-[#6B7280]">Created</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-[#6B7280]">Expires</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-[#6B7280]">Status</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-[#6B7280]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDocuments.map((doc) => {
                const TypeIcon = getTypeIcon(doc.type);
                return (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <TypeIcon className="w-5 h-5 text-[#6B7280] mr-3" />
                        <div>
                          <div className="text-sm font-medium text-[#2C3539]">{doc.title}</div>
                          <div className="text-xs text-[#6B7280]">{doc.fileSize}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-[#2C3539]">{doc.resident}</div>
                      <div className="text-xs text-[#6B7280]">{doc.unit}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-[#2C3539]">{doc.property}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-[#2C3539]">
                        {format(doc.dateCreated, 'MMM d, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-[#2C3539]">
                        {doc.dateExpires ? format(doc.dateExpires, 'MMM d, yyyy') : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 text-[#6B7280] hover:bg-gray-100 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-[#6B7280] hover:bg-gray-100 rounded-lg transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
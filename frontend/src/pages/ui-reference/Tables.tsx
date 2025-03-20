import React from 'react';
import { ArrowLeft, MoreVertical, User, Briefcase, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TablesReference() {
  // Mock data for the table
  const mockData = [
    {
      id: '1',
      name: 'John Smith',
      company: 'Smith Properties LLC',
      email: 'john.smith@example.com',
      phone: '+1 (555) 123-4567',
      properties: 5,
      status: 'active',
      imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    {
      id: '2',
      name: 'Sarah Wilson',
      company: 'Wilson Investments',
      email: 'sarah.wilson@example.com',
      phone: '+1 (555) 234-5678',
      properties: 3,
      status: 'inactive',
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4">
        <Link 
          to="/ui-reference" 
          className="flex items-center text-[#2C3539] hover:text-[#6B7280] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to UI Reference
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-[#2C3539]">Table Components</h1>
        <p className="text-[#6B7280] mt-1">Data tables and list views</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-[#2C3539]">Table Components</h2>
        <div className="p-6 border border-gray-200 rounded-xl space-y-6">
          <h3 className="text-sm font-medium text-[#2C3539] mb-3">Data Table Example (Owners)</h3>
          
          {/* Table Component */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Properties
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockData.map((person) => (
                  <tr key={person.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img 
                            className="h-10 w-10 rounded-full" 
                            src={person.imageUrl} 
                            alt="" 
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{person.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">{person.company}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-900">
                          <Mail className="h-4 w-4 text-gray-400 mr-2" />
                          {person.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-900">
                          <Phone className="h-4 w-4 text-gray-400 mr-2" />
                          {person.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{person.properties} properties</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(person.status)}`}>
                        {person.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Component Documentation */}
          <div className="mt-6 space-y-4">
            <h4 className="text-sm font-medium text-[#2C3539]">Table Component Features:</h4>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
              <li>Consistent header styling with uppercase text and gray background</li>
              <li>Row hover states for better interactivity</li>
              <li>Avatar/initials display with consistent sizing</li>
              <li>Status badges with contextual colors (active: green, inactive: gray)</li>
              <li>Responsive table with proper spacing and alignment</li>
              <li>Action buttons with hover states</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
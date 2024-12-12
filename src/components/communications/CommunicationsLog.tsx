import React, { useState } from 'react';
import { Search, Filter, Mail, MessageSquare, Bell } from 'lucide-react';
import { format } from 'date-fns';

interface Communication {
  id: string;
  type: 'email' | 'sms' | 'in-app';
  subject: string;
  recipient: {
    name: string;
    email?: string;
    phone?: string;
  };
  status: 'sent' | 'failed' | 'pending';
  timestamp: Date;
  content: string;
}

const mockCommunications: Communication[] = [
  {
    id: 'C1',
    type: 'email',
    subject: 'Maintenance Notice',
    recipient: {
      name: 'John Smith',
      email: 'john@example.com'
    },
    status: 'sent',
    timestamp: new Date(2024, 2, 15, 14, 30),
    content: 'Scheduled maintenance work will be carried out...'
  },
  {
    id: 'C2',
    type: 'sms',
    subject: 'Rent Payment Reminder',
    recipient: {
      name: 'Sarah Johnson',
      phone: '+1 (555) 123-4567'
    },
    status: 'sent',
    timestamp: new Date(2024, 2, 15, 13, 15),
    content: 'This is a friendly reminder that your rent payment...'
  },
  {
    id: 'C3',
    type: 'in-app',
    subject: 'Community Event',
    recipient: {
      name: 'Michael Chen'
    },
    status: 'pending',
    timestamp: new Date(2024, 2, 15, 12, 0),
    content: 'You are invited to join our community event...'
  }
];

const getTypeIcon = (type: Communication['type']) => {
  switch (type) {
    case 'email':
      return Mail;
    case 'sms':
      return MessageSquare;
    case 'in-app':
      return Bell;
  }
};

const getStatusColor = (status: Communication['status']) => {
  switch (status) {
    case 'sent':
      return 'bg-green-100 text-green-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function CommunicationsLog() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCommunications = mockCommunications.filter(communication =>
    communication.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    communication.recipient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    communication.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search communications..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="h-10 w-10 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <Filter className="w-5 h-5 text-[#2C3539]" />
        </button>
      </div>

      {/* Communications List */}
      <div className="space-y-4">
        {filteredCommunications.map((communication) => {
          const TypeIcon = getTypeIcon(communication.type);
          return (
            <div
              key={communication.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:border-gray-200 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <TypeIcon className="w-5 h-5 text-[#2C3539]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#2C3539]">{communication.subject}</h3>
                    <p className="text-sm text-[#6B7280] mt-1">{communication.content}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(communication.status)}`}>
                  {communication.status}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm text-[#6B7280]">
                <div className="space-x-4">
                  <span>To: {communication.recipient.name}</span>
                  {communication.recipient.email && <span>({communication.recipient.email})</span>}
                  {communication.recipient.phone && <span>({communication.recipient.phone})</span>}
                </div>
                <span>{format(communication.timestamp, 'MMM d, yyyy h:mm a')}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { Search, Plus, Calendar, Building2, User, Bell } from 'lucide-react';
import CreateAnnouncementDialog from './CreateAnnouncementDialog';
import AnnouncementDrawer from './AnnouncementDrawer';
import { format } from 'date-fns';

interface Announcement {
  id: string;
  title: string;
  content: string;
  audience: {
    properties: string[];
    tenants: string[];
  };
  method: ('email' | 'sms' | 'in-app')[];
  createdAt: Date;
  status: 'scheduled' | 'sent' | 'draft';
  author: {
    name: string;
    imageUrl?: string;
  };
}

const mockAnnouncements: Announcement[] = [
  {
    id: 'A1',
    title: 'Building Maintenance Notice',
    content: 'Scheduled maintenance work will be carried out in the lobby area...',
    audience: {
      properties: ['Sunset Apartments'],
      tenants: ['All Tenants']
    },
    method: ['email', 'in-app'],
    createdAt: new Date(2024, 2, 15),
    status: 'sent',
    author: {
      name: 'Sarah Johnson',
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    }
  },
  {
    id: 'A2',
    title: 'Community Event Update',
    content: 'Join us for the upcoming community gathering...',
    audience: {
      properties: ['Harbor View Complex'],
      tenants: ['Selected Tenants']
    },
    method: ['email', 'sms', 'in-app'],
    createdAt: new Date(2024, 2, 14),
    status: 'scheduled',
    author: {
      name: 'Michael Chen',
      imageUrl: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    }
  }
];

const getStatusColor = (status: Announcement['status']) => {
  switch (status) {
    case 'sent':
      return 'bg-green-100 text-green-800';
    case 'scheduled':
      return 'bg-blue-100 text-blue-800';
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function Announcements() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  const handleCreateAnnouncement = (data: any) => {
    console.log('Create announcement:', data);
    setIsCreateDialogOpen(false);
  };

  const filteredAnnouncements = mockAnnouncements.filter(announcement =>
    announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    announcement.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search announcements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center space-x-2 bg-[#2C3539] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Create Announcement</span>
        </button>
      </div>

      {/* Announcements List */}
      <div className="mt-8 flex-1 overflow-y-auto space-y-4">
        {filteredAnnouncements.map((announcement) => (
          <div
            key={announcement.id}
            onClick={() => setSelectedAnnouncement(announcement)}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-[#2C3539]">{announcement.title}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(announcement.status)}`}>
                    {announcement.status}
                  </span>
                </div>
                <p className="text-[#6B7280]">{announcement.content}</p>
              </div>
              <div className="flex items-center gap-2">
                {announcement.author.imageUrl ? (
                  <img
                    src={announcement.author.imageUrl}
                    alt={announcement.author.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-500" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-[#6B7280]">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span>{announcement.audience.properties.join(', ')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  <span>{announcement.method.join(', ')}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{format(announcement.createdAt, 'MMM d, yyyy')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <CreateAnnouncementDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateAnnouncement}
      />

      <AnnouncementDrawer
        announcement={selectedAnnouncement!}
        isOpen={!!selectedAnnouncement}
        onClose={() => setSelectedAnnouncement(null)}
      />
    </div>
  );
}
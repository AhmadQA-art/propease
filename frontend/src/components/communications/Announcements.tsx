import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Calendar, Building2, User, Bell, Filter, Tool, DollarSign } from 'lucide-react';
import CreateAnnouncementDialog from './CreateAnnouncementDialog';
import AnnouncementDrawer from './AnnouncementDrawer';
import { format, parseISO } from 'date-fns';
import { supabase } from '../../config/supabase';

interface AnnouncementTarget {
  target_type: string;
  target_name: string;
  property_id?: string;
}

interface AnnouncementSchedule {
  start_date: string;
  time_of_day?: string;
  repeat_frequency?: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  audience: {
    properties: string[];
    tenants: string[];
  };
  method: ('email' | 'sms' | 'whatsapp')[];
  type: string;
  createdAt: Date;
  status: 'scheduled' | 'sent' | 'draft';
  author: {
    name: string;
    imageUrl?: string;
  };
  scheduledDate?: string;
  scheduledTime?: string;
  // Raw database fields for internal use
  _raw?: {
    targets: AnnouncementTarget[];
    schedule?: AnnouncementSchedule;
  };
}

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

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'maintenance notice':
      return <Tool className="w-4 h-4 text-orange-500" />;
    case 'rent payment reminder':
      return <DollarSign className="w-4 h-4 text-blue-500" />;
    case 'community event':
      return <Calendar className="w-4 h-4 text-green-500" />;
    default:
      return <Bell className="w-4 h-4 text-gray-500" />;
  }
};

export default function Announcements() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  
  // Refs for filter dropdown
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);
  
  // Add click outside handler for filter dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (isFilterDropdownOpen &&
          filterDropdownRef.current &&
          filterButtonRef.current &&
          !filterDropdownRef.current.contains(event.target as Node) &&
          !filterButtonRef.current.contains(event.target as Node)) {
        setIsFilterDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterDropdownOpen]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch announcements with their targets and schedules
      const { data, error } = await supabase
        .from('announcements')
        .select(`
          id,
          title,
          content,
          status,
          communication_method,
          is_scheduled,
          issue_date,
          created_at,
          author_id,
          type,
          announcement_targets (
            id,
            target_type,
            target_name,
            property_id
          ),
          announcement_schedules (
            id,
            start_date,
            time_of_day,
            repeat_frequency
          ),
          user_profiles (
            id,
            first_name,
            last_name,
            profile_image_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match the Announcement interface
      const formattedAnnouncements: Announcement[] = data.map(item => {
        // Group targets by type
        const targets = item.announcement_targets || [];
        const properties: string[] = [];
        const tenants: string[] = [];

        targets.forEach((target: AnnouncementTarget) => {
          if (target.target_type === 'property') {
            properties.push(target.target_name);
          } else if (target.target_type === 'tenant') {
            tenants.push(target.target_name);
          }
        });

        // Get schedule info if available
        const schedule = item.announcement_schedules && item.announcement_schedules.length > 0
          ? item.announcement_schedules[0]
          : null;

        // Format the author information
        const authorProfile = item.user_profiles || {};
        const authorName = [authorProfile.first_name, authorProfile.last_name]
          .filter(Boolean)
          .join(' ') || 'Unknown User';

        return {
          id: item.id,
          title: item.title,
          content: item.content,
          audience: {
            properties,
            tenants
          },
          method: (item.communication_method || []) as ('email' | 'sms' | 'whatsapp')[],
          type: item.type || 'maintenance notice',
          createdAt: new Date(item.created_at),
          status: item.status as Announcement['status'],
          author: {
            name: authorName,
            imageUrl: authorProfile.profile_image_url
          },
          scheduledDate: schedule?.start_date ? format(parseISO(schedule.start_date), 'yyyy-MM-dd') : undefined,
          scheduledTime: schedule?.time_of_day,
          _raw: {
            targets,
            schedule: schedule || undefined
          }
        };
      });

      setAnnouncements(formattedAnnouncements);
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError('Failed to load announcements. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = (data: any) => {
    console.log('Create announcement:', data);
    setIsCreateDialogOpen(false);
    // Refresh the list after creating a new announcement
    fetchAnnouncements();
  };

  const filteredAnnouncements = announcements.filter(announcement =>
    announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    announcement.content.toLowerCase().includes(searchQuery.toLowerCase())
  ).filter(announcement => {
    if (statusFilter && typeFilter) return announcement.status === statusFilter && announcement.type === typeFilter;
    if (statusFilter) return announcement.status === statusFilter;
    if (typeFilter) return announcement.type === typeFilter;
    return true;
  });

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
        <div className="flex items-center gap-3 flex-shrink-0 relative">
          <button
            ref={filterButtonRef}
            onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
            className="h-10 w-10 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-5 h-5 text-[#2C3539]" />
          </button>
          <button
            onClick={() => setIsCreateDialogOpen(true)}
            className="flex items-center space-x-2 bg-[#2C3539] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Create Announcement</span>
          </button>
          
          {isFilterDropdownOpen && (
            <div
              ref={filterDropdownRef}
              className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-10 p-4"
            >
              <h3 className="font-medium text-[#2C3539] mb-2">Filter Announcements</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-1">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent"
                  >
                    <option value="">All Statuses</option>
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="sent">Sent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-1">Type</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] focus:border-transparent"
                  >
                    <option value="">All Types</option>
                    <option value="maintenance notice">Maintenance Notice</option>
                    <option value="rent payment reminder">Rent Payment Reminder</option>
                    <option value="community event">Community Event</option>
                  </select>
                </div>
                <div className="pt-2 flex justify-end">
                  <button 
                    onClick={() => setIsFilterDropdownOpen(false)}
                    className="px-4 py-2 bg-[#2C3539] text-white rounded-lg text-sm"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="flex-1 flex items-center justify-center mt-8">
          <div className="inline-block w-6 h-6 border-2 border-gray-200 border-t-[#2C3539] rounded-full animate-spin mr-2"></div>
          <p className="text-[#6B7280]">Loading announcements...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && announcements.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center mt-8 text-center">
          <Bell className="w-12 h-12 text-gray-300 mb-2" />
          <h3 className="text-lg font-medium text-[#2C3539]">No announcements yet</h3>
          <p className="text-[#6B7280] mb-4">Create your first announcement to get started</p>
          <button
            onClick={() => setIsCreateDialogOpen(true)}
            className="flex items-center space-x-2 bg-[#2C3539] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Create Announcement</span>
          </button>
        </div>
      )}

      {/* Announcements List */}
      {!loading && filteredAnnouncements.length > 0 && (
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
                  <p className="text-[#6B7280] line-clamp-2">{announcement.content}</p>
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
                  {announcement.audience.properties.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      <span>{announcement.audience.properties.length === 1 
                        ? announcement.audience.properties[0] 
                        : `${announcement.audience.properties.length} properties`}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    {getTypeIcon(announcement.type)}
                    <span>{announcement.type}</span>
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
      )}

      <CreateAnnouncementDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateAnnouncement}
      />

      {selectedAnnouncement && (
        <AnnouncementDrawer
          announcement={selectedAnnouncement}
          isOpen={!!selectedAnnouncement}
          onClose={() => setSelectedAnnouncement(null)}
        />
      )}
    </div>
  );
}
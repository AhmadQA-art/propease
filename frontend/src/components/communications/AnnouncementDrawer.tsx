import React from 'react';
import { X, Building2, User, Bell, Mail, MessageCircle, Smartphone, Calendar, Tool, DollarSign } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  audience: {
    properties: string[];
    tenants: string[];
  };
  method: ('email' | 'sms' | 'whatsapp')[];
  createdAt: Date;
  status: 'scheduled' | 'sent' | 'draft';
  author: {
    name: string;
    imageUrl?: string;
  };
  scheduledDate?: string;
  scheduledTime?: string;
  type: string;
}

interface AnnouncementDrawerProps {
  announcement: Announcement;
  isOpen: boolean;
  onClose: () => void;
}

const getStatusColor = (status: Announcement['status']) => {
  switch (status) {
    case 'scheduled':
      return 'bg-yellow-100 text-yellow-800';
    case 'sent':
      return 'bg-green-100 text-green-800';
    case 'draft':
      return 'bg-gray-100 text-gray-800';
  }
};

const getMethodIcon = (method: 'email' | 'sms' | 'whatsapp') => {
  switch (method) {
    case 'email':
      return <Mail className="w-4 h-4 text-blue-500" />;
    case 'sms':
      return <Smartphone className="w-4 h-4 text-green-500" />;
    case 'whatsapp':
      return <MessageCircle className="w-4 h-4 text-green-500" />;
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

export default function AnnouncementDrawer({ 
  announcement, 
  isOpen, 
  onClose 
}: AnnouncementDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-[500px] bg-white shadow-xl overflow-y-auto">
      <div className="p-6 border-b flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#2C3539]">
          Announcement Details
        </h2>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Announcement Header */}
        <div>
          <h3 className="text-lg font-semibold text-[#2C3539] mb-2 flex items-center gap-2">
            {getTypeIcon(announcement.type)}
            {announcement.title}
          </h3>
          <div className="mb-2">
            <span className="text-sm font-medium text-[#6B7280]">
              Status
            </span>
          </div>
          <div className="flex items-center space-x-2 mb-4">
            <span 
              className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${getStatusColor(announcement.status)}`}
            >
              {announcement.status.toLowerCase()}
            </span>
          </div>
        </div>

        {/* Announcement Content */}
        <div>
          <h4 className="text-sm font-medium text-[#6B7280] mb-2">
            Message
          </h4>
          <p className="text-[#2C3539]">
            {announcement.content}
          </p>
        </div>

        {/* Author */}
        <div>
          <h4 className="text-sm font-medium text-[#6B7280] mb-2">
            Author
          </h4>
          <div className="flex items-center space-x-3">
            {announcement.author.imageUrl ? (
              <img 
                src={announcement.author.imageUrl} 
                alt={announcement.author.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-5 h-5 text-gray-500" />
              </div>
            )}
            <span className="text-sm text-[#2C3539]">
              {announcement.author.name}
            </span>
          </div>
        </div>

        {/* Issue Date */}
        <div>
          <h4 className="text-sm font-medium text-[#6B7280] mb-2">
            Issue Date
          </h4>
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-[#2C3539]">
              {announcement.createdAt.toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Properties */}
        {announcement.audience.properties.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-[#6B7280] mb-2">
              Properties
            </h4>
            <div className="flex flex-wrap gap-2">
              {announcement.audience.properties.map((property) => (
                <span 
                  key={property}
                  className="bg-gray-100 text-[#2C3539] text-xs px-2 py-1 rounded-full"
                >
                  {property}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Contacts */}
        {announcement.audience.tenants.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-[#6B7280] mb-2">
              Contacts
            </h4>
            <div className="flex flex-wrap gap-2">
              {announcement.audience.tenants.map((tenant) => (
                <span 
                  key={tenant}
                  className="bg-gray-100 text-[#2C3539] text-xs px-2 py-1 rounded-full"
                >
                  {tenant}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Communication Methods */}
        {announcement.method.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-[#6B7280] mb-2">
              Communication Methods
            </h4>
            <div className="flex space-x-2">
              {announcement.method.map((method) => (
                <div 
                  key={method} 
                  className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-full"
                >
                  {getMethodIcon(method)}
                  <span className="text-xs text-[#2C3539] capitalize">
                    {method}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scheduled Date and Time */}
        {announcement.scheduledDate && announcement.scheduledTime && (
          <div>
            <h4 className="text-sm font-medium text-[#6B7280] mb-2">
              Scheduled Date and Time
            </h4>
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-[#2C3539]">
                {announcement.scheduledDate} at {announcement.scheduledTime}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Search, Plus, Building2, Send, AlertCircle } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface CreateAnnouncementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

interface Property {
  id: string;
  name: string;
  activeLeases?: number;
}

export default function CreateAnnouncementDialog({
  isOpen,
  onClose,
  onSubmit
}: CreateAnnouncementDialogProps) {
  const { userProfile } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    properties: [] as string[],
    methods: [] as string[],
    isScheduled: false,
    scheduledDate: '',
    scheduledTime: '',
    type: 'maintenance notice' // Default type
  });
  const [showPropertySearch, setShowPropertySearch] = useState(false);
  const [propertySearchQuery, setPropertySearchQuery] = useState('');
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState(false);

  // Fetch properties when dialog is opened
  useEffect(() => {
    if (isOpen) {
      fetchProperties();
      // Reset state when dialog opens
      setError(null);
      setSendSuccess(false);
    }
  }, [isOpen]);

  const fetchProperties = async () => {
    if (!userProfile?.organization_id) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select('id, name')
        .eq('organization_id', userProfile.organization_id);
      
      if (error) throw error;
      
      setProperties(data || []);
    } catch (err) {
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    
    if (!formData.content.trim()) {
      setError('Content is required');
      return false;
    }
    
    if (formData.properties.length === 0) {
      setError('Please select at least one property');
      return false;
    }
    
    if (formData.methods.length === 0) {
      setError('Please select at least one communication method');
      return false;
    }
    
    if (formData.isScheduled) {
      if (!formData.scheduledDate) {
        setError('Scheduled date is required');
        return false;
      }
      
      if (!formData.scheduledTime) {
        setError('Scheduled time is required');
        return false;
      }
    }
    
    setError(null);
    return true;
  };

  const createAnnouncement = async (status: 'draft' | 'scheduled' | 'sending') => {
    if (!userProfile?.id || !userProfile?.organization_id) {
      console.error('User profile or organization ID is missing');
      return null;
    }

    try {
      // Create announcement record
      const { data: announcement, error: announcementError } = await supabase
        .from('announcements')
        .insert({
          title: formData.title,
          content: formData.content,
          communication_method: formData.methods,
          is_scheduled: formData.isScheduled,
          status: status,
          author_id: userProfile.id,
          organization_id: userProfile.organization_id,
          type: formData.type
        })
        .select('id')
        .single();
      
      if (announcementError) throw announcementError;
      
      if (!announcement?.id) {
        throw new Error('Failed to create announcement');
      }
      
      // Add targets (properties)
      if (formData.properties.length > 0) {
        const targetInserts = [];
        
        for (const propertyId of formData.properties) {
          const property = properties.find(p => p.id === propertyId);
          if (property) {
            targetInserts.push({
              announcement_id: announcement.id,
              target_type: 'property',
              target_id: propertyId,
              target_name: property.name,
              property_id: propertyId
            });
          }
        }
        
        if (targetInserts.length > 0) {
          const { error: targetError } = await supabase
            .from('announcement_targets')
            .insert(targetInserts);
          
          if (targetError) throw targetError;
        }
      }
      
      // Add schedule if needed
      if (formData.isScheduled && formData.scheduledDate && formData.scheduledTime) {
        const startDate = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
        
        const { error: scheduleError } = await supabase
          .from('announcement_schedules')
          .insert({
            announcement_id: announcement.id,
            start_date: startDate.toISOString(),
            time_of_day: formData.scheduledTime,
            repeat_frequency: 'once',
            next_run: startDate.toISOString()
          });
        
        if (scheduleError) throw scheduleError;
      }
      
      return announcement.id;
    } catch (error: any) {
      console.error('Error creating announcement:', error);
      setError('Error creating announcement: ' + error.message);
      return null;
    }
  };

  const handleSendNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSending(true);
      setError(null);
      
      // Create the announcement with 'sending' status
      const announcementId = await createAnnouncement('sending');
      
      if (!announcementId) {
        throw new Error('Failed to create announcement');
      }
      
      // Call the function to send the announcement immediately
      const { data, error: sendError } = await supabase.functions.invoke('send-announcement', {
        body: { announcementId }
      });
      
      if (sendError) throw sendError;
      
      // Update announcement status to 'sent'
      await supabase
        .from('announcements')
        .update({ status: 'sent', issue_date: new Date().toISOString() })
        .eq('id', announcementId);
      
      setSendSuccess(true);
      
      // Call the onSubmit prop with the created announcement
      onSubmit({
        ...formData,
        id: announcementId,
        status: 'sent'
      });
      
      // Reset form
      setFormData({
        title: '',
        content: '',
        properties: [],
        methods: [],
        isScheduled: false,
        scheduledDate: '',
        scheduledTime: '',
        type: 'maintenance notice'
      });
      
      // Close the dialog after a delay
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error: any) {
      console.error('Error sending announcement:', error);
      setError('Error sending announcement: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      // Determine status based on scheduling
      const status = formData.isScheduled ? 'scheduled' : 'draft';
      
      const announcementId = await createAnnouncement(status);
      
      if (!announcementId) {
        return;
      }
      
      // Call the onSubmit prop with the created announcement
      onSubmit({
        ...formData,
        id: announcementId,
        status
      });
      
      // Reset form
      setFormData({
        title: '',
        content: '',
        properties: [],
        methods: [],
        isScheduled: false,
        scheduledDate: '',
        scheduledTime: '',
        type: 'maintenance notice'
      });
      
      onClose();
    } catch (error) {
      console.error('Error creating announcement:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleProperty = (propertyId: string) => {
    setFormData(prev => ({
      ...prev,
      properties: prev.properties.includes(propertyId)
        ? prev.properties.filter(id => id !== propertyId)
        : [...prev.properties, propertyId]
    }));
  };

  const toggleMethod = (method: string) => {
    setFormData(prev => ({
      ...prev,
      methods: prev.methods.includes(method)
        ? prev.methods.filter(m => m !== method)
        : [...prev.methods, method]
    }));
  };

  const filteredProperties = properties.filter(property =>
    property.name.toLowerCase().includes(propertySearchQuery.toLowerCase())
  );

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen px-4">
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-30" />

        <div className="relative bg-white rounded-xl shadow-lg max-w-2xl w-full mx-auto">
          <div className="flex items-center justify-between p-6 border-b">
            <Dialog.Title className="text-xl font-semibold text-[#2C3539]">
              Create New Announcement
            </Dialog.Title>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {sendSuccess && (
            <div className="bg-green-50 border border-green-100 rounded-lg m-6 p-4 text-green-700 flex items-center">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              Announcement sent successfully!
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-lg m-6 p-4 text-red-700 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#6B7280]">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                placeholder="Enter announcement title"
                required
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#6B7280]">
                Content
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] min-h-[120px]"
                placeholder="Enter announcement content"
                required
              />
            </div>
            
            {/* Announcement Type */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#6B7280]">
                Announcement Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
              >
                <option value="maintenance notice">Maintenance Notice</option>
                <option value="rent payment reminder">Rent Payment Reminder</option>
                <option value="community event">Community Event</option>
              </select>
            </div>

            {/* Properties */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#6B7280]">
                Select Properties
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowPropertySearch(true)}
                  className="flex items-center w-full px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Properties
                </button>

                {showPropertySearch && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                    <div className="p-2 border-b">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          value={propertySearchQuery}
                          onChange={(e) => setPropertySearchQuery(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                          placeholder="Search properties..."
                        />
                      </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {loading ? (
                        <div className="p-4 text-center text-gray-500">Loading properties...</div>
                      ) : filteredProperties.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">No properties found</div>
                      ) : (
                        filteredProperties.map((property) => (
                          <div
                            key={property.id}
                            onClick={() => toggleProperty(property.id)}
                            className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer"
                          >
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                <Building2 className="w-4 h-4 text-gray-500" />
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-[#2C3539]">{property.name}</p>
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              checked={formData.properties.includes(property.id)}
                              onChange={() => {}}
                              className="h-4 w-4 text-[#2C3539] rounded border-gray-300"
                            />
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-2 border-t">
                      <button
                        type="button"
                        onClick={() => setShowPropertySearch(false)}
                        className="w-full px-4 py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {formData.properties.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.properties.map((propertyId) => {
                    const property = properties.find(p => p.id === propertyId);
                    return property ? (
                      <span
                        key={property.id}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-[#2C3539]"
                      >
                        {property.name}
                        <button
                          type="button"
                          onClick={() => toggleProperty(property.id)}
                          className="ml-2 text-gray-500 hover:text-gray-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>

            {/* Communication Methods */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#6B7280]">
                Communication Methods
              </label>
              <div className="space-y-3">
                {[
                  { id: 'email', label: 'Email' },
                  { id: 'sms', label: 'SMS' },
                  { id: 'whatsapp', label: 'WhatsApp' }
                ].map((method) => (
                  <div key={method.id} className="flex items-center justify-between">
                    <span className="text-sm text-[#2C3539]">{method.label}</span>
                    <button
                      type="button"
                      onClick={() => toggleMethod(method.id)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${
                        formData.methods.includes(method.id) ? 'bg-[#2C3539]' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`absolute left-0.5 top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full transition-transform ${
                          formData.methods.includes(method.id) ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Note: WhatsApp messages will only be sent to tenants who have opted in.
              </p>
            </div>

            {/* Scheduled Announcement */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-[#6B7280]">
                  Schedule the Announcement?
                </label>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, isScheduled: !prev.isScheduled }))}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    formData.isScheduled ? 'bg-[#2C3539]' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`absolute left-0.5 top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full transition-transform ${
                      formData.isScheduled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {formData.isScheduled && (
                <div className="space-y-2 mt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#6B7280] mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        value={formData.scheduledDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                        required={formData.isScheduled}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#6B7280] mb-1">
                        Time
                      </label>
                      <input
                        type="time"
                        value={formData.scheduledTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                        required={formData.isScheduled}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end pt-4 space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-200 rounded-lg text-[#6B7280] hover:bg-gray-50"
              >
                Cancel
              </button>
              
              {!formData.isScheduled && (
                <button
                  type="button"
                  onClick={handleSendNow}
                  disabled={sending}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Now
                    </>
                  )}
                </button>
              )}
              
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 inline-block"></div>
                    {formData.isScheduled ? 'Scheduling...' : 'Saving...'}
                  </>
                ) : (
                  formData.isScheduled ? 'Schedule' : 'Save as Draft'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
}
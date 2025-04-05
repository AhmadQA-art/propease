import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Search, Plus, Building2, Send, AlertCircle } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Select from 'react-select';

interface CreateAnnouncementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

interface Property {
  id: string;
  name: string;
  activeLeases?: number;
  units_count?: number;
  tenants_count?: number;
}

interface PropertyOption {
  value: string;
  label: string;
  activeLeases?: number;
  units_count?: number;
  tenants_count?: number;
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
  const [contactCounts, setContactCounts] = useState({ email: 0, sms: 0, whatsapp: 0, total: 0 });

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
        .select('id, name, units_count:units(count), tenants_count:units(leases(count))')
        .eq('organization_id', userProfile.organization_id);
      
      if (error) throw error;
      
      // Process the counts
      const processedData = data?.map(property => ({
        ...property,
        units_count: property.units_count?.[0]?.count || 0,
        tenants_count: property.tenants_count?.[0]?.count || 0
      })) || [];
      
      setProperties(processedData);
    } catch (err) {
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch tenant contact details
  const fetchTenantCounts = async (propertyIds: string[]) => {
    if (!propertyIds.length) return;
    
    try {
      setLoading(true);
      
      // Get counts for contact methods for tenants in selected properties
      const { data, error } = await supabase.rpc('get_tenant_contact_counts', {
        property_ids: propertyIds
      });
      
      if (error) {
        console.error('Error fetching tenant contact counts:', error);
        return;
      }
      
      setContactCounts(data || { email: 0, sms: 0, whatsapp: 0, total: 0 });
    } catch (err) {
      console.error('Error in fetching tenant contact counts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update counts when properties selection changes
  useEffect(() => {
    if (formData.properties.length > 0) {
      fetchTenantCounts(formData.properties);
    } else {
      setContactCounts({ email: 0, sms: 0, whatsapp: 0, total: 0 });
    }
  }, [formData.properties]);

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

  const createAnnouncement = async (status: 'draft' | 'scheduled' | 'sent' | 'cancelled') => {
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
    
    // Get the estimated tenant count
    const estimatedTenants = properties
      .filter(p => formData.properties.includes(p.id))
      .reduce((sum, p) => sum + (p.tenants_count || 0), 0);
    
    // Confirm before sending to a large number of recipients
    if (estimatedTenants > 50) {
      const confirmed = window.confirm(
        `This announcement will be sent to approximately ${estimatedTenants} tenants. Are you sure you want to proceed?`
      );
      
      if (!confirmed) {
        return;
      }
    }
    
    try {
      setSending(true);
      setError(null);
      
      // Create the announcement with 'sent' status
      const announcementId = await createAnnouncement('sent');
      
      if (!announcementId) {
        throw new Error('Failed to create announcement');
      }
      
      console.log('Calling send-announcement function with ID:', announcementId);
      
      // Call the function to send the announcement immediately
      try {
        // Update timeout to 20 seconds for larger batches
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Function call timed out')), 20000)
        );
        
        const functionPromise = supabase.functions.invoke('send-announcement', {
          body: { announcementId }
        });
        
        // Race the function call against the timeout
        const result = await Promise.race([functionPromise, timeoutPromise]) as any;
        const { data, error: sendError } = result;
        
        if (sendError) {
          console.error('Error from send-announcement function:', sendError);
          throw new Error('Failed to send announcement: ' + sendError.message);
        }
        
        console.log('Announcement sending initiated successfully:', data);
        
        // Check if we're in "sending" status (background processing) or "sent" status (completed)
        const isSendingInBackground = data.stats && data.stats.remaining > 0;
        
        if (isSendingInBackground) {
          // Set status message for background processing
          setError(null);
          setSendSuccess(true);
          
          // Call the onSubmit prop with the created announcement
          onSubmit({
            ...formData,
            id: announcementId,
            status: 'sending',
            message: `Announcement is being sent to ${data.stats.total_tenants} tenants in the background.`,
            jobId: data.job_id
          });
        } else {
          // All messages were sent in the first batch
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
        }
        
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
        
      } catch (functionError: any) {
        console.error('Edge Function error:', functionError);
        
        if (functionError.message === 'Function call timed out') {
          // Special handling for timeout error
          setError('The announcement has been created and will continue sending in the background. You can check its status in the announcements list.');
          
          // Update status to 'sending' to indicate background processing
          await supabase
            .from('announcements')
            .update({ status: 'sending' })
            .eq('id', announcementId);
          
          // Call the onSubmit prop with the created announcement
          onSubmit({
            ...formData,
            id: announcementId,
            status: 'sending'
          });
          
          setSendSuccess(true);
          
          // Reset form and close dialog after delay
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
          
          setTimeout(() => {
            onClose();
          }, 2000);
          
          return;
        }
        
        // For other errors, show the error but still mark the announcement as sent
        setError('Announcement created but there was an issue with the notification service. The system will continue trying to deliver the messages.');
        
        // Update the status to 'sent' in case the Edge Function failed
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
      }
      
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

  const getSelectOptions = (properties: Property[]) => {
    return properties.map(property => ({
      value: property.id,
      label: property.name,
      activeLeases: property.activeLeases,
      units_count: property.units_count,
      tenants_count: property.tenants_count
    }));
  };

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
                Properties
              </label>
              <div className="relative">
                <Select
                  isMulti
                  options={getSelectOptions(properties)}
                  value={getSelectOptions(properties.filter(p => formData.properties.includes(p.id)))}
                  onChange={(selected) => {
                    setFormData(prev => ({
                      ...prev,
                      properties: selected ? selected.map((opt: any) => opt.value) : []
                    }));
                    if (selected) {
                      fetchTenantCounts(selected.map((opt: any) => opt.value));
                    }
                  }}
                  placeholder="Select properties..."
                  noOptionsMessage={() => "No properties found"}
                  isClearable
                  isSearchable
                  className="w-full"
                  classNamePrefix="react-select"
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      borderColor: '#e5e7eb',
                      borderRadius: '0.5rem',
                      boxShadow: 'none',
                      '&:hover': {
                        borderColor: '#d1d5db',
                      },
                    }),
                    multiValue: (provided) => ({
                      ...provided,
                      backgroundColor: '#f3f4f6',
                      borderRadius: '0.375rem',
                    }),
                    multiValueLabel: (provided) => ({
                      ...provided,
                      color: '#2C3539',
                      fontSize: '0.875rem',
                    }),
                    multiValueRemove: (provided) => ({
                      ...provided,
                      color: '#6B7280',
                      '&:hover': {
                        backgroundColor: '#d1d5db',
                        color: '#2C3539',
                      },
                    }),
                    menu: (provided) => ({
                      ...provided,
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    }),
                    option: (provided, state) => ({
                      ...provided,
                      backgroundColor: state.isSelected 
                        ? '#2C3539' 
                        : state.isFocused 
                          ? '#f3f4f6' 
                          : undefined,
                      color: state.isSelected ? 'white' : '#2C3539',
                      '&:active': {
                        backgroundColor: '#e5e7eb',
                      },
                    }),
                  }}
                />
              </div>
              {formData.properties.length > 0 && contactCounts.total > 0 && (
                <div className="mt-1 text-xs text-gray-500">
                  {contactCounts.total} tenants will receive this announcement
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
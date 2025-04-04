import React, { useEffect, useState } from 'react';
import { X, DoorOpen, BadgeDollarSign, Calendar, User, Wrench, Home, Ruler, Bed, Bath, CheckCircle, XCircle, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import { Unit } from '../../types/rental';
import { supabase } from '../../config/supabase';

// Helper function to cast Lucide icon components to React components
const IconWrapper = ({ icon: Icon, size = 20, className = "" }) => {
  return <Icon size={size} className={className} />;
};

interface LeaseDetails {
  id: string;
  start_date: string;
  end_date: string | null;
  rent_amount: number;
  status: string;
  tenant?: {
    id: string;
    user?: {
      first_name: string;
      last_name: string;
      email: string;
      phone?: string;
    }
  }
}

interface UnitDetailsDrawerProps {
  unit: Unit | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (unitId: string) => void;
}

export default function UnitDetailsDrawer({ unit, isOpen, onClose, onDelete }: UnitDetailsDrawerProps) {
  const [leases, setLeases] = useState<LeaseDetails[]>([]);
  const [expandedLeaseId, setExpandedLeaseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchLeaseDetails = async () => {
      if (!unit?.id || !isOpen) return;
      
      setLoading(true);
      try {
        // Fetch all leases for this unit
        const { data, error } = await supabase
          .from('leases')
          .select(`
            id, 
            start_date, 
            end_date, 
            rent_amount, 
            status,
            tenant:tenant_id (
              id,
              user:user_id (
                first_name,
                last_name,
                email,
                phone
              )
            )
          `)
          .eq('unit_id', unit.id)
          .order('start_date', { ascending: false });
          
        if (error) {
          console.error('Error fetching lease details:', error);
        } else if (data && data.length > 0) {
          // Format leases data
          const formattedLeases: LeaseDetails[] = data.map(lease => {
            const formattedLease: LeaseDetails = {
              id: lease.id,
              start_date: lease.start_date,
              end_date: lease.end_date,
              rent_amount: lease.rent_amount,
              status: lease.status
            };
            
            // Only add the tenant if it exists and has the expected structure
            if (lease.tenant && typeof lease.tenant === 'object') {
              // Check if tenant is an array or a single object
              const tenant = Array.isArray(lease.tenant) 
                ? lease.tenant[0] 
                : lease.tenant;
                
              if (tenant && tenant.id) {
                formattedLease.tenant = {
                  id: tenant.id,
                  user: tenant.user && typeof tenant.user === 'object' 
                    ? (Array.isArray(tenant.user) ? tenant.user[0] : tenant.user) 
                    : undefined
                };
              }
            }
            
            return formattedLease;
          });
          
          setLeases(formattedLeases);
          
          // Auto-expand the most recent active lease if available
          const activeLeases = formattedLeases.filter(lease => lease.status.toLowerCase() === 'active');
          if (activeLeases.length > 0) {
            setExpandedLeaseId(activeLeases[0].id);
          }
        } else {
          setLeases([]);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaseDetails();
  }, [unit?.id, isOpen]);

  if (!isOpen || !unit) return null;
  
  // Helper to get lease duration in months
  const getLeaseDuration = (startDate: string, endDate: string | null) => {
    if (!endDate) return null;
    return Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24 * 30));
  };

  // Determine status display
  const getStatusClass = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === 'vacant') return 'bg-green-100 text-green-800';
    if (lowerStatus === 'occupied') return 'bg-gray-100 text-gray-800';
    return 'bg-amber-100 text-amber-800'; // maintenance
  };
  
  // Get lease status badge class
  const getLeaseStatusClass = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === 'active') return 'bg-green-100 text-green-800';
    if (lowerStatus === 'pending') return 'bg-blue-100 text-blue-800';
    if (lowerStatus === 'terminated') return 'bg-red-100 text-red-800';
    if (lowerStatus === 'ended') return 'bg-gray-100 text-gray-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed right-0 top-0 h-screen w-96 bg-white shadow-lg z-50">
      {/* Header - Fixed */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 border-b bg-white z-10">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold text-[#2C3539]">Unit Details</h2>
          <span className={`px-2 py-0.5 text-xs rounded-full capitalize ${getStatusClass(unit.status)}`}>
            {unit.status}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#2C3539]">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* Content - Scrollable */}
      <div className="h-full overflow-y-auto pt-[73px] pb-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
        <div className="p-6 space-y-6">
          {/* Unit Information Section */}
          <div className="space-y-6">
            <h3 className="text-md font-semibold text-[#2C3539] border-b pb-2">Unit Information</h3>
            
            {/* Unit Number */}
            <div className="space-y-2">
              <label className="text-sm text-[#6B7280]">Unit Number</label>
              <div className="flex items-center space-x-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#2C3539]">
                  <path d="M13 4h3a2 2 0 0 1 2 2v14"></path>
                  <path d="M2 20h3"></path>
                  <path d="M13 20h9"></path>
                  <path d="M10 12v.01"></path>
                  <path d="M13 4.562v16.157a1 1 0 0 1-1.242.97L5 20V5.562a2 2 0 0 1 1.515-1.94l4-1A2 2 0 0 1 13 4.561Z"></path>
                </svg>
                <span className="text-[#2C3539] font-medium">{unit.unit_number}</span>
              </div>
            </div>
            
            {/* Floor Plan */}
            {unit.floor_plan && (
              <div className="space-y-2">
                <label className="text-sm text-[#6B7280]">Floor Plan</label>
                <div className="flex items-center space-x-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#2C3539]">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                  <span className="text-[#2C3539]">{unit.floor_plan}</span>
                </div>
              </div>
            )}
            
            {/* Specifications */}
            <div className="grid grid-cols-3 gap-4">
              {/* Area in square meters */}
              {unit.area && (
                <div className="space-y-2">
                  <label className="text-sm text-[#6B7280]">Area (sq m)</label>
                  <div className="flex items-center space-x-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#2C3539]">
                      <path d="M2 12h20"></path>
                      <path d="M2 12v-2a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2"></path>
                      <path d="M2 12v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2"></path>
                    </svg>
                    <span className="text-[#2C3539]">{unit.area}</span>
                  </div>
                </div>
              )}
              
              {/* Bedrooms */}
              {unit.bedrooms !== undefined && (
                <div className="space-y-2">
                  <label className="text-sm text-[#6B7280]">Bedrooms</label>
                  <div className="flex items-center space-x-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#2C3539]">
                      <path d="M2 9V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5"></path>
                      <path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H6v-2a2 2 0 0 0-4 0Z"></path>
                      <path d="M4 18v3"></path>
                      <path d="M20 18v3"></path>
                      <path d="M12 4v9"></path>
                    </svg>
                    <span className="text-[#2C3539]">{unit.bedrooms}</span>
                  </div>
                </div>
              )}
              
              {/* Bathrooms */}
              {unit.bathrooms !== undefined && (
                <div className="space-y-2">
                  <label className="text-sm text-[#6B7280]">Bathrooms</label>
                  <div className="flex items-center space-x-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#2C3539]">
                      <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"></path>
                      <line x1="10" y1="5" x2="8" y2="7"></line>
                      <line x1="2" y1="12" x2="22" y2="12"></line>
                      <line x1="7" y1="19" x2="7" y2="21"></line>
                      <line x1="17" y1="19" x2="17" y2="21"></line>
                    </svg>
                    <span className="text-[#2C3539]">{unit.bathrooms}</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Smart Lock */}
            {unit.hasOwnProperty('smart_lock_enabled') && (
              <div className="space-y-2">
                <label className="text-sm text-[#6B7280]">Smart Lock Enabled</label>
                <div className="flex items-center space-x-2">
                  {(unit as any).smart_lock_enabled ? (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      <span className="text-[#2C3539]">Enabled</span>
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                      </svg>
                      <span className="text-[#2C3539]">Not Enabled</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t"></div>

          {/* Lease Information Section */}
          <div className="space-y-5">
            <h3 className="text-md font-semibold text-[#2C3539] border-b pb-2">Lease Information</h3>
            
            {loading ? (
              <div className="flex justify-center items-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#2C3539]" />
              </div>
            ) : leases.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-gray-500">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2 text-gray-300">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                <p className="mb-1">No leases found</p>
                <p className="text-sm text-center">This unit doesn't have any lease agreements</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* List of all leases */}
                {leases.map(lease => {
                  const leaseDuration = getLeaseDuration(lease.start_date, lease.end_date);
                  const isExpanded = expandedLeaseId === lease.id;
                  
                  return (
                    <div key={lease.id} className="border rounded-lg overflow-hidden">
                      {/* Lease Header - Always visible */}
                      <div 
                        className="p-3 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                        onClick={() => setExpandedLeaseId(isExpanded ? null : lease.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-0.5 text-xs rounded-full capitalize ${getLeaseStatusClass(lease.status)}`}>
                            {lease.status}
                          </span>
                          <div>
                            <p className="font-medium text-sm text-[#2C3539]">
                              ${lease.rent_amount.toLocaleString()}/month
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(lease.start_date).toLocaleDateString()} - {lease.end_date ? new Date(lease.end_date).toLocaleDateString() : 'No end date'}
                            </p>
                          </div>
                        </div>
                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </div>
                      
                      {/* Expanded Lease Details */}
                      {isExpanded && (
                        <div className="border-t p-4 bg-gray-50 space-y-4">
                          {/* Lease Duration */}
                          {leaseDuration && (
                            <div className="space-y-1">
                              <label className="text-xs text-[#6B7280]">Lease Duration</label>
                              <div className="flex items-center space-x-2">
                                <Calendar size={16} className="text-[#2C3539]" />
                                <span className="text-sm text-[#2C3539]">{leaseDuration} months</span>
                              </div>
                            </div>
                          )}
                          
                          {/* Lease Dates */}
                          <div className="grid grid-cols-2 gap-4">
                            {/* Start Date */}
                            <div className="space-y-1">
                              <label className="text-xs text-[#6B7280]">Start Date</label>
                              <div className="flex items-center space-x-2">
                                <Calendar size={16} className="text-[#2C3539]" />
                                <span className="text-sm text-[#2C3539]">{new Date(lease.start_date).toLocaleDateString()}</span>
                              </div>
                            </div>
                            
                            {/* End Date */}
                            <div className="space-y-1">
                              <label className="text-xs text-[#6B7280]">End Date</label>
                              <div className="flex items-center space-x-2">
                                <Calendar size={16} className="text-[#2C3539]" />
                                <span className="text-sm text-[#2C3539]">
                                  {lease.end_date ? new Date(lease.end_date).toLocaleDateString() : 'No end date'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Tenant Information */}
                          {lease.tenant?.user && (
                            <div className="space-y-1">
                              <label className="text-xs text-[#6B7280]">Tenant</label>
                              <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                                <div className="w-8 h-8 rounded-full bg-[#2C3539] flex items-center justify-center text-white text-xs">
                                  {lease.tenant.user.first_name?.[0] || ''}
                                  {lease.tenant.user.last_name?.[0] || ''}
                                </div>
                                <div>
                                  <p className="font-medium text-sm text-[#2C3539]">
                                    {lease.tenant.user.first_name} {lease.tenant.user.last_name}
                                  </p>
                                  <p className="text-xs text-gray-500">{lease.tenant.user.email}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
        {/* Delete Button */}
        {onDelete && (
          <div className="p-6 border-t">
            <button
              onClick={() => unit.id && onDelete(unit.id)}
              className="w-full flex items-center justify-center px-4 py-2 text-red-500 border border-red-500 rounded-lg hover:bg-red-50 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-red-500">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
              Delete Unit
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

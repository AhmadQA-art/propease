import React, { useState, useEffect } from 'react';
import {
    X,
    Mail,
    Phone,
    Home,
    Calendar,
    FileText,
    User,
    Loader2,
    Edit2,
    Save,
    Trash
} from 'lucide-react';
import { format } from 'date-fns';
import { peopleApi } from '../../services/api/people';
import { toast } from 'react-hot-toast';

interface TenantDetailsDrawerProps {
    tenant: {
        id: string;
        name: string;
        email: string;
        phone: string;
        imageUrl?: string;
        property?: string;
        unit?: string;
        leaseStart?: string;
        leaseEnd?: string;
        rentAmount?: number;
        rentStatus?: string;
    } | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate?: () => void;
}

interface DetailedTenant {
    id: string;
    name: string;
    email: string;
    phone: string;
    imageUrl?: string;
    lease?: {
        id: string;
        property: string;
        unitName: string;
        startDate: string;
        endDate: string;
        rentAmount: number;
        status: string;
    };
    documents?: {
        id: string;
        name: string;
        date: string;
        url: string;
    }[];
}

export default function TenantDetailsDrawer({ tenant, isOpen, onClose, onUpdate }: TenantDetailsDrawerProps) {
    const [detailedTenant, setDetailedTenant] = useState<DetailedTenant | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Edit mode state
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    useEffect(() => {
        if (isOpen && tenant) {
            fetchTenantDetails(tenant.id);
        } else {
            setDetailedTenant(null);
        }
    }, [isOpen, tenant]);
    
    // Initialize form data when tenant changes or edit mode is toggled
    useEffect(() => {
        if (detailedTenant) {
            setName(detailedTenant.name || '');
            setEmail(detailedTenant.email || '');
            setPhone(detailedTenant.phone || '');
        } else if (tenant) {
            setName(tenant.name || '');
            setEmail(tenant.email || '');
            setPhone(tenant.phone || '');
        }
    }, [detailedTenant, tenant, isEditing]);
    
    // Reset edit state when drawer closes
    useEffect(() => {
        if (!isOpen) {
            setIsEditing(false);
        }
    }, [isOpen]);

    const fetchTenantDetails = async (tenantId: string) => {
        setLoading(true);
        setError(null);
        try {
            // Fetch tenant details including lease and documents
            const response = await peopleApi.getTenantDetails(tenantId);
            setDetailedTenant(response);
        } catch (err) {
            console.error('Error fetching tenant details:', err);
            setError('Failed to load tenant details');
        } finally {
            setLoading(false);
        }
    };
    
    const handleEditToggle = () => {
        setIsEditing(!isEditing);
    };
    
    const handleCancelEdit = () => {
        setIsEditing(false);
        // Reset form values to current tenant values
        if (detailedTenant) {
            setName(detailedTenant.name || '');
            setEmail(detailedTenant.email || '');
            setPhone(detailedTenant.phone || '');
        } else if (tenant) {
            setName(tenant.name || '');
            setEmail(tenant.email || '');
            setPhone(tenant.phone || '');
        }
    };
    
    const handleSave = async () => {
        if (!tenant) return;
        
        setIsSaving(true);
        
        try {
            // Split name into first and last name
            const nameParts = name.split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ');
            
            // Prepare update data
            const updateData = {
                name: name, // Will be split into first_name and last_name by the API
                email: email,
                phone: phone
            };
            
            // Update tenant through the people API
            await peopleApi.updatePerson(tenant.id, 'tenant', updateData);
            
            // Exit edit mode
            setIsEditing(false);
            
            // Refresh tenant details
            fetchTenantDetails(tenant.id);
            
            // Show success message
            toast.success('Tenant updated successfully');
            
            // Call onUpdate if provided to refresh the parent list
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error updating tenant:', error);
            toast.error('Failed to update tenant');
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleDelete = async () => {
        if (!tenant) return;
        
        if (window.confirm(`Are you sure you want to delete ${tenant.name}?`)) {
            setIsDeleting(true);
            
            try {
                await peopleApi.deletePerson(tenant.id, 'tenant');
                toast.success('Tenant deleted successfully');
                onClose(); // Close the drawer
                if (onUpdate) onUpdate(); // Refresh the tenants list
            } catch (error) {
                console.error('Error deleting tenant:', error);
                toast.error('Failed to delete tenant');
            } finally {
                setIsDeleting(false);
            }
        }
    };

    if (!isOpen || !tenant) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50"
            onClick={onClose}>
            <div className={
                `w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out h-full flex flex-col ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`
            }
                onClick={(e) => e.stopPropagation()}
                // Prevent closing when clicking inside
            >
                {/* Header - Fixed */}
                <div className="flex-shrink-0 bg-white border-b border-gray-200">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-[#2C3539]">
                            Tenant Details
                        </h2>
                        <div className="flex items-center gap-2">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={handleDelete}
                                        className="flex items-center px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? 'Deleting...' : 'Delete'}
                                    </button>
                                    <button
                                        onClick={handleCancelEdit}
                                        className="flex items-center px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="flex items-center px-3 py-1.5 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors text-sm disabled:opacity-50"
                                    >
                                        <Save size={16} className="mr-1" />
                                        {isSaving ? 'Saving...' : 'Save'}
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={handleEditToggle}
                                    className="flex items-center px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                                >
                                    <Edit2 size={16} className="mr-1" />
                                    Edit
                                </button>
                            )}
                            <button
                                className="text-[#6B7280] hover:text-[#2C3539]"
                                onClick={onClose}
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full p-6">
                            <Loader2 className="w-8 h-8 text-[#2C3539] animate-spin mb-2" />
                            <p className="text-[#6B7280]">Loading tenant details...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-full p-6">
                            <p className="text-red-500 mb-2">{error}</p>
                            <button 
                                onClick={() => tenant && fetchTenantDetails(tenant.id)}
                                className="px-4 py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    ) : (
                        <div className="p-6 space-y-6">
                            {/* Tenant Info */}
                            <div className="flex items-center space-x-4">
                                {(detailedTenant?.imageUrl || tenant.imageUrl) ? (
                                    <img 
                                        src={detailedTenant?.imageUrl || tenant.imageUrl} 
                                        alt={detailedTenant?.name || tenant.name}
                                        className="w-16 h-16 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                                        <User className="w-8 h-8 text-gray-500"/>
                                    </div>
                                )}
                                <div>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] w-full"
                                            placeholder="Full Name"
                                        />
                                    ) : (
                                        <h3 className="text-lg font-semibold text-[#2C3539]">
                                            {detailedTenant?.name || tenant.name}
                                        </h3>
                                    )}
                                    <div className="space-y-1 mt-1">
                                        <div className="flex items-center text-sm text-[#6B7280]">
                                            <Mail className="w-4 h-4 mr-2"/> 
                                            {isEditing ? (
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] w-full"
                                                    placeholder="Email Address"
                                                />
                                            ) : (
                                                detailedTenant?.email || tenant.email
                                            )}
                                        </div>
                                        <div className="flex items-center text-sm text-[#6B7280]">
                                            <Phone className="w-4 h-4 mr-2"/> 
                                            {isEditing ? (
                                                <input
                                                    type="tel"
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] w-full"
                                                    placeholder="Phone Number"
                                                />
                                            ) : (
                                                detailedTenant?.phone || tenant.phone
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Show "No active lease" message if no lease */}
                            {!detailedTenant?.lease && (
                                <div className="bg-gray-50 rounded-lg p-6 text-center">
                                    <p className="text-[#6B7280] italic">No active lease agreement</p>
                                </div>
                            )}

                            {/* Property Info - Only show if lease exists */}
                            {detailedTenant?.lease && (
                                <div className="space-y-4">
                                    <h4 className="text-sm font-medium text-[#6B7280]">Property Information</h4>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <Home className="w-4 h-4 text-[#6B7280]"/>
                                            <span className="text-sm font-medium text-[#2C3539]">
                                                {detailedTenant.lease.property}
                                            </span>
                                        </div>
                                        <p className="text-sm text-[#6B7280]">Unit {detailedTenant.lease.unitName}</p>
                                    </div>
                                </div>
                            )}

                            {/* Lease Details - Only show if lease exists */}
                            {detailedTenant?.lease && (
                                <div className="space-y-4">
                                    <h4 className="text-sm font-medium text-[#6B7280]">Lease Details</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <Calendar className="w-4 h-4 text-[#6B7280]"/>
                                                <span className="text-sm text-[#6B7280]">Start Date</span>
                                            </div>
                                            <p className="text-sm font-medium text-[#2C3539]">
                                                {detailedTenant.lease.startDate ? 
                                                    format(new Date(detailedTenant.lease.startDate), 'MMM d, yyyy') : 
                                                    'N/A'
                                                }
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <Calendar className="w-4 h-4 text-[#6B7280]"/>
                                                <span className="text-sm text-[#6B7280]">End Date</span>
                                            </div>
                                            <p className="text-sm font-medium text-[#2C3539]">
                                                {detailedTenant.lease.endDate ? 
                                                    format(new Date(detailedTenant.lease.endDate), 'MMM d, yyyy') : 
                                                    'N/A'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {/* Rent Amount */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <span className="text-sm text-[#6B7280]">Monthly Rent</span>
                                        </div>
                                        <p className="text-sm font-medium text-[#2C3539]">
                                            ${detailedTenant.lease.rentAmount?.toLocaleString()} / month
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Documents - Only show if documents exist */}
                            {detailedTenant?.documents && detailedTenant.documents.length > 0 && (
                                <div className="space-y-4">
                                    <h4 className="text-sm font-medium text-[#6B7280]">Documents</h4>
                                    <div className="space-y-2">
                                        {detailedTenant.documents.map((doc, index) => (
                                            <div key={index}
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center space-x-2">
                                                    <FileText className="w-4 h-4 text-[#6B7280]"/>
                                                    <div>
                                                        <p className="text-sm font-medium text-[#2C3539]">
                                                            {doc.name}
                                                        </p>
                                                        <p className="text-xs text-[#6B7280]">
                                                            {format(new Date(doc.date), 'MMM d, yyyy')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <a 
                                                    href={doc.url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-[#2C3539] hover:text-[#3d474c]"
                                                >
                                                    View
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

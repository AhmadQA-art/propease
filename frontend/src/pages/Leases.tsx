import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, DollarSign, Bell, CreditCard, Calendar, Building2, User } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import LeaseDetailsDrawer from '../components/LeaseDetailsDrawer';
import { supabase } from '../config/supabase';

// Match the interface expected by LeaseDetailsDrawer
interface Lease {
  id: string;
  propertyName: string;
  unit: string;
  resident: {
    name: string;
    imageUrl: string | null;
    email?: string; // Additional field not in LeaseDetailsDrawer but useful
  };
  startDate: string;
  endDate: string;
  rentAmount: number;
  securityDeposit: number;
  balance: number;
  status: 'active' | 'pending' | 'past';
  lastPaymentDate: string;
  nextPaymentDate: string;
  documentStatus: 'signed' | 'pending' | 'not_signed';
  signedDate: string | null;
  // Additional fields not needed by LeaseDetailsDrawer
  paymentStatus: string;
  property?: {
    id: string;
    name: string;
  };
  unitDetails?: {
    id: string;
    unit_number: string;
  };
  createdAt: string;
  documents?: LeaseDocument[]; // Add documents array
  charges?: LeaseCharge[]; // Add charges array
  paymentFrequency?: string; // Add payment frequency
  leaseIssuer?: {
    id: string;
    name: string;
    email?: string;
    role?: string;
  };
  leaseStatus?: string;
}

interface LeaseDocument {
  id: string;
  document_url: string;
  document_status: string;
  created_at: string;
  updated_at: string;
  document_name?: string; // Extracted from URL
}

interface LeaseCharge {
  id: string;
  amount: number;
  charge_status: string;
  description: string;
  type: string;
  created_at: string;
  updated_at: string;
}

// Define types for the Supabase response
interface PropertyData {
  id: string;
  name: string;
}

interface UnitData {
  id: string;
  unit_number: string;
  property_id: string;
  properties: PropertyData;
}

interface TenantData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface LeaseData {
  id: string;
  start_date: string;
  end_date: string | null;
  rent_amount: string;
  security_deposit: string | null;
  status: string | null;
  last_payment_date: string | null;
  next_payment_date: string | null;
  payment_status: string;
  created_at: string;
  unit_id: string;
  tenant_id: string;
  units: UnitData;
  tenants: TenantData;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'past':
    case 'expired':
    case 'ended':
      return 'bg-gray-100 text-gray-800';
    case 'terminated':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Add a function to format status for display
const formatStatusForDisplay = (status: string): string => {
  // Default to capitalized version of whatever we have
  if (!status) return 'Unknown';
  
  // For lowercase values, map them to proper database constraint values
  switch(status.toLowerCase()) {
    case 'active': return 'Active';
    case 'terminated': return 'Terminated';
    case 'pending': return 'Pending';
    case 'ended':
    case 'expired':
    case 'past': return 'Ended';
    default: 
      // Try to capitalize the first letter
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

export default function Leases() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLease, setSelectedLease] = useState<Lease | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeases();
  }, []);

  const fetchLeases = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('leases')
        .select(`
          id,
          start_date,
          end_date,
          rent_amount,
          security_deposit,
          status,
          last_payment_date,
          next_payment_date,
          payment_status,
          created_at,
          unit_id,
          tenant_id,
          units:unit_id (
            id,
            unit_number,
            property_id,
            properties:property_id (
              id, 
              name
            )
          ),
          tenants:tenant_id (
            id,
            first_name,
            last_name,
            email
          )
        `);

      if (error) {
        console.error('Error fetching leases:', error);
        return;
      }

      if (data) {
        const formattedLeases: Lease[] = data.map((lease: any) => {
          // Map status to one of the required status types for LeaseDetailsDrawer
          let formattedStatus: 'active' | 'pending' | 'past' = 'pending';
          if (lease.status) {
            const status = lease.status.toLowerCase();
            if (status === 'active') formattedStatus = 'active';
            else if (status === 'past' || status === 'expired' || status === 'terminated' || status === 'ended') formattedStatus = 'past';
          }
          
          // Create a lease object that matches the LeaseDetailsDrawer interface
          return {
            id: lease.id,
            propertyName: lease.units?.properties?.name || 'Unknown Property',
            unit: lease.units?.unit_number || 'Unknown Unit',
            resident: {
              name: `${lease.tenants?.first_name || ''} ${lease.tenants?.last_name || ''}`.trim() || 'Unknown Resident',
              email: lease.tenants?.email || '',
              imageUrl: null
            },
            startDate: lease.start_date || new Date().toISOString(),
            endDate: lease.end_date || new Date().toISOString(),
            rentAmount: parseFloat(lease.rent_amount) || 0,
            securityDeposit: parseFloat(lease.security_deposit || '0'),
            balance: 0, // As requested, we're not using balance
            status: formattedStatus,
            lastPaymentDate: lease.last_payment_date || new Date().toISOString(),
            nextPaymentDate: lease.next_payment_date || new Date().toISOString(),
            documentStatus: 'pending', // Default value
            signedDate: null,
            paymentStatus: lease.payment_status || 'unknown',
            createdAt: lease.created_at || new Date().toISOString(),
            // Keep the original structure for table display
            property: {
              id: lease.units?.properties?.id || '',
              name: lease.units?.properties?.name || '',
            },
            unitDetails: {
              id: lease.units?.id || '',
              unit_number: lease.units?.unit_number || '',
            },
            leaseStatus: lease.status || 'unknown'
          };
        });

        setLeases(formattedLeases);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeases = leases.filter(lease =>
    lease.property?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lease.resident.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lease.unit.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateLease = () => {
    navigate('/leases/add');
  };

  const handleEditLease = (leaseId: string) => {
    navigate(`/leases/edit/${leaseId}`);
  };

  const handleDeleteLease = async (leaseId: string) => {
    if (window.confirm('Are you sure you want to delete this lease?')) {
      try {
        const { error } = await supabase
          .from('leases')
          .delete()
          .eq('id', leaseId);
          
        if (error) {
          console.error('Error deleting lease:', error);
          return;
        }
        
        // Refresh the leases list
        fetchLeases();
        setIsDrawerOpen(false);
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const handleTerminateLease = async (leaseId: string) => {
    try {
      // Update the lease status to 'Terminated' with correct case to match DB constraints
      const { error } = await supabase
        .from('leases')
        .update({ status: 'Terminated' })
        .eq('id', leaseId);
        
      if (error) {
        console.error('Error terminating lease:', error);
        return;
      }
      
      // Close the drawer
      setIsDrawerOpen(false);
      
      // Refresh the leases list to update the UI
      fetchLeases();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleRowClick = async (lease: Lease) => {
    try {
      // Fetch documents for the selected lease
      const { data: documents, error: documentsError } = await supabase
        .from('lease_documents')
        .select('*')
        .eq('lease_id', lease.id);

      if (documentsError) {
        console.error('Error fetching lease documents:', documentsError);
      }

      // Fetch lease charges
      const { data: charges, error: chargesError } = await supabase
        .from('lease_charges')
        .select('*')
        .eq('lease_id', lease.id);

      if (chargesError) {
        console.error('Error fetching lease charges:', chargesError);
      }

      // Fetch lease details including status and issuer ID
      const { data: leaseDetails, error: leaseError } = await supabase
        .from('leases')
        .select('payment_frequency, status, lease_issuer_id')
        .eq('id', lease.id)
        .single();

      if (leaseError) {
        console.error('Error fetching lease details:', leaseError);
      }

      // Fetch lease issuer information if we have an issuer ID
      let issuerData = null;
      if (leaseDetails?.lease_issuer_id) {
        const { data: issuer, error: issuerError } = await supabase
          .from('user_profiles')
          .select('id, first_name, last_name, email')
          .eq('id', leaseDetails.lease_issuer_id)
          .single();

        if (issuerError) {
          console.error('Error fetching lease issuer:', issuerError);
        } else {
          issuerData = issuer;
        }
      }

      // Process documents to extract file names from URLs
      const processedDocuments = documents?.map(doc => {
        // Extract the file name from the URL
        const urlParts = doc.document_url.split('/');
        const fileName = urlParts[urlParts.length - 1].split('-').slice(1).join('-');
        
        return {
          ...doc,
          document_name: decodeURIComponent(fileName || 'Document')
        };
      }) || [];

      // Set the selected lease with documents, charges, and issuer info
      setSelectedLease({
        ...lease,
        documents: processedDocuments,
        charges: charges || [],
        paymentFrequency: leaseDetails?.payment_frequency || 'Monthly',
        leaseStatus: leaseDetails?.status || 'Unknown',
        leaseIssuer: issuerData ? {
          id: issuerData.id,
          name: `${issuerData.first_name || ''} ${issuerData.last_name || ''}`.trim(),
          email: issuerData.email
        } : undefined
      });
      
      setIsDrawerOpen(true);
    } catch (error) {
      console.error('Error handling row click:', error);
      setSelectedLease(lease);
      setIsDrawerOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-[#2C3539]">Leases</h1>
        <p className="text-[#6B7280] mt-1">Manage your property leases</p>
      </div>

      {/* Search and Actions */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search leases..."
            className="w-full pl-10 pr-4 h-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <button className="h-10 w-10 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <Filter className="w-5 h-5 text-[#2C3539]" />
        </button>

        <button 
          onClick={handleCreateLease}
          className="h-10 flex items-center px-4 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Lease
        </button>
      </div>

      {/* Leases Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center">Loading leases...</div>
          ) : filteredLeases.length === 0 ? (
            <div className="p-8 text-center">
              {searchQuery ? 'No leases match your search query.' : 'No leases found. Create your first lease.'}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#6B7280]">
                    Property
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#6B7280]">
                    Tenants
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#6B7280]">
                    Lease Term
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#6B7280]">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#6B7280]">
                    Created At
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-[#6B7280]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLeases.map((lease) => (
                  <tr
                    key={lease.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleRowClick(lease)}
                  >
                    <td className="px-6 py-3">
                      <div className="flex items-center">
                        <Building2 className="w-4 h-4 text-[#6B7280] mr-3" />
                        <div>
                          <div className="text-sm text-[#2C3539]">{lease.propertyName}</div>
                          <div className="text-xs text-[#6B7280]">Unit {lease.unit}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center">
                        <div className="text-sm text-[#2C3539]">{lease.resident.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-[#6B7280] mr-3" />
                        <div className="text-sm text-[#2C3539]">
                          {lease.startDate ? format(new Date(lease.startDate), 'MMM d, yyyy') : 'N/A'} - {lease.endDate ? format(new Date(lease.endDate), 'MMM d, yyyy') : 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lease.leaseStatus || lease.status)}`}>
                        {formatStatusForDisplay(lease.leaseStatus || lease.status)}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="text-sm text-[#2C3539]">
                        {lease.createdAt ? format(new Date(lease.createdAt), 'MMM d, yyyy') : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex space-x-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            // Replace with notification handling
                            console.log('Notify about lease:', lease.id);
                          }}
                          className="text-[#6B7280] hover:text-[#2C3539]"
                          title="Send Notification"
                        >
                          <Bell className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Lease Details Drawer */}
      {selectedLease && (
        <LeaseDetailsDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          lease={selectedLease}
          onEdit={() => handleEditLease(selectedLease.id)}
          onDelete={() => handleDeleteLease(selectedLease.id)}
          onTerminate={() => handleTerminateLease(selectedLease.id)}
        />
      )}
    </div>
  );
}
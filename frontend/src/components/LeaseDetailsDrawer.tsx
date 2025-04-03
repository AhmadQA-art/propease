import React, { useState, useEffect } from 'react';
import { X, Edit2, Trash2, User, Building2, Calendar, DollarSign, FileText, Download, File, Plus, CheckCircle, AlertCircle, UserCheck, ChevronUp, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '../config/supabase';
import EditLeaseDrawer from './EditLeaseDrawer';

interface LeaseDocument {
  id: string;
  document_url: string;
  document_status: string;
  created_at: string;
  updated_at: string;
  document_name?: string;
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

interface LeasePaymentPeriod {
  id: string;
  lease_id: string;
  period_start_date: string;
  due_date: string;
  status: string;
  total_amount: number;
}

interface LeaseWithPaymentDate {
  id: string;
  propertyName: string;
  unit: string;
  resident: {
    name: string;
    imageUrl: string | null;
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
  documents?: LeaseDocument[];
  charges?: LeaseCharge[];
  paymentFrequency?: string;
  leaseIssuer?: {
    id: string;
    name: string;
    email?: string;
    role?: string;
  };
  leaseStatus?: string;
  securityDepositStatus?: string;
  paymentDate?: string | null;
  lease_terms?: string;
  formattedEndDate?: string;
}

interface LeaseDetailsDrawerProps {
  lease: LeaseWithPaymentDate;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onTerminate: () => void;
}

export default function LeaseDetailsDrawer({
  lease: initialLease,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onTerminate
}: LeaseDetailsDrawerProps) {
  const [lease, setLease] = useState<LeaseWithPaymentDate>(initialLease);
  const [nextPayment, setNextPayment] = useState<LeasePaymentPeriod | null>(null);
  const [overduePayments, setOverduePayments] = useState<LeasePaymentPeriod[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [expandedPaymentDetails, setExpandedPaymentDetails] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState<string | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

  // Update local state when props change or drawer opens
  useEffect(() => {
    if (initialLease) {
      setLease(initialLease);
      
      // When drawer opens, fetch the latest data
      if (isOpen && initialLease.id) {
        fetchLeaseData(initialLease.id);
        fetchPaymentPeriods(initialLease.id);
      }
    }
  }, [initialLease, isOpen]);

  // Fetch the latest lease data
  const fetchLeaseData = async (leaseId: string) => {
    try {
      setIsLoading(true);
      
      // Query the complete lease data with all related information
      const { data: leaseData, error: leaseError } = await supabase
        .from('leases')
        .select(`
          *,
          units:unit_id (id, unit_number),
          tenant:tenant_id (id, first_name, last_name, email, phone),
          issuer:lease_issuer_id (id, first_name, last_name, email)
        `)
        .eq('id', leaseId)
        .single();
      
      if (leaseError) {
        console.error('Error fetching complete lease data:', leaseError);
        return;
      }
      
      if (leaseData) {
        console.log('Fetched updated lease data:', leaseData);
        console.log('📅 [LeaseDetailsDrawer] Lease end date:', leaseData.end_date);
        console.log('📝 [LeaseDetailsDrawer] Lease terms:', leaseData.lease_terms);
        
        // Get property data for the unit
        let propertyData = null;
        if (leaseData.units?.id) {
          const { data: unitWithProperty, error: propertyError } = await supabase
            .from('units')
            .select('property_id, properties(id, name)')
            .eq('id', leaseData.units.id)
            .single();
            
          if (propertyError) {
            console.error('Error fetching property data:', propertyError);
          } else if (unitWithProperty) {
            propertyData = unitWithProperty.properties;
          }
        }
        
        // Get lease documents
        const { data: documentsData, error: documentsError } = await supabase
          .from('lease_documents')
          .select('*')
          .eq('lease_id', leaseId);
          
        if (documentsError) {
          console.error('Error fetching lease documents:', documentsError);
        }
        
        // Get lease charges
        const { data: chargesData, error: chargesError } = await supabase
          .from('lease_charges')
          .select('*')
          .eq('lease_id', leaseId);
          
        if (chargesError) {
          console.error('Error fetching lease charges:', chargesError);
        }
        
        // Format lease data to match the expected LeaseWithPaymentDate format
        const updatedLease: LeaseWithPaymentDate = {
          id: leaseData.id,
          propertyName: propertyData?.name || 'Unknown Property',
          unit: leaseData.units?.unit_number || 'Unknown Unit',
          resident: {
            name: leaseData.tenant ? 
              `${leaseData.tenant.first_name || ''} ${leaseData.tenant.last_name || ''}`.trim() : 
              'Unknown Resident',
            imageUrl: null
          },
          startDate: leaseData.start_date || '',
          endDate: leaseData.end_date || '',
          lease_terms: leaseData.lease_terms || '',
          rentAmount: leaseData.rent_amount || 0,
          securityDeposit: leaseData.security_deposit || 0,
          balance: 0, // Would need to calculate this based on payments
          status: (leaseData.status as 'active' | 'pending' | 'past') || 'pending',
          lastPaymentDate: leaseData.last_payment_date || '',
          nextPaymentDate: leaseData.next_payment_date || '',
          documentStatus: (leaseData.document_status as 'signed' | 'pending' | 'not_signed') || 'not_signed',
          signedDate: null,
          documents: documentsData || [],
          charges: chargesData || [],
          paymentFrequency: leaseData.payment_frequency || 'Monthly',
          leaseIssuer: leaseData.issuer ? {
            id: leaseData.issuer.id,
            name: `${leaseData.issuer.first_name || ''} ${leaseData.issuer.last_name || ''}`.trim(),
            email: leaseData.issuer.email
          } : undefined,
          leaseStatus: leaseData.status || 'pending',
          securityDepositStatus: leaseData.security_deposit_status || 'pending',
          paymentDate: leaseData.payment_date ? leaseData.payment_date.toString() : null
        };
        
        // Display the actual end date from database if available, only calculate projected date if not
        let displayEndDate = '';
        if (leaseData.end_date) {
          // Use the actual end date from the database
          const endDate = new Date(leaseData.end_date);
          displayEndDate = format(endDate, 'MMM d, yyyy');
          console.log("🗓️ [LeaseDetailsDrawer] Using database end date:", displayEndDate);
        } else if (leaseData.lease_terms?.toLowerCase().includes('month') && leaseData.start_date) {
          // Only calculate projected date if no end_date exists in database
          try {
            const startDate = new Date(leaseData.start_date);
            if (!isNaN(startDate.getTime())) {
              const projectedEndDate = new Date(startDate);
              projectedEndDate.setFullYear(projectedEndDate.getFullYear() + 1);
              displayEndDate = format(projectedEndDate, 'MMM d, yyyy');
              console.log("🗓️ [LeaseDetailsDrawer] Calculated projected end date:", displayEndDate);
            }
          } catch (error) {
            console.error("❌ [LeaseDetailsDrawer] Error calculating projected end date:", error);
          }
        }
        
        console.log("🖥️ [LeaseDetailsDrawer] Formatted display data:", {
          formattedStartDate: updatedLease.startDate ? format(new Date(updatedLease.startDate), 'MMM d, yyyy') : 'Not specified',
          formattedEndDate: displayEndDate || 'Not specified',
          leaseType: leaseData.lease_terms
        });
        
        // Update the lease data in our local state with ALL fields
        setLease({
          ...updatedLease,
          formattedEndDate: displayEndDate || (leaseData.lease_terms?.toLowerCase().includes('month') ? 'Month-to-Month' : 'Not specified')
        });
      }
    } catch (error) {
      console.error('Error in lease data fetch:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch payment periods for a specific lease
  const fetchPaymentPeriods = async (leaseId: string) => {
    try {
      setIsLoading(true);
      
      // Get the current date information
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();
      
      // Format as ISO string for database queries
      const todayISO = today.toISOString();
      
      // Create first day of current month for filtering
      const firstDayCurrentMonth = new Date(currentYear, currentMonth, 1).toISOString();
      
      // Create first day of next month for filtering
      const firstDayNextMonth = new Date(currentYear, currentMonth + 1, 1).toISOString();
      
      // First, get all payments to check for duplicates
      const { data: allPayments, error: allPaymentsError } = await supabase
        .from('lease_period_payments')
        .select('*')
        .eq('lease_id', leaseId)
        .order('due_date', { ascending: true });
        
      if (allPaymentsError) {
        console.error('Error fetching all payments:', allPaymentsError);
        return;
      }
      
      // Create a map to deduplicate payment records by due date
      // Keep the records with period_start_date that matches the due_date (preferred) or latest ID
      const paymentsByDueDate = new Map();
      
      if (allPayments) {
        allPayments.forEach(payment => {
          const dueDate = payment.due_date;
          const existingPayment = paymentsByDueDate.get(dueDate);
          
          // Prefer payments where period_start_date matches due_date (more likely to be correct)
          // Or pick the one with the highest ID (likely most recent)
          if (!existingPayment || 
              (payment.period_start_date === payment.due_date) || 
              (parseInt(payment.id) > parseInt(existingPayment.id))) {
            paymentsByDueDate.set(dueDate, payment);
          }
        });
      }
      
      // Convert back to array
      const deduplicatedPayments = Array.from(paymentsByDueDate.values());
      
      // Filter for current month payment
      const currentMonthPayments = deduplicatedPayments.filter(payment => {
        const paymentDate = new Date(payment.due_date);
        return payment.status !== 'paid' && 
               paymentDate.getMonth() === currentMonth && 
               paymentDate.getFullYear() === currentYear;
      });
      
      // Set as next payment if exists
      if (currentMonthPayments.length > 0) {
        setNextPayment(currentMonthPayments[0]);
      } else {
        // If no current month payment, get the next upcoming payment
        const upcomingPayments = deduplicatedPayments.filter(payment => {
          const paymentDate = new Date(payment.due_date);
          return payment.status === 'pending' && 
                 paymentDate >= today;
        }).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
        
        if (upcomingPayments.length > 0) {
          setNextPayment(upcomingPayments[0]);
        } else {
          setNextPayment(null);
        }
      }
      
      // Filter for overdue payments
      const overduePayments = deduplicatedPayments.filter(payment => {
        const paymentDate = new Date(payment.due_date);
        return (payment.status === 'overdue' || 
               (payment.status === 'pending' && 
                (paymentDate < new Date(firstDayCurrentMonth))));
      }).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
      
      setOverduePayments(overduePayments);
      
    } catch (error) {
      console.error('Error in payment period fetch:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get the color based on document status
  const getDocumentStatusColor = (status: string | undefined) => {
    switch (status?.toLowerCase()) {
      case 'signed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'not_signed':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDocumentStatus = (status: string) => {
    status = status.toLowerCase();
    if (status.includes('no signature required')) {
      return 'No Need';
    }
    return status.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getLeaseStatusColor = (status: string) => {
    status = status.toLowerCase();
    if (status === 'active') {
      return 'bg-green-100 text-green-800';
    } else if (status === 'pending') {
      return 'bg-yellow-100 text-yellow-800';
    } else if (status === 'expired' || status === 'terminated') {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string | undefined) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    const statusLower = status.toLowerCase();
    if (statusLower === 'paid') {
      return 'bg-green-100 text-green-800';
    } else if (statusLower === 'pending') {
      return 'bg-yellow-100 text-yellow-800';
    } else if (statusLower === 'overdue') {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const handleDownloadDocument = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'document';
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document. Please try again.');
    }
  };

  const handleViewDocument = (url: string) => {
    window.open(url, '_blank');
  };

  // Show a notification
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    // Auto dismiss after 3 seconds
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Handle status update for security deposit
  const updateSecurityDepositStatus = async (newStatus: 'pending' | 'paid' | 'overdue') => {
    if (!lease) return;
    
    try {
      setUpdatingStatus('security_deposit');
      
      const { error } = await supabase
        .from('leases')
        .update({ security_deposit_status: newStatus })
        .eq('id', lease.id);
      
      if (error) {
        console.error('Error updating security deposit status:', error);
        showNotification('Could not update security deposit status.', 'error');
        return;
      }
      
      // Update the local state to reflect changes
      setLease(prevLease => {
        if (!prevLease) return prevLease;
        return {
          ...prevLease,
          securityDepositStatus: newStatus
        };
      });
      
      // Refresh the lease data to ensure we have the latest state
      if (lease.id) {
        fetchLeaseData(lease.id);
      }
      
      setStatusUpdateSuccess('security_deposit');
      showNotification('Security deposit status updated successfully.', 'success');
      
      // Clear success message after a delay
      setTimeout(() => {
        setStatusUpdateSuccess(null);
      }, 3000);
      
    } catch (error) {
      console.error('Error in security deposit status update:', error);
      showNotification('An unexpected error occurred.', 'error');
    } finally {
      setUpdatingStatus(null);
    }
  };
  
  // Handle status update for payment period
  const updatePaymentPeriodStatus = async (paymentId: string, newStatus: 'pending' | 'paid' | 'overdue') => {
    try {
      setUpdatingStatus(`payment_${paymentId}`);
      
      const { error } = await supabase
        .from('lease_period_payments')
        .update({ status: newStatus })
        .eq('id', paymentId);
      
      if (error) {
        console.error('Error updating payment status:', error);
        showNotification('Could not update payment status.', 'error');
        return;
      }
      
      // Update the local state to reflect changes immediately
      if (nextPayment && nextPayment.id === paymentId) {
        setNextPayment({
          ...nextPayment,
          status: newStatus
        });
      }
      
      // Update overdue payments if it's one of them
      setOverduePayments(prev => 
        prev.map(payment => 
          payment.id === paymentId 
            ? { ...payment, status: newStatus } 
            : payment
        )
      );
      
      // If status is changed to paid, we may want to remove it from overdue list
      if (newStatus === 'paid') {
        setOverduePayments(prev => prev.filter(payment => payment.id !== paymentId));
      }
      
      // Still fetch all payments to make sure everything is in sync
      fetchPaymentPeriods(lease.id);
      
      setStatusUpdateSuccess(`payment_${paymentId}`);
      showNotification('Payment status updated successfully.', 'success');
      
      // Clear success message after a delay
      setTimeout(() => {
        setStatusUpdateSuccess(null);
      }, 3000);
      
    } catch (error) {
      console.error('Error in payment status update:', error);
      showNotification('An unexpected error occurred.', 'error');
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Mark payment as paid
  const markAsPaid = (type: 'security_deposit' | 'payment', id: string) => {
    if (type === 'security_deposit') {
      updateSecurityDepositStatus('paid');
    } else {
      updatePaymentPeriodStatus(id, 'paid');
    }
  };

  // Payment Status Button component
  const PaymentStatusButton = ({ 
    currentStatus, 
    id, 
    type,
    dueDate 
  }: { 
    currentStatus: string; 
    id: string;
    type: 'security_deposit' | 'payment';
    dueDate?: string; // Only required for recurring payments
  }) => {
    const isUpdating = updatingStatus === (type === 'security_deposit' ? 'security_deposit' : `payment_${id}`);
    const isSuccess = statusUpdateSuccess === (type === 'security_deposit' ? 'security_deposit' : `payment_${id}`);
    
    // Don't show the button if already paid
    if (currentStatus === 'paid') {
      return null;
    }
    
    // Check if we can accept payment for this specific payment period
    const canAcceptPayment = () => {
      // Security deposits can always be marked as paid
      if (type === 'security_deposit') return true;
      
      // For recurring payments, we need the due_date
      if (!dueDate) return false;
      
      const today = new Date();
      
      // Get the month and year from the due date (which represents the period being paid for)
      const dueDateTime = new Date(dueDate);
      const dueMonth = dueDateTime.getMonth();
      const dueYear = dueDateTime.getFullYear();
      
      // Current month and year
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      
      // If the payment is overdue, always show the button
      if (currentStatus === 'overdue') {
        return true;
      }
      
      // Current month payments can be marked as paid any time during the month
      if (dueYear === currentYear && dueMonth === currentMonth) {
        return true;
      }
      
      // Past months payments can be marked as paid
      if ((dueYear < currentYear) || (dueYear === currentYear && dueMonth < currentMonth)) {
        return true;
      }
      
      // Future months payments cannot be marked as paid yet
      return false;
    };
    
    // Don't show button if payment can't be accepted yet
    if (!canAcceptPayment()) {
      return null;
    }
    
    const markAsPaid = () => {
      if (type === 'security_deposit') {
        updateSecurityDepositStatus('paid');
      } else {
        updatePaymentPeriodStatus(id, 'paid');
      }
    };
    
    return (
      <button 
        onClick={markAsPaid}
        className={`text-xs px-2 py-1 rounded border border-gray-200 
          ${isUpdating ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-600 hover:bg-green-50 hover:text-green-600 hover:border-green-200'} 
          ${isSuccess ? 'bg-green-50 text-green-600 border-green-200' : ''}`}
        disabled={isUpdating}
      >
        {isUpdating ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Updating...
          </span>
        ) : isSuccess ? (
          <span className="flex items-center">
            <CheckCircle className="w-3 h-3 mr-1" />
            Marked as Paid
          </span>
        ) : (
          <span className="flex items-center">
            <DollarSign className="w-3 h-3 mr-1" />
            Mark as Paid
          </span>
        )}
      </button>
    );
  };

  // Function to extract filename from URL
  const extractFilenameFromUrl = (url: string): string => {
    if (!url) return 'Document';
    
    try {
      // Extract just the filename part (after the last slash)
      const urlPath = url.split('/');
      let filename = urlPath[urlPath.length - 1];
      
      // Remove any query parameters
      if (filename.includes('?')) {
        filename = filename.split('?')[0];
      }
      
      // URL decode the filename to handle spaces and special characters
      filename = decodeURIComponent(filename);
      
      // Remove timestamp prefix if present (format: 1234567890_actual_filename.ext)
      const timestampMatch = filename.match(/^\d+_(.+)$/);
      if (timestampMatch && timestampMatch[1]) {
        return timestampMatch[1];  // Return the actual filename without the timestamp
      }
      
      // If we get here and the filename is just a hash or doesn't look like a filename, return a generic name
      if (filename.length < 5 || !filename.includes('.')) {
        return 'Document';
      }
      
      return filename;
    } catch (error) {
      console.error('Error extracting filename from URL:', error);
      return 'Document';
    }
  };

  // Function to handle lease update
  const handleLeaseUpdated = async () => {
    if (lease?.id) {
      // Show loading state
      setIsLoading(true);
      
      try {
        console.log('Refreshing lease data after edit...');
        
        // Get fresh lease data
        await fetchLeaseData(lease.id);
        
        // Get fresh payment periods
        await fetchPaymentPeriods(lease.id);
        
        // Show success notification
        showNotification('Lease updated successfully', 'success');
      } catch (error) {
        console.error('Error refreshing lease data:', error);
        showNotification('Lease was updated but display may not be current', 'error');
      } finally {
        setIsLoading(false);
      }
      
      // Close the edit drawer
      setIsEditDrawerOpen(false);
    }
  };

  // Handle opening the edit drawer
  const handleEditLease = () => {
    setIsEditDrawerOpen(true);
  };

  const togglePaymentDetails = (paymentId: string) => {
    if (expandedPaymentDetails === paymentId) {
      setExpandedPaymentDetails(null);
    } else {
      setExpandedPaymentDetails(paymentId);
    }
  };

  if (!lease) return null;

  return (
    <div
      className={`fixed inset-y-0 right-0 w-[480px] bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } z-50`}
    >
      {/* Edit Lease Drawer */}
      {isEditDrawerOpen && (
        <EditLeaseDrawer 
          isOpen={isEditDrawerOpen}
          onClose={() => setIsEditDrawerOpen(false)}
          leaseId={lease.id}
          onLeaseUpdated={handleLeaseUpdated}
        />
      )}
      
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 max-w-sm p-3 rounded-md shadow-md z-50 ${
          notification.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center">
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            )}
            <p className={`text-sm ${notification.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
              {notification.message}
            </p>
            <button 
              className="ml-auto text-gray-400 hover:text-gray-500" 
              onClick={() => setNotification(null)}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      {/* Fixed Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-6 border-b bg-white z-10">
        <div className="flex flex-col">
          <h2 className="text-xl font-semibold text-[#2C3539]">Lease Details</h2>
          {lease.leaseStatus && (
            <span 
              className={`mt-1 text-xs font-medium ${getLeaseStatusColor(lease.leaseStatus)}`}
              style={{ padding: '2px 8px', lineHeight: '1.2', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '9999px', width: 'fit-content' }}
            >
              {lease.leaseStatus}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="h-full overflow-y-auto pt-[88px] pb-24 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
        <div className="p-6 space-y-6">
          {/* Property Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Building2 className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-[#2C3539]">{lease.propertyName}</p>
                <p className="text-sm text-gray-500">Unit {lease.unit}</p>
              </div>
            </div>
          </div>
          
          {/* Lease Issuer */}
          {lease.leaseIssuer && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-[#2C3539]">Lease Issuer</h3>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#2C3539]">{lease.leaseIssuer.name}</p>
                    {lease.leaseIssuer.email && (
                      <p className="text-xs text-gray-500 mt-1">{lease.leaseIssuer.email}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Resident Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[#2C3539]">Tenant</h3>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                {lease.resident.imageUrl ? (
                  <img
                    src={lease.resident.imageUrl}
                    alt={lease.resident.name}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <User className="w-5 h-5 text-gray-500" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-[#2C3539]">{lease.resident.name}</p>
                <p className="text-sm text-gray-500">Resident</p>
              </div>
            </div>
          </div>

          {/* Lease Terms */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[#2C3539]">Lease Terms</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Start Date</p>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <p className="text-sm text-[#2C3539]">
                    {lease.startDate ? format(new Date(lease.startDate), 'MMM d, yyyy') : 'Not set'}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">End Date</p>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <p className="text-sm text-[#2C3539]">
                    {lease.lease_terms?.toLowerCase().includes('month') 
                      ? lease.formattedEndDate
                      : lease.endDate 
                        ? format(new Date(lease.endDate), 'MMM d, yyyy') 
                        : 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[#2C3539]">Payment Details</h3>
            
            {/* Security Deposit Card */}
            <div className="p-3 border border-gray-100 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs text-gray-500">Security Deposit</p>
                {lease.securityDepositStatus !== 'paid' && (
                  <PaymentStatusButton 
                    currentStatus={lease.securityDepositStatus || 'pending'} 
                    id={lease.id}
                    type="security_deposit"
                  />
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <p className="text-sm font-medium text-[#2C3539]">
                    {lease.securityDeposit.toLocaleString()}
                  </p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(lease.securityDepositStatus || 'pending')}`}>
                  {lease.securityDepositStatus ? 
                    lease.securityDepositStatus.charAt(0).toUpperCase() + lease.securityDepositStatus.slice(1) 
                    : 'Pending'}
                </span>
              </div>
            </div>
            
            {/* Recurring Payments Section */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-medium text-gray-500">Recurring Payments</h4>
              </div>
              
              <div className="space-y-3">
                {/* Overdue Payments */}
                {overduePayments.length > 0 && (
                  <div className="mb-4">
                    {overduePayments.map(payment => (
                      <div key={payment.id} className="mt-2 border border-gray-200 rounded-lg overflow-hidden">
                        <div className="p-3">
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <p className="text-sm text-gray-600">
                                {payment.due_date && payment.due_date !== "null" ? format(new Date(payment.due_date), 'MMM d, yyyy') : 'Date not available'}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-800">
                                Overdue
                              </span>
                              {payment.status !== 'paid' && (
                                <PaymentStatusButton 
                                  currentStatus={payment.status || 'overdue'} 
                                  id={payment.id}
                                  type="payment"
                                  dueDate={payment.due_date}
                                />
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500">Total Amount</p>
                            <div className="flex items-center">
                              <DollarSign className="w-3 h-3 text-gray-400 mr-1" />
                              <p className="text-sm font-medium text-gray-600">
                                {payment.total_amount !== undefined ? 
                                  parseFloat(payment.total_amount.toString()).toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                    minimumFractionDigits: 2
                                  }) 
                                  : '$0.00'}
                              </p>
                            </div>
                          </div>
                          
                          {/* Payment Details Expansion */}
                          {expandedPaymentDetails === payment.id && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <h6 className="text-xs font-medium text-gray-600 mb-2">Payment Breakdown</h6>
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-gray-500">Rent</span>
                                  <span className="text-xs font-medium text-gray-600">
                                    {lease.rentAmount ? 
                                      parseFloat(lease.rentAmount.toString()).toLocaleString('en-US', {
                                        style: 'currency',
                                        currency: 'USD',
                                        minimumFractionDigits: 2
                                      }) 
                                      : '$0.00'}
                                  </span>
                                </div>
                                
                                {/* Additional charges if any */}
                                {lease.charges && lease.charges.length > 0 && lease.charges.map(charge => (
                                  <div key={charge.id} className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500">{charge.type}</span>
                                    <span className="text-xs font-medium text-gray-600">
                                      {parseFloat(charge.amount.toString()).toLocaleString('en-US', {
                                        style: 'currency',
                                        currency: 'USD',
                                        minimumFractionDigits: 2
                                      })}
                                    </span>
                                  </div>
                                ))}
                                
                                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                  <span className="text-xs font-medium text-gray-600">Total</span>
                                  <span className="text-xs font-medium text-gray-600">
                                    {payment.total_amount !== undefined ? 
                                      parseFloat(payment.total_amount.toString()).toLocaleString('en-US', {
                                        style: 'currency',
                                        currency: 'USD',
                                        minimumFractionDigits: 2
                                      }) 
                                      : '$0.00'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Toggle Details Button */}
                          <button
                            onClick={() => togglePaymentDetails(payment.id)}
                            className="w-full mt-2 pt-2 text-xs text-gray-500 hover:text-gray-600 flex items-center justify-center border-t border-gray-200"
                          >
                            {expandedPaymentDetails === payment.id ? (
                              <>
                                <ChevronUp className="w-3 h-3 mr-1" />
                                Hide details
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-3 h-3 mr-1" />
                                Show details
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Next Payment Information */}
                <div className="mt-2 border border-gray-100 rounded-lg overflow-hidden">
                  <div className="p-3">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="text-xs font-medium text-gray-500">Next Payment Due</h5>
                      {nextPayment && nextPayment.status !== 'paid' && (
                        <PaymentStatusButton 
                          currentStatus={nextPayment.status || 'pending'} 
                          id={nextPayment.id}
                          type="payment"
                          dueDate={nextPayment.due_date}
                        />
                      )}
                    </div>
                    {isLoading ? (
                      <p className="text-sm text-gray-500">Loading payment information...</p>
                    ) : nextPayment ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <p className="text-sm text-gray-600">
                              {nextPayment && nextPayment.due_date && nextPayment.due_date !== "null" ? format(new Date(nextPayment.due_date), 'MMM d, yyyy') : 'Date not available'}
                            </p>
                          </div>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(nextPayment.status)}`}>
                            {nextPayment.status ? 
                              nextPayment.status.charAt(0).toUpperCase() + nextPayment.status.slice(1) 
                              : 'Pending'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">Total Amount</p>
                          <div className="flex items-center">
                            <DollarSign className="w-3 h-3 text-gray-400 mr-1" />
                            <p className="text-sm font-medium text-[#2C3539]">
                              {nextPayment.total_amount !== undefined ? 
                                parseFloat(nextPayment.total_amount.toString()).toLocaleString('en-US', {
                                  style: 'currency',
                                  currency: 'USD',
                                  minimumFractionDigits: 2
                                }) 
                                : '$0.00'}
                            </p>
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => setShowPaymentDetails(!showPaymentDetails)}
                          className="mt-2 text-xs text-gray-500 hover:text-gray-600 flex items-center"
                        >
                          {showPaymentDetails ? 'Hide details' : 'Show details'}
                          {showPaymentDetails ? 
                            <ChevronUp className="w-3 h-3 ml-1" /> : 
                            <ChevronDown className="w-3 h-3 ml-1" />
                          }
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No upcoming payments scheduled</p>
                    )}
                  </div>
                  
                  {/* Expandable Payment Details */}
                  {nextPayment && showPaymentDetails && (
                    <div className="border-t border-gray-100 bg-gray-50 p-4 transition-all duration-300 ease-in-out">
                      <div className="space-y-3">
                        {/* Base Rent */}
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                          <div>
                            <p className="text-sm font-medium text-[#2C3539]">Rent amount</p>
                            <p className="text-xs text-gray-500">Monthly rent payment</p>
                          </div>
                          <p className="text-sm font-medium text-[#2C3539]">
                            {lease.rentAmount ? 
                              parseFloat(lease.rentAmount.toString()).toLocaleString('en-US', {
                                style: 'currency',
                                currency: 'USD',
                                minimumFractionDigits: 2
                              }) 
                              : '$0.00'}
                          </p>
                        </div>
                        
                        {/* Additional Charges */}
                        {lease.charges && lease.charges.length > 0 ? (
                          lease.charges.map(charge => (
                            <div key={charge.id} className="flex justify-between items-center py-2 border-b border-gray-200">
                              <div>
                                <p className="text-sm font-medium text-[#2C3539]">{charge.description}</p>
                                <p className="text-xs text-gray-500">{charge.type}</p>
                              </div>
                              <p className="text-sm font-medium text-[#2C3539]">
                                {parseFloat(charge.amount.toString()).toLocaleString('en-US', {
                                  style: 'currency',
                                  currency: 'USD',
                                  minimumFractionDigits: 2
                                })}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="py-2 text-sm text-gray-500">No additional charges</div>
                        )}
                        
                        {/* Total Amount */}
                        <div className="flex justify-between items-center pt-3 border-t border-gray-300">
                          <p className="text-sm font-bold text-[#2C3539]">Total Amount Due</p>
                          <p className="text-sm font-bold text-[#2C3539]">
                            {nextPayment.total_amount !== undefined ? 
                              parseFloat(nextPayment.total_amount.toString()).toLocaleString('en-US', {
                                style: 'currency',
                                currency: 'USD',
                                minimumFractionDigits: 2
                              }) 
                              : '$0.00'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Document Status */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[#2C3539]">Documents</h3>
            
            {lease.documents && lease.documents.length > 0 ? (
              <div className="space-y-3">
                {lease.documents.map(doc => {
                  // Get document name from document_name field, or extract from URL if missing
                  const documentName = extractFilenameFromUrl(doc.document_url);
                  
                  return (
                    <div key={doc.id} className="p-3 border border-gray-100 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-[#2C3539] truncate max-w-[180px]" title={documentName}>
                            {documentName}
                          </span>
                        </div>
                        <span
                          className={`text-xs font-medium ${getDocumentStatusColor(doc.document_status)}`}
                          style={{ padding: '2px 8px', lineHeight: '1.2', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '9999px', width: 'fit-content' }}
                        >
                          {formatDocumentStatus(doc.document_status)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {doc.created_at ? format(new Date(doc.created_at), 'MMM d, yyyy') : 'Unknown'}
                        </span>
                        <div className="flex space-x-1">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDocument(doc.document_url);
                            }}
                            className="p-1 text-[#6B7280] hover:text-[#2C3539] rounded-full hover:bg-gray-100 transition-colors"
                            title="View Document"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadDocument(doc.document_url, documentName);
                            }}
                            className="p-1 text-[#6B7280] hover:text-[#2C3539] rounded-full hover:bg-gray-100 transition-colors"
                            title="Download Document"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 border border-dashed border-gray-200 rounded-lg">
                <File className="w-8 h-8 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500">No documents available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="absolute bottom-0 left-0 right-0 p-6 border-t bg-white z-10">
        <div className="flex space-x-3">
          <button
            onClick={handleEditLease}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#1e2529] transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            <span>Edit</span>
          </button>
          <button
            onClick={() => onTerminate(lease.id)}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 border border-gray-400 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span>Terminate</span>
          </button>
          <button
            onClick={() => onDelete(lease.id)}
            className="w-10 h-10 flex items-center justify-center border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
            title="Delete Lease"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

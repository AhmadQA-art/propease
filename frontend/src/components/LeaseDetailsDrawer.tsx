import React, { useState, useEffect } from 'react';
import { X, Edit2, Trash2, User, Building2, Calendar, DollarSign, FileText, Download, File, Plus, CheckCircle, AlertCircle, UserCheck, ChevronUp, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '../config/supabase';

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

interface LeaseDetailsDrawerProps {
  lease: {
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
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (leaseId: string) => void;
  onDelete: (leaseId: string) => void;
  onTerminate: (leaseId: string) => void;
}

export default function LeaseDetailsDrawer({
  lease,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onTerminate
}: LeaseDetailsDrawerProps) {
  const [nextPayment, setNextPayment] = useState<LeasePaymentPeriod | null>(null);
  const [overduePayments, setOverduePayments] = useState<LeasePaymentPeriod[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);

  // Fetch payment periods when the drawer opens
  useEffect(() => {
    if (lease && isOpen) {
      fetchPaymentPeriods();
    }
  }, [lease?.id, isOpen]);

  const fetchPaymentPeriods = async () => {
    if (!lease) return;
    
    try {
      setIsLoading(true);
      const today = new Date().toISOString();
      
      // Fetch the next upcoming payment
      const { data: upcomingData, error: upcomingError } = await supabase
        .from('lease_period_payments')
        .select('*')
        .eq('lease_id', lease.id)
        .eq('status', 'pending')
        .gte('due_date', today)
        .order('due_date', { ascending: true })
        .limit(1);
      
      if (upcomingError) {
        console.error('Error fetching next payment period:', upcomingError);
      } else if (upcomingData && upcomingData.length > 0) {
        setNextPayment(upcomingData[0]);
      }
      
      // Fetch overdue payments
      const { data: overdueData, error: overdueError } = await supabase
        .from('lease_period_payments')
        .select('*')
        .eq('lease_id', lease.id)
        .eq('status', 'overdue')
        .order('due_date', { ascending: true });
      
      if (overdueError) {
        console.error('Error fetching overdue payments:', overdueError);
      } else if (overdueData) {
        setOverduePayments(overdueData);
      }
    } catch (error) {
      console.error('Error in payment period fetch:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!lease) return null;

  const getDocumentStatusColor = (status: string) => {
    status = status.toLowerCase();
    if (status.includes('signed')) {
      return 'bg-green-100 text-green-800';
    } else if (status.includes('not signed')) {
      return 'bg-yellow-100 text-yellow-800';
    } else if (status.includes('no signature') || status.includes('no need')) {
      return 'bg-gray-100 text-gray-500';
    }
    return 'bg-gray-100 text-gray-800';
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

  return (
    <div
      className={`fixed inset-y-0 right-0 w-[480px] bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
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
                    {format(new Date(lease.startDate), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">End Date</p>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <p className="text-sm text-[#2C3539]">
                    {format(new Date(lease.endDate), 'MMM d, yyyy')}
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
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Security Deposit</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <p className="text-sm font-medium text-[#2C3539]">
                      {lease.securityDeposit.toLocaleString()}
                    </p>
                  </div>
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
              <h4 className="text-xs font-medium text-gray-500 mb-3">Recurring Payments</h4>
              
              <div className="space-y-3">
                {/* Overdue Payments */}
                {overduePayments.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-red-600 mb-2">Overdue Payments</p>
                    {overduePayments.map(payment => (
                      <div key={payment.id} className="mt-2 border border-red-100 rounded-lg overflow-hidden">
                        <div className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-red-500" />
                              <p className="text-sm text-red-600">
                                {payment.due_date ? format(new Date(payment.due_date), 'MMM d, yyyy') : 'Date not available'}
                              </p>
                            </div>
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-800">
                              Overdue
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-red-500">Total Amount</p>
                            <div className="flex items-center">
                              <DollarSign className="w-3 h-3 text-red-400 mr-1" />
                              <p className="text-sm font-medium text-red-600">
                                {payment.total_amount !== undefined ? 
                                  parseFloat(payment.total_amount.toString()).toLocaleString() 
                                  : '0'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Next Payment Information */}
                <div className="mt-2 border border-gray-100 rounded-lg overflow-hidden">
                  <div className="p-3">
                    <h5 className="text-xs font-medium text-gray-500 mb-2">Next Payment Due</h5>
                    {isLoading ? (
                      <p className="text-sm text-gray-500">Loading payment information...</p>
                    ) : nextPayment ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <p className="text-sm text-gray-600">
                              {nextPayment.due_date ? format(new Date(nextPayment.due_date), 'MMM d, yyyy') : 'Date not available'}
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
                                parseFloat(nextPayment.total_amount.toString()).toLocaleString() 
                                : '0'}
                            </p>
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => setShowPaymentDetails(!showPaymentDetails)}
                          className="mt-2 text-xs text-gray-500 hover:text-gray-700 flex items-center"
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
                        <div className="flex items-center justify-between py-2 border-b border-gray-200">
                          <div>
                            <p className="text-sm font-medium text-[#2C3539]">Rent amount</p>
                            <p className="text-xs text-gray-500">Monthly rent payment</p>
                          </div>
                          <p className="text-sm font-medium text-[#2C3539]">
                            ${lease.rentAmount.toLocaleString()}
                          </p>
                        </div>
                        
                        {/* Additional Charges */}
                        {lease.charges && lease.charges.length > 0 ? (
                          lease.charges.map(charge => (
                            <div key={charge.id} className="flex items-center justify-between py-2 border-b border-gray-200">
                              <div>
                                <p className="text-sm font-medium text-[#2C3539]">{charge.description}</p>
                                <p className="text-xs text-gray-500">{charge.type}</p>
                              </div>
                              <p className="text-sm font-medium text-[#2C3539]">
                                ${parseFloat(charge.amount.toString()).toLocaleString()}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="py-2 text-sm text-gray-500">No additional charges</div>
                        )}
                        
                        {/* Total Amount */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-300">
                          <p className="text-sm font-bold text-[#2C3539]">Total Amount Due</p>
                          <p className="text-sm font-bold text-[#2C3539]">
                            ${nextPayment.total_amount !== undefined ? 
                              parseFloat(nextPayment.total_amount.toString()).toLocaleString() 
                              : '0'}
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
                {lease.documents.map(doc => (
                  <div key={doc.id} className="p-3 border border-gray-100 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-[#2C3539] truncate max-w-[180px]" title={doc.document_name}>
                          {doc.document_name || 'Document'}
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
                        {format(new Date(doc.created_at), 'MMM d, yyyy')}
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
                            handleDownloadDocument(doc.document_url, doc.document_name || 'document');
                          }}
                          className="p-1 text-[#6B7280] hover:text-[#2C3539] rounded-full hover:bg-gray-100 transition-colors"
                          title="Download Document"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
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
            onClick={() => onEdit(lease.id)}
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

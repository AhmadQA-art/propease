import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Plus, X, User, DollarSign, File } from 'lucide-react';
import { Property } from '../types/rental';
import { Tenant, LeaseCharge } from '../types/tenant';
import AddTenantDialog from './AddTenantDialog';
import clsx from 'clsx';
import { supabase } from '../config/supabase';
import { toast } from 'react-hot-toast';

interface LeaseIssuer {
  id: string;
  name: string;
  email?: string;
}

interface AddLeaseFormProps {
  properties: Property[];
  onSubmit: (leaseData: any, rentalData: any) => void;
}

interface LeaseDocument {
  id: string;
  file: File;
  name: string;
  status: 'Signed' | 'Not Signed' | 'No signature required';
  url?: string;
}

export default function AddLeaseForm({ properties, onSubmit }: AddLeaseFormProps) {
  const navigate = useNavigate();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isAddTenantOpen, setIsAddTenantOpen] = useState(false);
  const [selectedTenants, setSelectedTenants] = useState<Tenant[]>([]);
  const [charges, setCharges] = useState<LeaseCharge[]>([]);
  const [issuers, setIssuers] = useState<LeaseIssuer[]>([]);
  const [currentUser, setCurrentUser] = useState<LeaseIssuer | null>(null);
  const [loadingCurrentUser, setLoadingCurrentUser] = useState(true);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [formData, setFormData] = useState({
    propertyId: '',
    unit: '',
    leaseType: 'fixed' as 'fixed' | 'month-to-month',
    startDate: '',
    endDate: '',
    firstRentDate: '',
    rentFrequency: 'Monthly' as 'Daily' | 'Weekly' | 'Every 2 Weeks' | 'Monthly' | 'Every 2 Months' | 'Quarterly' | 'Every 6 Months' | 'Annually',
    hasDeposit: false,
    depositAmount: '',
    documentStatus: 'Not Signed' as 'Signed' | 'Not Signed' | 'No signature required',
    documentUrl: '',
    documentType: '',
    paymentDay: '1',
    nextPaymentDate: '',
    rentAmount: '',
    rollOverToMonthToMonth: true,
    securityDepositStatus: 'pending' as 'pending' | 'paid' | 'overdue',
    rentPaymentStatus: 'pending' as 'pending' | 'paid' | 'overdue',
    paymentStatus: 'pending' as 'pending' | 'paid' | 'overdue',
    isAutoRenew: true,
  });

  const [documents, setDocuments] = useState<LeaseDocument[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchIssuers = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const currentUserId = session?.user?.id;
        
        const { data, error } = await supabase
          .from('user_profiles')
          .select('id, first_name, last_name, email, status')
          .eq('status', 'active');
          
        if (error) {
          console.error('Error fetching users:', error);
          return;
        }
        
        if (data) {
          const formattedIssuers = data.map(user => ({
            id: user.id,
            name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
            email: user.email
          }));
          
          setIssuers(formattedIssuers);
          
          if (currentUserId) {
            const currentUserData = formattedIssuers.find(user => user.id === currentUserId);
            if (currentUserData) {
              setCurrentUser(currentUserData);
            } else {
              setCurrentUser(formattedIssuers.length > 0 ? formattedIssuers[0] : null);
            }
          } else {
            setCurrentUser(formattedIssuers.length > 0 ? formattedIssuers[0] : null);
          }
        }
      } catch (error) {
        console.error('Error:', error);
        if (issuers.length > 0) {
          setCurrentUser(issuers[0]);
        }
      } finally {
        setLoadingCurrentUser(false);
      }
    };
    
    fetchIssuers();
  }, []);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        setLoadingTenants(true);
        const { data, error } = await supabase
          .from('tenants')
          .select('id, first_name, last_name, email, phone');
          
        if (error) {
          console.error('Error fetching tenants:', error);
          return;
        }
        
        if (data) {
          const formattedTenants: Tenant[] = data.map(tenant => ({
            id: tenant.id,
            name: `${tenant.first_name || ''} ${tenant.last_name || ''}`.trim(),
            email: tenant.email || '',
            phone: tenant.phone || '',
            imageUrl: null
          }));
          
          setTenants(formattedTenants);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoadingTenants(false);
      }
    };
    
    fetchTenants();
  }, []);

  useEffect(() => {
    if (formData.startDate && formData.paymentDay) {
      calculateNextPaymentDate();
    }
  }, [formData.startDate, formData.paymentDay, formData.rentFrequency, formData.leaseType]);

  useEffect(() => {
    if (formData.startDate || formData.endDate) {
      validateDateRange(formData.startDate, formData.endDate);
    }
  }, [formData.startDate, formData.endDate, formData.leaseType]);

  useEffect(() => {
    if (formData.leaseType === 'month-to-month') {
      // Month-to-month leases must use monthly payment frequency
      setFormData(prev => ({
        ...prev,
        rentFrequency: 'Monthly'
      }));
    }
  }, [formData.leaseType]);

  useEffect(() => {
    // When switching to month-to-month, clear any end date errors
    if (formData.leaseType === 'month-to-month') {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors.endDate;
        return newErrors;
      });
    }
  }, [formData.leaseType]);

  const calculateNextPaymentDate = () => {
    try {
      const startDate = new Date(formData.startDate);
      if (isNaN(startDate.getTime())) {
        console.error('Invalid start date');
        return;
      }
      
      const paymentDay = parseInt(formData.paymentDay);
      if (isNaN(paymentDay) || paymentDay < 1 || paymentDay > 31) {
        console.error('Invalid payment day');
        return;
      }
      
      // Create a new date based on the start date
      let nextPaymentDate = new Date(startDate);
      
      // Set the payment day in the month
      const currentMonth = nextPaymentDate.getMonth();
      const currentYear = nextPaymentDate.getFullYear();
      
      // Get the last day of the current month
      const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      
      // Adjust payment day if it exceeds days in the month
      const adjustedPaymentDay = Math.min(paymentDay, lastDayOfMonth);
      
      // Set the day to the adjusted payment day
      nextPaymentDate.setDate(adjustedPaymentDay);
      
      // If the calculated next payment date is before the start date,
      // we need to advance to the next payment period
      if (nextPaymentDate < startDate) {
        switch (formData.rentFrequency) {
          case 'Daily':
            nextPaymentDate = new Date(startDate);
            nextPaymentDate.setDate(startDate.getDate() + 1);
            break;
            
          case 'Weekly':
            nextPaymentDate = new Date(startDate);
            nextPaymentDate.setDate(startDate.getDate() + 7);
            break;
            
          case 'Every 2 Weeks':
            nextPaymentDate = new Date(startDate);
            nextPaymentDate.setDate(startDate.getDate() + 14);
            break;
            
          case 'Monthly':
            // Move to the next month
            nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
            // Handle month rollover and adjust for payment day
            const newLastDay = new Date(nextPaymentDate.getFullYear(), nextPaymentDate.getMonth() + 1, 0).getDate();
            nextPaymentDate.setDate(Math.min(paymentDay, newLastDay));
            break;
            
          case 'Every 2 Months':
            nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 2);
            const twoMonthLastDay = new Date(nextPaymentDate.getFullYear(), nextPaymentDate.getMonth() + 1, 0).getDate();
            nextPaymentDate.setDate(Math.min(paymentDay, twoMonthLastDay));
            break;
            
          case 'Quarterly':
            nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 3);
            const quarterlyLastDay = new Date(nextPaymentDate.getFullYear(), nextPaymentDate.getMonth() + 1, 0).getDate();
            nextPaymentDate.setDate(Math.min(paymentDay, quarterlyLastDay));
            break;
            
          case 'Every 6 Months':
            nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 6);
            const sixMonthLastDay = new Date(nextPaymentDate.getFullYear(), nextPaymentDate.getMonth() + 1, 0).getDate();
            nextPaymentDate.setDate(Math.min(paymentDay, sixMonthLastDay));
            break;
            
          case 'Annually':
            nextPaymentDate.setFullYear(nextPaymentDate.getFullYear() + 1);
            const yearlyLastDay = new Date(nextPaymentDate.getFullYear(), nextPaymentDate.getMonth() + 1, 0).getDate();
            nextPaymentDate.setDate(Math.min(paymentDay, yearlyLastDay));
            break;
            
          default:
            console.warn(`Unknown payment frequency: ${formData.rentFrequency}, defaulting to monthly`);
            nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
            break;
        }
      }
      
      // For fixed-term leases, ensure the next payment date doesn't exceed the end date
      if (formData.leaseType === 'fixed' && formData.endDate) {
        const endDate = new Date(formData.endDate);
        if (!isNaN(endDate.getTime()) && nextPaymentDate > endDate) {
          // If next payment would be after the lease ends, set it to the end date
          nextPaymentDate = new Date(endDate);
        }
      }
      
      // Format the date as YYYY-MM-DD for the input field
      const nextPaymentDateStr = nextPaymentDate.toISOString().split('T')[0];
      
      // Update the form state
      setFormData(prev => ({
        ...prev,
        nextPaymentDate: nextPaymentDateStr
      }));
      
    } catch (error) {
      console.error('Error calculating next payment date:', error);
    }
  };

  const validateDateRange = (startDate: string, endDate: string | null) => {
    const newErrors = {...errors};
    
    if (!startDate) {
      newErrors.startDate = "Start date is required";
    } else {
      delete newErrors.startDate;
      
      // Only validate end date for fixed-term leases
      if (formData.leaseType === 'fixed' && endDate) {
        if (!endDate) {
          newErrors.endDate = "End date is required for fixed-term leases";
        } else {
          const start = new Date(startDate);
          const end = new Date(endDate);
          
          if (end <= start) {
            newErrors.endDate = "End date must be after start date";
          } else {
            delete newErrors.endDate;
          }
        }
      } else {
        // For month-to-month, we don't need to validate the end date
        // since it's automatically calculated and not user-editable
        delete newErrors.endDate;
      }
    }
    
    setErrors(newErrors);
  };

  const handleAddCharge = () => {
    setCharges([
      ...charges,
      {
        id: `C${Date.now()}`,
        amount: 0,
        type: 'Utility - Electricity',
        description: ''
      }
    ]);
  };

  const handleRemoveCharge = (id: string) => {
    setCharges(charges.filter(charge => charge.id !== id));
  };

  const handleChargeChange = (id: string, field: keyof LeaseCharge, value: any) => {
    setCharges(charges.map(charge =>
      charge.id === id ? { ...charge, [field]: value } : charge
    ));
  };

  const handleAddTenant = (tenant: Tenant) => {
    setSelectedTenants([tenant]);
    setIsAddTenantOpen(false);
  };

  const handleRemoveTenant = (tenantId: string) => {
    setSelectedTenants([]);
  };

  const handleNextPaymentDateChange = (date: string) => {
    setFormData((prev) => ({
      ...prev,
      nextPaymentDate: date,
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.propertyId) newErrors.propertyId = "Property is required";
    if (!formData.unit) newErrors.unit = "Unit is required";
    if (!formData.leaseType) newErrors.leaseType = "Lease type is required";
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (formData.leaseType === 'fixed' && !formData.endDate) newErrors.endDate = "End date is required";
    if (!formData.rentAmount) newErrors.rentAmount = "Rent amount is required";
    if (!formData.rentFrequency) newErrors.rentFrequency = "Payment frequency is required";
    if (!formData.paymentDay) newErrors.paymentDay = "Payment day is required";
    if (!formData.nextPaymentDate) newErrors.nextPaymentDate = "Next payment date is required";
    
    if (selectedTenants.length === 0) newErrors.tenants = "At least one tenant is required";
    
    const paymentDay = parseInt(formData.paymentDay);
    if (isNaN(paymentDay) || paymentDay < 1 || paymentDay > 31) {
      newErrors.paymentDay = "Payment day must be between 1 and 31";
    }
    
    const rentAmount = parseFloat(formData.rentAmount);
    if (isNaN(rentAmount) || rentAmount <= 0) {
      newErrors.rentAmount = "Rent amount must be greater than 0";
    }

    if (formData.hasDeposit) {
      const depositAmount = parseFloat(formData.depositAmount);
      if (isNaN(depositAmount) || depositAmount < 0) {
        newErrors.depositAmount = "Deposit amount cannot be negative";
      }
    }

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      // Only validate end date relationship for fixed-term leases
      if (formData.leaseType === 'fixed' && endDate <= startDate) {
        newErrors.endDate = "End date must be after start date";
      }
    }

    const allowedFrequencies = ['Daily', 'Weekly', 'Every 2 Weeks', 'Monthly', 'Every 2 Months', 'Quarterly', 'Every 6 Months', 'Annually'];
    if (!allowedFrequencies.includes(formData.rentFrequency)) {
      newErrors.rentFrequency = "Invalid payment frequency";
    }

    if (documents.length === 0) {
      newErrors.documents = "At least one lease document must be uploaded";
    }

    charges.forEach((charge, index) => {
      if (!charge.type) {
        newErrors[`charge_type_${index}`] = "Charge type is required";
      }
      if (!charge.description) {
        newErrors[`charge_description_${index}`] = "Charge description is required";
      }
      if (isNaN(charge.amount) || charge.amount <= 0) {
        newErrors[`charge_amount_${index}`] = "Charge amount must be greater than 0";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const determineLeaseTriggerStatus = (startDate: string, endDate: string | null): 'Active' | 'Pending' | 'Ended' => {
    const currentDate = new Date();
    const start = new Date(startDate);
    
    // For future start dates, status should be 'Pending'
    if (start > currentDate) {
      return 'Pending';
    }
    
    // If there's an end date and we've passed it, status should be 'Ended'
    if (endDate) {
      const end = new Date(endDate);
      if (currentDate > end) {
        return 'Ended';
      }
    }
    
    // Current date is within lease period, status should be 'Active'
    return 'Active';
  };

  const calculatePaymentPeriodsEndDate = (startDateStr: string): string => {
    if (!startDateStr) return '';
    
    try {
      const startDate = new Date(startDateStr);
      if (isNaN(startDate.getTime())) return '';
      
      // Get date one year after start date (e.g., 4/1/2025 -> 3/31/2026)
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1);
      endDate.setDate(endDate.getDate() - 1); // Last day of the year period
      
      // Format as readable date (e.g., "March 31, 2026")
      return endDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      console.error('Error calculating payment periods end date:', error);
      return '';
    }
  };

  const calculateOneYearFromStartDate = (startDateStr: string): string => {
    if (!startDateStr) return '';
    
    try {
      const startDate = new Date(startDateStr);
      if (isNaN(startDate.getTime())) return '';
      
      // Get date one year after start date (e.g., 4/1/2025 -> 3/31/2026)
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1);
      endDate.setDate(endDate.getDate() - 1); // Last day of the year period
      
      // Format as YYYY-MM-DD
      return endDate.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error calculating one year from start date:', error);
      return '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Create a more detailed error message that summarizes the validation issues
      const errorSummary = Object.entries(errors)
        .filter(([key, value]) => value) // Only include fields with error messages
        .map(([key, value]) => {
          // Format the error field names for better readability
          let fieldName = key
            .replace(/([A-Z])/g, ' $1') // Add space before capital letters (camelCase to words)
            .replace(/_/g, ' ') // Replace underscores with spaces
            .replace(/^./, str => str.toUpperCase()); // Capitalize first letter
          
          // Handle special cases for better readability
          if (key.startsWith('charge_')) {
            const parts = key.split('_');
            if (parts.length >= 3) {
              const index = parseInt(parts[2]) + 1; // Add 1 to make it 1-based for user readability
              fieldName = `Additional Charge #${index} ${parts[1]}`;
            }
          }
          
          return `• ${fieldName}: ${value}`;
        })
        .join('\n');

      if (errorSummary) {
        toast.error(
          <div>
            <p><strong>Please fix the following errors:</strong></p>
            <div style={{ marginTop: '8px', textAlign: 'left' }}>{errorSummary}</div>
          </div>,
          { duration: 6000 } // Increase duration so user has time to read all errors
        );
      } else {
        toast.error("Please fix the errors in the form before submitting");
      }
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (!currentUser) {
        toast.error("Lease issuer information is missing");
        return;
      }
      
      const leaseTerms = formData.leaseType === 'fixed' ? 'Fixed Term' : 'Month-to-Month';
      
      const leaseStatus = determineLeaseTriggerStatus(
        formData.startDate, 
        formData.leaseType === 'fixed' ? formData.endDate : calculateOneYearFromStartDate(formData.startDate)
      );
      
      // Calculate one year from start date for month-to-month leases
      const calculatedEndDate = formData.leaseType === 'fixed' 
        ? formData.endDate 
        : calculateOneYearFromStartDate(formData.startDate);

      const databaseLeaseData = {
        unit_id: formData.unit,
        tenant_id: selectedTenants.length > 0 ? selectedTenants[0].id : null,
        start_date: formData.startDate,
        end_date: calculatedEndDate, // Use calculated end date for month-to-month
        rent_amount: formData.rentAmount,
        security_deposit: formData.hasDeposit ? formData.depositAmount : 0,
        status: leaseStatus,
        payment_date: parseInt(formData.paymentDay),
        next_payment_date: formData.nextPaymentDate,
        payment_frequency: formData.leaseType === 'month-to-month' ? 'Monthly' : formData.rentFrequency, // Always Monthly for month-to-month
        lease_issuer_id: currentUser.id,
        signed_date: null,
        roll_over_to_month_to_month: true,
        lease_issuer: {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email
        },
        lease_terms: leaseTerms,
        document_status: formData.documentStatus,
        security_deposit_status: formData.securityDepositStatus,
        rent_payment_status: formData.rentPaymentStatus,
        payment_status: formData.paymentStatus,
        documents: documents.map(doc => ({
          file: doc.file,
          document_status: doc.status,
          document_name: doc.name
        })),
        is_auto_renew: true,
        charges: charges.map(charge => ({
          amount: parseFloat(charge.amount.toString()),
          type: charge.type,
          description: charge.description
        }))
      };
      
      const leaseData = {
        propertyName: selectedProperty?.name || '',
        unit: formData.unit,
        resident: {
          name: selectedTenants.length > 0 ? selectedTenants[0].name : '',
          imageUrl: null,
          email: selectedTenants.length > 0 ? selectedTenants[0].email : '',
        },
        startDate: formData.startDate,
        endDate: formData.endDate || formData.startDate,
        rentAmount: parseFloat(formData.rentAmount),
        securityDeposit: formData.hasDeposit ? parseFloat(formData.depositAmount) : 0,
        status: leaseStatus,
        nextPaymentDate: formData.nextPaymentDate,
        leaseStatus: leaseStatus,
        paymentFrequency: formData.rentFrequency,
        paymentDay: parseInt(formData.paymentDay),
        charges: charges,
        documents: documents.map(doc => ({
          id: doc.id,
          document_url: doc.url || '',
          document_status: doc.status,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          document_name: doc.name
        })),
        leaseIssuer: {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email
        }
      };
      
      await onSubmit(leaseData, databaseLeaseData);
      toast.success("Lease created successfully!");
    } catch (error: any) {
      console.error("Error creating lease:", error);
      
      if (error.message && error.message.includes('no_overlapping_leases')) {
        toast.error("This unit already has an active lease for the selected date range");
      } else if (error.message && error.message.includes('valid_lease_dates')) {
        toast.error("Lease end date must be after the start date");
      } else if (error.message && error.message.includes('document_status_check')) {
        toast.error("Invalid document status");
      } else if (error.message && error.message.includes('payment_frequency_check')) {
        toast.error("Invalid payment frequency");
      } else {
        toast.error("Failed to create lease. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/leases')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#2C3539]" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#2C3539]">Add New Lease</h1>
          <p className="text-[#6B7280] mt-1">Create a new lease agreement</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-[#2C3539] mb-4">Property Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#2C3539] mb-2">
                Property
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                value={selectedProperty?.id || ''}
                onChange={(e) => {
                  const property = properties.find(p => p.id === e.target.value);
                  setSelectedProperty(property || null);
                  setFormData(prev => ({ ...prev, propertyId: e.target.value, unit: '' }));
                }}
                required
              >
                <option value="">Select a property</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </select>
              {errors.propertyId && <p className="text-xs text-red-500 mt-1">{errors.propertyId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2C3539] mb-2">
                Unit
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                value={formData.unit}
                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                required
                disabled={!selectedProperty}
              >
                <option value="">Select a unit</option>
                {selectedProperty?.units
                  ?.filter(unit => unit.isAvailable)
                  .map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      Unit {unit.number}
                    </option>
                  ))}
              </select>
              {errors.unit && <p className="text-xs text-red-500 mt-1">{errors.unit}</p>}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-[#2C3539] mb-4">Lease Term</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <button
                type="button"
                className={clsx(
                  'flex-1 py-2 px-4 rounded-lg font-medium',
                  formData.leaseType === 'fixed'
                    ? 'bg-[#2C3539] text-white'
                    : 'bg-gray-100 text-[#2C3539]'
                )}
                onClick={() => setFormData(prev => ({ ...prev, leaseType: 'fixed' }))}
              >
                Fixed Term
              </button>
              <button
                type="button"
                className={clsx(
                  'flex-1 py-2 px-4 rounded-lg font-medium',
                  formData.leaseType === 'month-to-month'
                    ? 'bg-[#2C3539] text-white'
                    : 'bg-gray-100 text-[#2C3539]'
                )}
                onClick={() => setFormData(prev => ({ ...prev, leaseType: 'month-to-month', rentFrequency: 'Monthly' }))}
              >
                Month-to-Month
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#2C3539] mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  className={`w-full px-4 py-2 border ${errors.startDate ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]`}
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  required
                />
                {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2C3539] mb-2">
                  End Date
                </label>
                {formData.leaseType === 'fixed' ? (
                  <>
                    <input
                      type="date"
                      className={`w-full px-4 py-2 border ${errors.endDate ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]`}
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      required
                    />
                    {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>}
                  </>
                ) : (
                  <>
                    <input
                      type="date"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50"
                      value={formData.startDate ? new Date(new Date(formData.startDate).setFullYear(new Date(formData.startDate).getFullYear() + 1)).toISOString().split('T')[0] : ''}
                      disabled
                    />
                    {formData.startDate && (
                      <div className="mt-2 text-gray-600">
                        <span className="text-xs">
                          <strong>Note:</strong> Payment periods will be calculated through <strong>{calculatePaymentPeriodsEndDate(formData.startDate)}</strong>. The lease will need to be renewed at that time.
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-[#2C3539]">Tenant</h2>
            <button
              type="button"
              onClick={() => setIsAddTenantOpen(true)}
              className="flex items-center px-4 py-2 text-sm bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c]"
            >
              <Plus className="w-4 h-4 mr-2" />
              {selectedTenants.length > 0 ? 'Change Tenant' : 'Add Tenant'}
            </button>
          </div>

          <div>
            {selectedTenants.length > 0 ? (
              <div
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-[#2C3539]">{selectedTenants[0].name}</p>
                    <p className="text-xs text-gray-500">{selectedTenants[0].email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveTenant(selectedTenants[0].id)}
                  className="p-2 text-gray-400 hover:text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="p-4 border border-dashed border-gray-200 rounded-lg text-center">
                <p className="text-sm text-gray-500">No tenant selected. Please add a tenant to continue.</p>
              </div>
            )}
            {errors.tenants && <p className="text-xs text-red-500 mt-1">{errors.tenants}</p>}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-[#2C3539] mb-4">Lease Issuer</h2>
          <div>
            {currentUser ? (
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-[#2C3539]">{currentUser.name}</p>
                  <p className="text-xs text-gray-500">{currentUser.email}</p>
                </div>
              </div>
            ) : (
              <div className="flex justify-center p-3">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-[#2C3539] rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-[#2C3539]">Payment Details</h2>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#2C3539] mb-2">
                  Rent Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    <DollarSign className="w-4 h-4" />
                  </span>
                  <input
                    type="number"
                    className="w-full pl-10 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                    value={formData.rentAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, rentAmount: e.target.value }))}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                  {errors.rentAmount && <p className="text-xs text-red-500 mt-1">{errors.rentAmount}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2C3539] mb-2">
                  Payment Cycle
                </label>
                <select
                  className={`w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539] ${
                    formData.leaseType === 'month-to-month' ? 'bg-gray-100' : ''
                  }`}
                  value={formData.rentFrequency}
                  onChange={(e) => {
                    // Only allow changing frequency for fixed-term leases
                    if (formData.leaseType === 'fixed') {
                      const newFrequency = e.target.value as any;
                      setFormData(prev => ({ ...prev, rentFrequency: newFrequency }));
                    }
                  }}
                  disabled={formData.leaseType === 'month-to-month'}
                  required
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Every 6 Months">Every 6 Months</option>
                  <option value="Annually">Annually</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Every 2 Weeks">Every 2 Weeks</option>
                  <option value="Daily">Daily</option>
                  <option value="Every 2 Months">Every 2 Months</option>
                </select>
                {formData.leaseType === 'month-to-month' && (
                  <p className="text-xs text-gray-500 mt-1">Month-to-month leases must use Monthly payment cycle</p>
                )}
                {errors.rentFrequency && <p className="text-xs text-red-500 mt-1">{errors.rentFrequency}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#2C3539] mb-2">
                  Payment Day <span className="text-xs text-gray-500">(of each month)</span>
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                  value={formData.paymentDay}
                  onChange={(e) => {
                    // Always update the form data with the typed value
                    setFormData(prev => ({ ...prev, paymentDay: e.target.value }));
                    
                    // No need for setTimeout here - useEffect will handle recalculation
                    // when the formData.paymentDay state is updated
                  }}
                  onBlur={(e) => {
                    // On blur, ensure the value is within valid range
                    const value = e.target.value;
                    const day = parseInt(value);
                    if (isNaN(day) || day < 1 || day > 31) {
                      // If invalid, reset to a default value
                      setFormData(prev => ({ ...prev, paymentDay: '1' }));
                    }
                  }}
                  min="1"
                  max="31"
                  required
                />
                {errors.paymentDay && <p className="text-xs text-red-500 mt-1">{errors.paymentDay}</p>}
                <p className="text-xs text-gray-500 mt-1">
                  Enter a day between 1-31
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2C3539] mb-2">
                  Next Payment Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50"
                  value={formData.nextPaymentDate}
                  readOnly
                  disabled
                />
                {errors.nextPaymentDate && <p className="text-xs text-red-500 mt-1">{errors.nextPaymentDate}</p>}
                <p className="text-xs text-gray-500 mt-1">
                  Automatically calculated based on payment day and frequency
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-[#2C3539]">Additional Charges</h2>
              <button
                type="button"
                onClick={handleAddCharge}
                className="flex items-center px-4 py-2 text-sm bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Charge
              </button>
            </div>

            <div className="space-y-4">
              {charges.length === 0 && (
                <p className="text-sm text-gray-500 italic mb-4">
                  Add additional charges like utilities, service fees, or maintenance costs that will be billed along with the rent.
                </p>
              )}
              
              {charges.map((charge, index) => (
                <div key={charge.id} className="flex gap-4 items-start">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                      value={charge.type}
                      onChange={(e) => handleChargeChange(charge.id, 'type', e.target.value)}
                      required
                    >
                      <option value="Utility - Electricity">Utility - Electricity</option>
                      <option value="Utility - Water">Utility - Water</option>
                      <option value="Utility - Gas">Utility - Gas</option>
                      <option value="Utility - Internet">Utility - Internet</option>
                      <option value="Service Fee - Property Management">Service Fee - Property Management</option>
                      <option value="Service Fee - Cleaning">Service Fee - Cleaning</option>
                      <option value="Service Fee - Security">Service Fee - Security</option>
                      <option value="Maintenance - Plumbing">Maintenance - Plumbing</option>
                      <option value="Maintenance - Electrical">Maintenance - Electrical</option>
                      <option value="Maintenance - HVAC">Maintenance - HVAC</option>
                      <option value="Maintenance - General Repairs">Maintenance - General Repairs</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors[`charge_type_${index}`] && <p className="text-xs text-red-500 mt-1">{errors[`charge_type_${index}`]}</p>}
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        <DollarSign className="w-4 h-4" />
                      </span>
                      <input
                        type="number"
                        placeholder="Amount"
                        className="w-full pl-10 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                        value={charge.amount || ''}
                        onChange={(e) => handleChargeChange(charge.id, 'amount', parseFloat(e.target.value))}
                        required
                        min="0"
                        step="0.01"
                      />
                      {errors[`charge_amount_${index}`] && <p className="text-xs text-red-500 mt-1">{errors[`charge_amount_${index}`]}</p>}
                    </div>
                    <input
                      type="text"
                      placeholder="Description"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                      value={charge.description}
                      onChange={(e) => handleChargeChange(charge.id, 'description', e.target.value)}
                      required
                    />
                    {errors[`charge_description_${index}`] && <p className="text-xs text-red-500 mt-1">{errors[`charge_description_${index}`]}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCharge(charge.id)}
                    className="p-2 text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-[#2C3539] mb-4">Security Deposit</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-[#2C3539]">Is there a security deposit?</span>
              <div className="flex gap-4">
                <button
                  type="button"
                  className={clsx(
                    'px-4 py-2 rounded-lg text-sm font-medium',
                    formData.hasDeposit
                      ? 'bg-[#2C3539] text-white'
                      : 'bg-gray-100 text-[#2C3539]'
                  )}
                  onClick={() => setFormData(prev => ({ ...prev, hasDeposit: true }))}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className={clsx(
                    'px-4 py-2 rounded-lg text-sm font-medium',
                    !formData.hasDeposit
                      ? 'bg-[#2C3539] text-white'
                      : 'bg-gray-100 text-[#2C3539]'
                  )}
                  onClick={() => setFormData(prev => ({ ...prev, hasDeposit: false, depositAmount: '' }))}
                >
                  No
                </button>
              </div>
            </div>

            {formData.hasDeposit && (
              <div>
                <label className="block text-sm font-medium text-[#2C3539] mb-2">
                  Deposit Amount
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                  value={formData.depositAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, depositAmount: e.target.value }))}
                  required={formData.hasDeposit}
                />
                {errors.depositAmount && <p className="text-xs text-red-500 mt-1">{errors.depositAmount}</p>}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-[#2C3539] mb-4">Lease Documents</h2>
          
          <div className="space-y-4">
            {documents.length > 0 ? (
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">Uploaded Documents:</p>
                  <span className="text-xs bg-green-100 text-green-800 py-1 px-2 rounded-full">
                    {documents.length} document{documents.length !== 1 ? 's' : ''} uploaded
                  </span>
                </div>
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <File className="w-5 h-5 text-[#2C3539] mr-3" />
                      <div>
                        <p className="text-sm font-medium text-[#2C3539]">{doc.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <select
                            className={`text-xs rounded px-2 py-1 border ${
                              doc.status === 'Signed' 
                                ? 'bg-green-50 text-green-800 border-green-200' 
                                : doc.status === 'No signature required'
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : 'bg-gray-50 text-gray-800 border-gray-200'
                            }`}
                            value={doc.status}
                            onChange={(e) => {
                              const newStatus = e.target.value as 'Signed' | 'Not Signed' | 'No signature required';
                              setDocuments(documents.map(d => 
                                d.id === doc.id ? { ...d, status: newStatus } : d
                              ));
                            }}
                          >
                            <option value="Signed">Signed</option>
                            <option value="Not Signed">Not Signed</option>
                            <option value="No signature required">No signature required</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDocuments(documents.filter(d => d.id !== doc.id))}
                      className="p-1 text-gray-400 hover:text-gray-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`p-4 rounded-lg ${errors.documents ? 'bg-red-50' : 'bg-gray-50'} flex flex-col items-center justify-center text-center`}>
                <File className={`w-8 h-8 mb-2 ${errors.documents ? 'text-red-400' : 'text-gray-400'}`} />
                <p className={`text-sm ${errors.documents ? 'text-red-800' : 'text-gray-500'}`}>
                  No documents uploaded yet
                </p>
                {errors.documents && (
                  <p className="text-xs text-red-600 mt-1 font-medium">
                    {errors.documents}
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-center">
              <button
                type="button"
                className={`flex items-center px-6 py-3 text-sm ${errors.documents ? 'bg-red-600 hover:bg-red-700' : 'bg-[#2C3539] hover:bg-[#3d474c]'} text-white rounded-lg transition-colors`}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.multiple = true;
                  input.accept = '.pdf,.doc,.docx';
                  input.onchange = (e) => {
                    const files = (e.target as HTMLInputElement).files;
                    if (files && files.length > 0) {
                      const newDocs: LeaseDocument[] = [];
                      
                      Array.from(files).forEach(file => {
                        newDocs.push({
                          id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                          file: file,
                          name: file.name,
                          status: 'Not Signed',
                          url: URL.createObjectURL(file)
                        });
                      });
                      
                      setDocuments([...documents, ...newDocs]);
                      
                      // Clear document error when documents are added
                      if (errors.documents) {
                        const newErrors = {...errors};
                        delete newErrors.documents;
                        setErrors(newErrors);
                      }
                    }
                  };
                  input.click();
                }}
              >
                <Upload className="w-4 h-4 mr-2" />
                {documents.length > 0 ? 'Add More Documents' : 'Upload Required Documents'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center px-6 py-3 text-sm text-[#2C3539] border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex items-center px-8 py-3 text-sm bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Lease...
              </>
            ) : (
              'Create Lease'
            )}
          </button>
        </div>
      </form>

      <AddTenantDialog
        isOpen={isAddTenantOpen}
        onClose={() => setIsAddTenantOpen(false)}
        onAddTenant={handleAddTenant}
        existingTenants={tenants}
        onSelectExisting={handleAddTenant}
      />
    </div>
  );
}
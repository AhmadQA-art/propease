import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, DollarSign, File } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '../config/supabase';
import { toast } from 'react-hot-toast';
import clsx from 'clsx';

interface LeaseIssuer {
  id: string;
  name: string;
  email?: string;
}

interface LeaseDocument {
  id: string;
  file?: File;
  name: string;
  status: 'Signed' | 'Not Signed' | 'No signature required';
  url?: string;
  document_url?: string;
  document_status?: string;
  created_at?: string;
  updated_at?: string;
}

interface Property {
  id: string;
  name: string;
  units: { id: string; unit_number: string }[];
}

interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  imageUrl: string | null;
}

interface LeaseCharge {
  id: string;
  amount: number;
  description: string;
  type: string;
  charge_status?: string;
  created_at?: string;
  updated_at?: string;
}

interface EditLeaseFormProps {
  isOpen: boolean;
  onClose: () => void;
  leaseId: string | null;
  onLeaseUpdated: () => void;
}

export default function EditLeaseDrawer({ isOpen, onClose, leaseId, onLeaseUpdated }: EditLeaseFormProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenants, setSelectedTenants] = useState<Tenant[]>([]);
  const [issuers, setIssuers] = useState<LeaseIssuer[]>([]);
  const [charges, setCharges] = useState<LeaseCharge[]>([]);
  const [documents, setDocuments] = useState<LeaseDocument[]>([]);
  const [deletedDocuments, setDeletedDocuments] = useState<string[]>([]); // Track IDs of documents to delete
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [formData, setFormData] = useState({
    propertyId: '',
    propertyName: '',
    unit: '',
    unitName: '',
    leaseType: 'fixed' as 'fixed' | 'month-to-month',
    startDate: '',
    endDate: '',
    rentAmount: '',
    depositAmount: '',
    paymentFrequency: 'Monthly' as 'Daily' | 'Weekly' | 'Every 2 Weeks' | 'Monthly' | 'Every 2 Months' | 'Quarterly' | 'Every 6 Months' | 'Annually',
    paymentDay: '1',
    leaseIssuerId: '',
    leaseIssuerName: '',
  });

  // Format document status
  const formatDocumentStatus = (status: string): 'Signed' | 'Not Signed' | 'No signature required' => {
    // Convert database status to one of the allowed values
    if (!status) return 'Not Signed';
    
    status = status.trim();
    
    // Check for exact matches first
    if (status === 'Signed' || status === 'Not Signed' || status === 'No signature required') {
      return status as 'Signed' | 'Not Signed' | 'No signature required';
    }
    
    // Handle other possible formats
    const statusLower = status.toLowerCase();
    if (statusLower === 'signed') return 'Signed';
    if (statusLower === 'not_signed' || statusLower === 'not signed') return 'Not Signed';
    if (statusLower === 'no_signature_required' || statusLower === 'no signature required') return 'No signature required';
    
    // Default fallback
    return 'Not Signed';
  };

  // Fetch lease data when the drawer opens
  useEffect(() => {
    if (isOpen && leaseId) {
      fetchLeaseData();
      fetchProperties();
      fetchTenants();
      fetchIssuers();
    }
  }, [isOpen, leaseId]);

  // Debug effect to monitor formData changes
  useEffect(() => {
    console.log("🔄 [EditLeaseDrawer] Form data updated:", JSON.stringify({
      leaseType: formData.leaseType,
      startDate: formData.startDate,
      endDate: formData.endDate
    }, null, 2));
  }, [formData]);

  // Fetch the lease data
  const fetchLeaseData = async () => {
    try {
      setIsLoading(true);
      console.log("🔍 Fetching lease data for ID:", leaseId);

      // First, fetch the lease data
      const { data: leaseData, error: leaseError } = await supabase
        .from('leases')
        .select('*')
        .eq('id', leaseId)
        .single();

      if (leaseError) {
        console.error('Error fetching lease data:', leaseError);
        toast.error('Failed to load lease details');
        return;
      }

      console.log("📋 Raw lease data from database:", JSON.stringify(leaseData, null, 2));

      // Fetch the unit data separately
      const { data: unitData, error: unitError } = await supabase
        .from('units')
        .select('*, property:properties(*)')
        .eq('id', leaseData.unit_id)
        .single();

      if (unitError) {
        console.error('Error fetching unit data:', unitError);
      }

      // Fetch tenant data
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', leaseData.tenant_id)
        .single();

      if (tenantError) {
        console.error('Error fetching tenant data:', tenantError);
      }

      // Fetch lease issuer data
      const { data: issuerData, error: issuerError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', leaseData.lease_issuer_id)
        .single();

      if (issuerError) {
        console.error('Error fetching lease issuer data:', issuerError);
      }

      // Fetch lease documents
      const { data: docsData, error: docsError } = await supabase
        .from('lease_documents')
        .select('*')
        .eq('lease_id', leaseId);

      if (docsError) {
        console.error('Error fetching lease documents:', docsError);
      }

      // Fetch lease charges
      const { data: chargesData, error: chargesError } = await supabase
        .from('lease_charges')
        .select('*')
        .eq('lease_id', leaseId);

      if (chargesError) {
        console.error('Error fetching lease charges:', chargesError);
      } else {
        setCharges(chargesData || []);
      }

      // Format tenant data
      const formattedTenant = tenantData ? {
        id: tenantData.id,
        name: `${tenantData.first_name || ''} ${tenantData.last_name || ''}`.trim(),
        email: tenantData.email || '',
        phone: tenantData.phone || '',
      } : null;

      // Format document data
      const formattedDocuments = (docsData || []).map((doc: any) => ({
        id: doc.id,
        name: doc.filename || extractFilenameFromUrl(doc.file_url || doc.document_url || ''),
        url: doc.file_url || doc.document_url || '',
        status: formatDocumentStatus(doc.status || doc.document_status || 'Not Signed'),
        uploadDate: doc.created_at ? format(new Date(doc.created_at), 'MMM dd, yyyy') : '',
      }));

      // Set unit and property info
      const propertyData = unitData?.property || null;
      const unitInfo = unitData || { id: '', unit_number: '' };

      // Determine lease type based on lease_terms field first, then fall back to end_date check
      let leaseType = 'fixed'; // Default to fixed
      
      if (leaseData.lease_terms) {
        // If lease_terms is available, use it as the primary indicator
        leaseType = leaseData.lease_terms.toLowerCase().includes('month') ? 'month-to-month' : 'fixed';
        console.log("🏠 Lease type determined from lease_terms:", leaseData.lease_terms, "->", leaseType);
      } else {
        // Fall back to end_date check if lease_terms is not available
        leaseType = leaseData.end_date ? 'fixed' : 'month-to-month';
        console.log("🏠 Lease type determined from end_date:", leaseData.end_date, "->", leaseType);
      }
      
      // Calculate a nominal end date for month-to-month leases (12 months from start date)
      let displayEndDate = '';
      
      if (leaseType === 'month-to-month' && leaseData.start_date) {
        try {
          // Use start date to calculate a nominal 12-month end date for UI only
          const startDate = new Date(leaseData.start_date);
          console.log("🗓️ Calculating nominal end date from start date:", leaseData.start_date);
          
          if (!isNaN(startDate.getTime())) {
            const endDate = new Date(startDate);
            endDate.setFullYear(endDate.getFullYear() + 1);
            displayEndDate = format(endDate, 'yyyy-MM-dd');
            console.log("🗓️ Calculated 12-month nominal end date:", displayEndDate);
          } else {
            console.warn("⚠️ Invalid start date format:", leaseData.start_date);
          }
        } catch (error) {
          console.error("❌ Error calculating nominal end date:", error);
        }
        
        if (!displayEndDate) {
          console.warn("⚠️ Could not calculate nominal end date, using fallback");
          // Fallback to today + 12 months if calculation failed
          const today = new Date();
          const fallbackEndDate = new Date(today);
          fallbackEndDate.setFullYear(fallbackEndDate.getFullYear() + 1);
          displayEndDate = format(fallbackEndDate, 'yyyy-MM-dd');
          console.log("🗓️ Using fallback end date:", displayEndDate);
        }
      } else if (leaseData.end_date) {
        // For fixed-term leases, use the actual end date
        displayEndDate = format(new Date(leaseData.end_date), 'yyyy-MM-dd');
        console.log("🗓️ Using actual end date for fixed-term lease:", displayEndDate);
      } else {
        console.log("⚠️ No end date available for fixed-term lease");
      }
      
      // Convert lease data to form data
      setFormData({
        propertyId: propertyData?.id || '',
        propertyName: propertyData?.name || 'Unknown Property',
        unit: unitInfo.id || '',
        unitName: unitInfo.unit_number || 'Unknown Unit',
        leaseType: leaseType,
        startDate: leaseData.start_date ? format(new Date(leaseData.start_date), 'yyyy-MM-dd') : '',
        endDate: displayEndDate, // Use calculated end date for month-to-month leases
        rentAmount: leaseData.rent_amount ? leaseData.rent_amount.toString() : '',
        depositAmount: leaseData.security_deposit ? leaseData.security_deposit.toString() : '',
        paymentFrequency: leaseData.payment_frequency || 'Monthly',
        paymentDay: leaseData.payment_date ? leaseData.payment_date.toString() : '1',
        leaseIssuerId: issuerData?.id || '',
        leaseIssuerName: issuerData ? `${issuerData.first_name || ''} ${issuerData.last_name || ''}`.trim() : 'Unknown Issuer',
      });

      console.log("📝 Setting form data:", JSON.stringify({
        leaseType: leaseType,
        endDate: leaseData.end_date,
        formattedEndDate: leaseData.end_date ? format(new Date(leaseData.end_date), 'yyyy-MM-dd') : ''
      }));

      setSelectedTenants([formattedTenant]);
      setDocuments(formattedDocuments);

    } catch (error) {
      console.error('Error fetching lease data:', error);
      toast.error('Failed to load lease details');
    } finally {
      setIsLoading(false);
    }
  };

  // Extract filename from URL
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

      return filename;
    } catch (error) {
      console.error('Error extracting filename from URL:', error);
      return 'Document';
    }
  };

  // Fetch properties data
  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          id,
          name,
          units (id, unit_number)
        `);

      if (error) {
        console.error('Error fetching properties:', error);
        return;
      }

      if (data) {
        setProperties(data);

        // If we have form data with a property ID, select that property
        if (formData.propertyId) {
          const property = data.find(p => p.id === formData.propertyId);
          if (property) {
            setSelectedProperty(property);
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Fetch tenants data
  const fetchTenants = async () => {
    try {
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
    }
  };

  // Fetch issuers data
  const fetchIssuers = async () => {
    try {
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
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Handle lease type change with proper end date calculation
  const handleLeaseTypeChange = (newLeaseType: string) => {
    console.log("🔄 [EditLeaseDrawer] Lease type changing to:", newLeaseType);
    
    if (newLeaseType === 'month-to-month') {
      // For month-to-month leases, calculate a nominal 12-month end date
      let calculatedEndDate = '';
      
      try {
        if (formData.startDate) {
          // Parse the start date
          const startDate = new Date(formData.startDate);
          console.log("🗓️ [EditLeaseDrawer] Calculating end date from start date:", formData.startDate);
          
          if (!isNaN(startDate.getTime())) {
            // Create a date exactly 12 months in the future
            const endDate = new Date(startDate);
            endDate.setFullYear(endDate.getFullYear() + 1);
            calculatedEndDate = format(endDate, 'yyyy-MM-dd');
            console.log("🗓️ [EditLeaseDrawer] Calculated 12-month nominal end date:", calculatedEndDate);
          } else {
            console.warn("⚠️ [EditLeaseDrawer] Invalid start date for calculating end date");
          }
        } else {
          console.warn("⚠️ [EditLeaseDrawer] No start date available for calculating end date");
        }
      } catch (error) {
        console.error("❌ [EditLeaseDrawer] Error calculating end date:", error);
      }
      
      // Set a default end date 12 months from today if calculation failed
      if (!calculatedEndDate) {
        const today = new Date();
        const defaultEndDate = new Date(today);
        defaultEndDate.setFullYear(defaultEndDate.getFullYear() + 1);
        calculatedEndDate = format(defaultEndDate, 'yyyy-MM-dd');
        console.log("🗓️ [EditLeaseDrawer] Using default end date:", calculatedEndDate);
      }
      
      setFormData(prev => ({
        ...prev,
        leaseType: newLeaseType,
        paymentFrequency: 'Monthly',
        endDate: calculatedEndDate // Set a UI-only end date
      }));
    } else {
      // For fixed-term leases, keep the end date as is or clear it if it's empty
      setFormData(prev => ({
        ...prev,
        leaseType: newLeaseType
      }));
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Special handling for lease type changes
    if (name === 'leaseType') {
      handleLeaseTypeChange(value);
    } else if (name === 'startDate') {
      // If start date changes and lease type is month-to-month, recalculate end date
      if (formData.leaseType === 'month-to-month' && value) {
        try {
          const startDate = new Date(value);
          console.log("🗓️ [EditLeaseDrawer] Start date changed to:", value);
          
          if (!isNaN(startDate.getTime())) {
            const endDate = new Date(startDate);
            endDate.setFullYear(endDate.getFullYear() + 1);
            const calculatedEndDate = format(endDate, 'yyyy-MM-dd');
            console.log("🗓️ [EditLeaseDrawer] Recalculated end date based on new start date:", calculatedEndDate);
            
            setFormData(prev => ({
              ...prev,
              startDate: value,
              endDate: calculatedEndDate
            }));
          } else {
            console.warn("⚠️ [EditLeaseDrawer] Invalid start date entered");
            setFormData(prev => ({
              ...prev,
              startDate: value
            }));
          }
        } catch (error) {
          console.error("❌ [EditLeaseDrawer] Error recalculating end date:", error);
          setFormData(prev => ({
            ...prev,
            startDate: value
          }));
        }
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear any error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🚀 Submitting form with data:", JSON.stringify(formData, null, 2));

    // Validate form data
    const validationErrors: Record<string, string> = {};
    if (!formData.startDate) validationErrors.startDate = 'Start date is required';
    if (formData.leaseType === 'fixed' && !formData.endDate) validationErrors.endDate = 'End date is required';
    if (!formData.rentAmount || parseFloat(formData.rentAmount) <= 0) validationErrors.rentAmount = 'Valid rent amount is required';
    if (formData.depositAmount && parseFloat(formData.depositAmount) < 0) validationErrors.depositAmount = 'Security deposit must be a positive number';
    if (!formData.paymentDay || parseInt(formData.paymentDay) < 1 || parseInt(formData.paymentDay) > 31) validationErrors.paymentDay = 'Payment day must be between 1 and 31';

    // Validate charges
    charges.forEach((charge, index) => {
      if (!charge.type) {
        validationErrors[`charge_type_${index}`] = "Charge type is required";
      }
      if (!charge.description) {
        validationErrors[`charge_description_${index}`] = "Charge description is required";
      }
      if (isNaN(charge.amount) || charge.amount <= 0) {
        validationErrors[`charge_amount_${index}`] = "Charge amount must be greater than 0";
      }
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix the form errors before submitting');
      return;
    }

    try {
      setIsSubmitting(true);

      // Format data for database update - focusing only on lease terms and payment details
      const leaseUpdateData = {
        start_date: formData.startDate,
        end_date: formData.leaseType === 'month-to-month' ? null : formData.endDate, // Still store null in DB for month-to-month
        lease_terms: formData.leaseType === 'month-to-month' ? 'Month-to-Month' : 'Fixed Term',
        payment_frequency: formData.leaseType === 'month-to-month' ? 'Monthly' : formData.paymentFrequency,
        payment_date: parseInt(formData.paymentDay) || 1,
        security_deposit: parseFloat(formData.depositAmount) || 0,
        rent_amount: parseFloat(formData.rentAmount) || 0,
        updated_at: new Date().toISOString()
      };

      console.log("📊 Updating lease with data:", JSON.stringify(leaseUpdateData, null, 2));
      console.log("📅 End date in form:", formData.endDate);
      console.log("📅 End date in DB update:", leaseUpdateData.end_date);

      // Update the lease record
      const { error: updateError } = await supabase
        .from('leases')
        .update(leaseUpdateData)
        .eq('id', leaseId);

      if (updateError) {
        console.error('Error updating lease:', updateError);
        toast.error('Failed to update lease: ' + updateError.message);
        setIsSubmitting(false);
        return;
      }

      // Handle charges - first delete existing ones
      const { error: deleteChargesError } = await supabase
        .from('lease_charges')
        .delete()
        .eq('lease_id', leaseId);
        
      if (deleteChargesError) {
        console.error('Error deleting existing charges:', deleteChargesError);
        toast.error('Failed to update lease charges: ' + deleteChargesError.message);
        setIsSubmitting(false);
        return;
      }

      // Insert new charges if there are any
      if (charges.length > 0) {
        const chargesData = charges.map(charge => ({
          lease_id: leaseId,
          type: charge.type,
          description: charge.description,
          amount: charge.amount,
          charge_status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        
        const { error: insertChargesError } = await supabase
          .from('lease_charges')
          .insert(chargesData);
          
        if (insertChargesError) {
          console.error('Error inserting charges:', insertChargesError);
          toast.error('Failed to add lease charges: ' + insertChargesError.message);
          setIsSubmitting(false);
          return;
        }
      }

      // Delete documents marked for deletion
      if (deletedDocuments.length > 0) {
        for (const docId of deletedDocuments) {
          // First, try to get the document to find its storage path
          const { data: docData, error: fetchError } = await supabase
            .from('lease_documents')
            .select('document_url')
            .eq('id', docId)
            .single();
            
          if (fetchError) {
            console.error('Error fetching document for deletion:', fetchError);
            documentError = true;
          } else if (docData?.document_url) {
            // Extract the path from the URL
            try {
              const url = new URL(docData.document_url);
              const pathMatch = url.pathname.match(/\/object\/public\/(.+)/);
              if (pathMatch && pathMatch[1]) {
                const storagePath = decodeURIComponent(pathMatch[1]);
                
                // Delete the file from storage
                const { error: storageError } = await supabase.storage
                  .from('lease-documents')
                  .remove([storagePath]);
                  
                if (storageError) {
                  console.error('Error deleting document from storage:', storageError);
                  // Continue with database deletion even if storage deletion fails
                }
              }
            } catch (error) {
              console.error('Error parsing document URL:', error);
              // Continue with database deletion even if URL parsing fails
            }
          }
          
          // Delete the document record from the database
          const { error: deleteError } = await supabase
            .from('lease_documents')
            .delete()
            .eq('id', docId);
            
          if (deleteError) {
            console.error('Error deleting document record:', deleteError);
            documentError = true;
          }
        }
      }

      // Handle document uploads and status updates
      let documentError = false;
      
      // Validate document statuses before submission
      const validStatuses = ['Signed', 'Not Signed', 'No signature required'];
      const invalidDocs = documents.filter(doc => !validStatuses.includes(doc.status));
      
      if (invalidDocs.length > 0) {
        console.error('Invalid document status detected:', invalidDocs);
        toast.error('Invalid document status detected. Please refresh and try again.');
        setIsSubmitting(false);
        return;
      }
      
      // Handle new document uploads if any
      for (const doc of documents) {
        if (doc.file) {
          // This is a new document to upload
          const fileName = `${Date.now()}_${doc.file.name}`;
          const filePath = `lease-documents/${leaseId}/${fileName}`;

          // Upload the file
          const { error: uploadError } = await supabase.storage
            .from('lease-documents')
            .upload(filePath, doc.file);

          if (uploadError) {
            console.error('Error uploading document:', uploadError);
            documentError = true;
            continue;
          }

          // Get the public URL
          const { data: urlData } = supabase.storage
            .from('lease-documents')
            .getPublicUrl(filePath);

          if (!urlData.publicUrl) {
            console.error('Could not get public URL for uploaded document');
            documentError = true;
            continue;
          }

          // Insert document record - use exact status values required by the database constraint
          const { error: insertDocError } = await supabase
            .from('lease_documents')
            .insert({
              lease_id: leaseId,
              document_url: urlData.publicUrl,
              document_status: doc.status, // Use the exact status without transformation
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (insertDocError) {
            console.error('Error inserting document record:', insertDocError, doc.status);
            documentError = true;
          }
        } else {
          // This is an existing document to update - use exact status values required by the database constraint
          const { error: updateDocError } = await supabase
            .from('lease_documents')
            .update({
              document_status: doc.status, // Use the exact status without transformation
              updated_at: new Date().toISOString()
            })
            .eq('id', doc.id);

          if (updateDocError) {
            console.error('Error updating document status:', updateDocError, doc.status);
            documentError = true;
          }
        }
      }

      // Ensure we get a small delay for database consistency before triggering the refresh
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (documentError) {
        toast.warning('Lease updated but some document changes failed');
      } else {
        toast.success('Lease updated successfully');
      }
      
      // Notify parent that lease was updated and close drawer
      onLeaseUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating lease:', error);
      toast.error('Failed to update lease. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Handle document upload
  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newDocuments = Array.from(e.target.files).map(file => ({
        id: `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        file,
        name: file.name,
        status: 'Not Signed' as 'Signed' | 'Not Signed' | 'No signature required'
      }));

      setDocuments(prev => [...prev, ...newDocuments]);
    }
  };

  // Handle document status change
  const handleDocumentStatusChange = (docId: string, status: 'Signed' | 'Not Signed' | 'No signature required') => {
    console.log(`Changing document ${docId} status to: ${status}`);
    setDocuments(prev =>
      prev.map(doc =>
        doc.id === docId ? { ...doc, status } : doc
      )
    );
  };

  // Handle document removal
  const handleRemoveDocument = (docId: string) => {
    // If it's an existing document (has an ID that's not temporary), add to deleted list
    const docToRemove = documents.find(doc => doc.id === docId);
    if (docToRemove && !docId.startsWith('temp_')) {
      setDeletedDocuments(prev => [...prev, docId]);
    }
    
    // Remove from UI
    setDocuments(prev => prev.filter(doc => doc.id !== docId));
  };

  // Handle charge change
  const handleChargeChange = (id: string, field: string, value: any) => {
    setCharges(prev =>
      prev.map(charge =>
        charge.id === id ? { ...charge, [field]: value } : charge
      )
    );
  };

  // Handle adding a new charge
  const handleAddCharge = () => {
    const newCharge: LeaseCharge = {
      id: `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      type: '',
      description: '',
      amount: 0
    };

    setCharges(prev => [...prev, newCharge]);
  };

  // Handle removing a charge
  const handleRemoveCharge = (id: string) => {
    setCharges(prev => prev.filter(charge => charge.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 flex justify-center items-start">
      <div className="fixed inset-y-0 right-0 max-w-[600px] w-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Edit Lease</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Lease Terms */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Lease Terms</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="leaseType" className="block text-sm font-medium text-gray-700">
                      Lease Type
                    </label>
                    <select
                      id="leaseType"
                      name="leaseType"
                      value={formData.leaseType}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="fixed">Fixed Term</option>
                      <option value="month-to-month">Month-to-Month</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                      Start Date
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.startDate ? 'border-red-300' : ''}`}
                    />
                    {errors.startDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                    )}
                  </div>

                  {formData.leaseType === 'fixed' && (
                    <div>
                      <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                        End Date
                      </label>
                      <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${errors.endDate ? 'border-red-300' : ''}`}
                      />
                      {errors.endDate && (
                        <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                      )}
                    </div>
                  )}
                  
                  {formData.leaseType === 'month-to-month' && (
                    <div>
                      <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                        Nominal End Date (12 months)
                      </label>
                      <input
                        type="date"
                        id="endDate"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        disabled
                        className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        This is a 12-month projection for record-keeping. Month-to-month leases automatically renew and have no fixed end date in the system.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Payment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="rentAmount" className="block text-sm font-medium text-gray-700">
                      Rent Amount
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="text"
                        id="rentAmount"
                        name="rentAmount"
                        value={formData.rentAmount}
                        onChange={handleInputChange}
                        className={`block w-full pl-7 pr-12 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${errors.rentAmount ? 'border-red-300' : ''}`}
                        placeholder="0.00"
                      />
                    </div>
                    {errors.rentAmount && (
                      <p className="mt-1 text-sm text-red-600">{errors.rentAmount}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="depositAmount" className="block text-sm font-medium text-gray-700">
                      Security Deposit
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="text"
                        id="depositAmount"
                        name="depositAmount"
                        value={formData.depositAmount}
                        onChange={handleInputChange}
                        className="block w-full pl-7 pr-12 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {formData.leaseType === 'fixed' && (
                    <div>
                      <label htmlFor="paymentFrequency" className="block text-sm font-medium text-gray-700">
                        Payment Cycle
                      </label>
                      <select
                        id="paymentFrequency"
                        name="paymentFrequency"
                        value={formData.paymentFrequency}
                        onChange={handleInputChange}
                        disabled={formData.leaseType === 'month-to-month'}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${formData.leaseType === 'month-to-month' ? 'bg-gray-100 text-gray-500' : ''}`}
                      >
                        <option value="Daily">Daily</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Every 2 Weeks">Every 2 Weeks</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Every 2 Months">Every 2 Months</option>
                        <option value="Quarterly">Quarterly</option>
                        <option value="Every 6 Months">Every 6 Months</option>
                        <option value="Annually">Annually</option>
                      </select>
                      {formData.leaseType === 'month-to-month' && (
                        <p className="text-xs text-gray-500 mt-1">
                          Month-to-month leases must use monthly payment frequency
                        </p>
                      )}
                    </div>
                  )}

                  <div>
                    <label htmlFor="paymentDay" className="block text-sm font-medium text-gray-700">
                      Payment Day {formData.paymentFrequency === 'Monthly' ? '(1-31)' : 'of Month'}
                    </label>
                    <input
                      type="number"
                      id="paymentDay"
                      name="paymentDay"
                      value={formData.paymentDay}
                      onChange={handleInputChange}
                      min="1"
                      max="31"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    {formData.leaseType === 'month-to-month' && (
                      <p className="text-xs text-gray-500 mt-1">
                        For month-to-month leases, this is the day of each month when rent is due.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Charges */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Additional Charges</h3>
                  <button
                    type="button"
                    onClick={handleAddCharge}
                    className="flex items-center px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800"
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
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={charge.type}
                          onChange={(e) => handleChargeChange(charge.id, 'type', e.target.value)}
                          required
                        >
                          <option value="">Select charge type</option>
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
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <DollarSign className="w-4 h-4 text-gray-500" />
                          </span>
                          <input
                            type="number"
                            className="w-full pl-10 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={charge.amount || ''}
                            onChange={(e) => handleChargeChange(charge.id, 'amount', parseFloat(e.target.value))}
                            placeholder="Amount"
                            min="0"
                            step="0.01"
                            required
                          />
                          {errors[`charge_amount_${index}`] && <p className="text-xs text-red-500 mt-1">{errors[`charge_amount_${index}`]}</p>}
                        </div>

                        <input
                          type="text"
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={charge.description || ''}
                          onChange={(e) => handleChargeChange(charge.id, 'description', e.target.value)}
                          placeholder="Description"
                          required
                        />
                        {errors[`charge_description_${index}`] && <p className="text-xs text-red-500 mt-1">{errors[`charge_description_${index}`]}</p>}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveCharge(charge.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Document Management */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Documents</h3>
                  <button
                    type="button"
                    onClick={() => document.getElementById('file-upload')?.click()}
                    className="flex items-center px-4 py-2 text-sm bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Add Document
                  </button>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    multiple
                    className="sr-only"
                    onChange={handleDocumentUpload}
                  />
                </div>
                <div className="space-y-4">
                  {documents.length === 0 ? (
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-gray-600 hover:text-gray-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-gray-500"
                          >
                            <span>Upload a file</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              multiple
                              className="sr-only"
                              onChange={handleDocumentUpload}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PDF, Word, Excel up to 10MB</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <File className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                              <div className="flex space-x-2 mt-1">
                                <select
                                  value={doc.status}
                                  onChange={(e) => handleDocumentStatusChange(doc.id, e.target.value as 'Signed' | 'Not Signed' | 'No signature required')}
                                  className="text-xs border border-gray-300 rounded py-1 px-2"
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
                            onClick={() => handleRemoveDocument(doc.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={clsx(
                "inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500",
                isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-600"
              )}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

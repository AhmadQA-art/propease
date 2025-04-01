import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AddLeaseForm from '../components/AddLeaseForm';
import { supabase } from '../config/supabase';
import { Property } from '../types/rental';
import { toast } from 'react-hot-toast';

export default function AddLease() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select(`
          id, 
          name, 
          address, 
          city, 
          state, 
          zip_code, 
          created_at,
          units (
            id,
            unit_number,
            status
          )
        `)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching properties:', error);
        return;
      }

      if (data) {
        // Map the data to match Property type with units included
        const formattedProperties: Property[] = data.map(property => ({
          id: property.id,
          name: property.name,
          address: property.address,
          city: property.city,
          state: property.state,
          zipCode: property.zip_code,
          total_units: property.units?.length || 0,
          owner_id: '', // Default value
          organization_id: '', // Default value
          property_type: 'residential', // Default value
          // Map units and add isAvailable property based on status
          units: property.units?.map(unit => ({
            id: unit.id,
            number: unit.unit_number,
            isAvailable: unit.status === 'vacant'
          })) || []
        }));

        setProperties(formattedProperties);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitLease = async (leaseData: any, databaseLeaseData: any) => {
    try {
      // First check if documents are available to upload
      if (!databaseLeaseData.documents || databaseLeaseData.documents.length === 0) {
        toast.error('At least one document is required to create a lease.');
        return;
      }

      // Process the documents first to ensure they upload successfully before creating the lease
      toast.loading('Uploading documents...', { id: 'documentUpload' });
      
      // Create temporary arrays to store document information for database insertion
      const documentUploadResults: { 
        publicUrl: string,
        documentName: string,
        documentStatus: string 
      }[] = [];
      
      let documentUploadFailed = false;
      
      // Process all documents first to ensure they can be uploaded
      for (const doc of databaseLeaseData.documents) {
        try {
          // 1. Upload the file to storage
          const fileName = `${Date.now()}_${doc.file.name.replace(/\s+/g, '_')}`;
          const filePath = `temp/${fileName}`; // Use temp folder before lease creation
          
          const { error: uploadError, data: uploadData } = await supabase.storage
            .from('lease-documents') // Use the correct bucket name
            .upload(filePath, doc.file);
            
          if (uploadError) {
            console.error('Error uploading document:', uploadError);
            documentUploadFailed = true;
            toast.error(`Failed to upload document "${doc.file.name}": ${uploadError.message}`);
            break;
          }
          
          // 2. Get the public URL
          const { data: publicUrlData } = supabase.storage
            .from('lease-documents') // Use the correct bucket name
            .getPublicUrl(filePath);
            
          const publicUrl = publicUrlData?.publicUrl;
          
          // Store document info for later database insertion
          documentUploadResults.push({
            publicUrl,
            documentName: doc.file.name,
            documentStatus: doc.document_status
          });
          
        } catch (docError) {
          console.error('Error processing document:', docError);
          documentUploadFailed = true;
          toast.error(`Error processing document: ${docError}`);
          break;
        }
      }
      
      toast.dismiss('documentUpload');
      
      // If any document upload failed, stop the process and don't create the lease
      if (documentUploadFailed) {
        toast.error('Document upload failed. Lease creation aborted.');
        
        // Clean up any temporary uploaded files
        for (const doc of documentUploadResults) {
          // Extract the file path from URL
          const filePath = doc.publicUrl.split('/').slice(-2).join('/');
          if (filePath) {
            await supabase.storage
              .from('lease-documents') // Use the correct bucket name
              .remove([filePath]);
          }
        }
        
        return;
      }
      
      // Now that documents are uploaded, create the lease
      toast.loading('Creating lease...', { id: 'createLease' });
      
      const { data, error } = await supabase
        .from('leases')
        .insert([{
          unit_id: databaseLeaseData.unit_id,
          tenant_id: databaseLeaseData.tenant_id,
          start_date: databaseLeaseData.start_date,
          end_date: databaseLeaseData.end_date,
          rent_amount: databaseLeaseData.rent_amount,
          security_deposit: databaseLeaseData.security_deposit,
          status: databaseLeaseData.status,
          payment_date: databaseLeaseData.payment_date,
          next_payment_date: databaseLeaseData.next_payment_date,
          payment_frequency: databaseLeaseData.payment_frequency,
          lease_issuer_id: databaseLeaseData.lease_issuer_id,
          lease_terms: databaseLeaseData.lease_terms,
          document_status: databaseLeaseData.document_status,
          security_deposit_status: databaseLeaseData.security_deposit_status,
          rent_payment_status: databaseLeaseData.rent_payment_status,
          payment_status: databaseLeaseData.payment_status,
          roll_over_to_month_to_month: databaseLeaseData.roll_over_to_month_to_month
        }])
        .select();

      if (error) {
        // Handle lease creation error
        toast.dismiss('createLease');
        handleLeaseError(error);
        
        // Clean up already uploaded documents since lease creation failed
        for (const doc of documentUploadResults) {
          // Extract the file path from URL
          const filePath = doc.publicUrl.split('/').slice(-2).join('/');
          if (filePath) {
            await supabase.storage
              .from('lease-documents') // Use the correct bucket name
              .remove([filePath]);
          }
        }
        
        return;
      }

      if (!data || data.length === 0) {
        toast.dismiss('createLease');
        toast.error('Failed to create lease: No data returned from the database');
        return;
      }

      const leaseId = data[0].id;
      
      // Generate payment periods for the lease based on frequency
      await generateLeasePaymentPeriods(leaseId, databaseLeaseData);
      
      // Now that we have a lease ID, move documents from temp to proper lease folder
      let documentAttachFailed = false;
      
      for (const doc of documentUploadResults) {
        try {
          // Extract the filename from URL
          const fileName = doc.publicUrl.split('/').pop() || '';
          const tempPath = `temp/${fileName}`;
          const newPath = `lease_${leaseId}/${fileName}`;
          
          // Copy file from temp to lease folder
          const { error: copyError } = await supabase.storage
            .from('lease-documents')
            .copy(tempPath, newPath);
            
          if (copyError) {
            console.error('Error moving document to lease folder:', copyError);
            documentAttachFailed = true;
            continue;
          }
          
          // Get the new public URL with the lease ID in the path
          const { data: newPublicUrlData } = supabase.storage
            .from('lease-documents')
            .getPublicUrl(newPath);
            
          const newPublicUrl = newPublicUrlData?.publicUrl;
          
          // Add document record in the database
          const { error: docError } = await supabase
            .from('lease_documents')
            .insert({
              lease_id: leaseId,
              document_url: newPublicUrl,
              document_status: doc.documentStatus,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
            
          if (docError) {
            console.error('Error attaching document to lease:', docError);
            documentAttachFailed = true;
          }
          
          // Delete the temporary file
          await supabase.storage
            .from('lease-documents')
            .remove([tempPath]);
            
        } catch (error) {
          console.error('Error processing document after lease creation:', error);
          documentAttachFailed = true;
        }
      }

      // Handle charges if they exist
      if (databaseLeaseData.charges && databaseLeaseData.charges.length > 0) {
        toast.loading('Processing charges...', { id: 'chargesProcessing' });
        
        // Get all payment periods for this lease to add charges to each period
        const { data: paymentPeriods, error: periodsError } = await supabase
          .from('lease_period_payments')
          .select('period_start_date')
          .eq('lease_id', leaseId)
          .order('period_start_date', { ascending: true });
          
        if (periodsError) {
          console.error('Error fetching payment periods for charges:', periodsError);
          toast.error('Error associating charges with payment periods');
        }
        
        let firstPeriodStartDate = null;
        if (paymentPeriods && paymentPeriods.length > 0) {
          firstPeriodStartDate = paymentPeriods[0].period_start_date;
        } else {
          firstPeriodStartDate = formatDateForDatabase(new Date(databaseLeaseData.start_date));
        }
        
        const chargePromises = databaseLeaseData.charges.map((charge: any) => {
          return supabase
            .from('lease_charges')
            .insert({
              lease_id: leaseId,
              amount: charge.amount,
              type: charge.type,
              description: charge.description,
              charge_status: 'pending',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              period_start_date: firstPeriodStartDate // Use the first period's start date for all charges
            });
        });

        const chargeResults = await Promise.all(chargePromises);
        
        // Check if any charges failed to insert
        const failedCharges = chargeResults.filter(result => result.error);
        if (failedCharges.length > 0) {
          console.error('Failed to insert some charges:', failedCharges);
          toast.error(`Failed to add ${failedCharges.length} charges to the lease`);
        }
        
        toast.dismiss('chargesProcessing');
      }

      toast.dismiss('createLease');
      
      // Show appropriate success message
      if (documentAttachFailed) {
        toast.error('Lease created but some documents could not be attached. Please add them manually.');
      } else {
        // Show different success message based on lease status
        if (databaseLeaseData.status === 'Active') {
          toast.success('Lease created and activated successfully with all documents attached. Unit status updated to occupied.');
        } else if (databaseLeaseData.status === 'Pending') {
          toast.success('Pending lease created successfully with all documents attached. It will become active on the start date.');
        } else {
          toast.success('Lease created successfully with all documents attached.');
        }
      }
      
      navigate('/leases');
    } catch (error: any) {
      toast.dismiss('createLease');
      toast.dismiss('documentUpload');
      toast.dismiss('chargesProcessing');
      console.error('Error creating lease:', error);
      toast.error('An unexpected error occurred. Please try again.');
    }
  };
  
  // Helper function to handle specific lease creation errors
  const handleLeaseError = (error: any) => {
    if (error.message.includes('no_overlapping_leases')) {
      toast.error('This unit already has an active lease for the selected date range.');
    } else if (error.message.includes('valid_lease_dates')) {
      toast.error('End date must be after start date.');
    } else if (error.message.includes('leases_document_status_check')) {
      toast.error('Invalid document status. Must be "Paper Signed", "Not Signed", or "In Progress".');
    } else if (error.message.includes('leases_status_check')) {
      toast.error('Invalid lease status. Must be "Active", "Terminated", "Pending", or "Ended".');
    } else if (error.message.includes('leases_payment_frequency_check')) {
      toast.error('Invalid payment frequency.');
    } else {
      toast.error(`Failed to create lease: ${error.message}`);
    }
  };

  // Function to generate payment periods for a lease
  const generateLeasePaymentPeriods = async (leaseId: string, leaseData: any) => {
    try {
      toast.loading('Setting up payment schedule...', { id: 'paymentSchedule' });
      
      const startDate = new Date(leaseData.start_date);
      const paymentDay = parseInt(leaseData.payment_date);
      const rentAmount = parseFloat(leaseData.rent_amount);
      let endDate = null;
      
      if (leaseData.end_date) {
        endDate = new Date(leaseData.end_date);
      } else {
        // For month-to-month leases, create payments for 12 months ahead
        endDate = new Date(startDate);
        endDate.setFullYear(endDate.getFullYear() + 1);
      }
      
      // Generate payment periods based on frequency
      const periods = [];
      const firstPeriodStartDate = formatDateForDatabase(startDate); // Store the first period start date
      
      let currentPeriodStart = new Date(startDate);
      let periodCounter = 0;
      
      while (currentPeriodStart < endDate) {
        // Always use the first period start date for all records to ensure triggers work properly
        const periodStartDate = firstPeriodStartDate;
        
        // Calculate the due date based on payment day and current period
        const dueDate = new Date(currentPeriodStart);
        
        // Set the payment day for the due date
        const lastDayOfMonth = new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, 0).getDate();
        const adjustedPaymentDay = Math.min(paymentDay, lastDayOfMonth);
        dueDate.setDate(adjustedPaymentDay);
        
        // If due date would be before period start, advance to next month
        if (dueDate < currentPeriodStart) {
          dueDate.setMonth(dueDate.getMonth() + 1);
          // Recalculate adjusted payment day for next month
          const nextLastDay = new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, 0).getDate();
          dueDate.setDate(Math.min(paymentDay, nextLastDay));
        }
        
        periods.push({
          lease_id: leaseId,
          period_start_date: periodStartDate, // Always use the first period start date
          due_date: formatDateForDatabase(dueDate),
          total_amount: rentAmount,
          status: 'pending'
        });
        
        // Advance to next period
        advancePeriodByFrequency(currentPeriodStart, leaseData.payment_frequency);
        periodCounter++;
        
        // Safety check to prevent infinite loops
        if (periodCounter > 100) {
          console.warn('Maximum number of periods reached');
          break;
        }
      }
      
      // Insert periods into the database
      if (periods.length > 0) {
        const { error } = await supabase
          .from('lease_period_payments')
          .insert(periods);
          
        if (error) {
          console.error('Error creating payment periods:', error);
          toast.error('Failed to set up payment schedule');
        }
      }
      
      toast.dismiss('paymentSchedule');
    } catch (error) {
      console.error('Error generating payment periods:', error);
      toast.error('Error setting up payment schedule');
      toast.dismiss('paymentSchedule');
    }
  };
  
  // Helper function to advance a date based on payment frequency
  const advancePeriodByFrequency = (date: Date, frequency: string) => {
    switch (frequency) {
      case 'Daily':
        date.setDate(date.getDate() + 1);
        break;
      case 'Weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'Every 2 Weeks':
        date.setDate(date.getDate() + 14);
        break;
      case 'Monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'Every 2 Months':
        date.setMonth(date.getMonth() + 2);
        break;
      case 'Quarterly':
        date.setMonth(date.getMonth() + 3);
        break;
      case 'Every 6 Months':
        date.setMonth(date.getMonth() + 6);
        break;
      case 'Annually':
        date.setFullYear(date.getFullYear() + 1);
        break;
      default:
        // Default to monthly
        date.setMonth(date.getMonth() + 1);
    }
  };
  
  // Helper function to format dates for database insertion (YYYY-MM-DD)
  const formatDateForDatabase = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen pb-12">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#2C3539]">Create New Lease</h1>
        <p className="text-[#6B7280] mt-1">Add a new lease to your property</p>
      </div>

      {loading ? (
        <div className="p-8 text-center">Loading properties...</div>
      ) : (
        <AddLeaseForm 
          properties={properties} 
          onSubmit={handleSubmitLease} 
        />
      )}
    </div>
  );
}

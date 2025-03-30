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
        .select('id, name, address, city, state, zip_code, created_at')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching properties:', error);
        return;
      }

      if (data) {
        // Map the data to match Property type
        const formattedProperties: Property[] = data.map(property => ({
          id: property.id,
          name: property.name,
          address: property.address,
          city: property.city,
          state: property.state,
          zipCode: property.zip_code,
          createdAt: property.created_at
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
      // Create a new lease in the database
      const { data, error } = await supabase
        .from('leases')
        .insert([databaseLeaseData])
        .select();

      if (error) {
        console.error('Error creating lease:', error);
        toast.error('Failed to create lease. Please try again.');
        return;
      }

      // Handle documents if they exist
      if (leaseData.documents && leaseData.documents.length > 0) {
        const leaseId = data[0].id;
        const documentPromises = leaseData.documents.map((doc: any) => {
          return supabase
            .from('lease_documents')
            .insert({
              lease_id: leaseId,
              document_url: doc.document_url,
              document_status: doc.document_status,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
        });

        await Promise.all(documentPromises);
      }

      // Handle charges if they exist
      if (leaseData.charges && leaseData.charges.length > 0) {
        const leaseId = data[0].id;
        const chargePromises = leaseData.charges.map((charge: any) => {
          return supabase
            .from('lease_charges')
            .insert({
              lease_id: leaseId,
              amount: charge.amount,
              type: charge.type,
              description: charge.description,
              charge_status: 'pending',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
        });

        await Promise.all(chargePromises);
      }

      toast.success('Lease created successfully!');
      navigate('/leases');
    } catch (error) {
      console.error('Error creating lease:', error);
      toast.error('An unexpected error occurred. Please try again.');
    }
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

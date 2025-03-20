// Get application by ID
async getApplicationById(applicationId: string, organizationId: string) {
  const { data, error } = await supabase
    .from('rental_applications')
    .select(`
      *,
      property:property_id (
        id,
        name,
        address,
        city,
        state
      ),
      unit:unit_id (
        id,
        unit_number,
        floor_plan,
        area,
        bedrooms,
        bathrooms,
        rent_amount
      ),
      documents:rental_application_documents (
        id,
        file_name,
        file_path,
        file_type,
        uploaded_at
      )
    `)
    .eq('id', applicationId)
    .eq('organization_id', organizationId)
    .single();

  if (error) throw new Error(`Error fetching application: ${error.message}`);
  return data;
}, 
// Helper function to convert API data to view model
const mapToViewModel = (application: RentalApplication, documents: any[] = []): ApplicationViewModel => {
  // Make sure we have a documents array from either the documents parameter or the application
  const applicationDocuments = application.documents || documents || [];
  
  // Transform document properties if needed
  const transformedDocuments = applicationDocuments.map(doc => ({
    id: doc.id,
    document_name: doc.file_name || doc.document_name,
    document_url: doc.file_path || doc.document_url,
    document_type: doc.file_type || doc.document_type,
    uploaded_at: doc.uploaded_at,
    file_name: doc.file_name,
    file_path: doc.file_path,
    file_type: doc.file_type
  }));
  
  return {
    id: application.id || '',
    applicant: {
      name: application.applicant_name,
      id: application.applicant_id,
    },
    submitDate: application.application_date || new Date().toISOString(),
    desiredMoveIn: application.desired_move_in_date,
    status: (application.status as 'pending' | 'approved' | 'rejected') || 'pending',
    monthly_income: application.monthly_income,
    documents: transformedDocuments,
    unit: application.unit,
    has_pets: application.has_pets,
    has_vehicles: application.has_vehicles,
    is_employed: application.is_employed,
    emergency_contact: application.emergency_contact,
    notes: application.notes,
    id_type: application.id_type,
    lease_term: application.lease_term,
    organization_id: application.organization_id,
    application_date: application.application_date || new Date().toISOString(),
    desired_move_in_date: application.desired_move_in_date,
    applicant_id: application.applicant_id,
    applicant_name: application.applicant_name,
    property_id: application.property_id,
    unit_id: application.unit_id,
    background_check_status: application.background_check_status,
    credit_check_status: application.credit_check_status,
    previous_address: application.previous_address,
    vehicle_details: application.vehicle_details,
    pet_details: application.pet_details,
    application_fee_paid: application.application_fee_paid,
    employment_info: application.employment_info,
    rejection_reason: application.rejection_reason,
    reviewed_by: application.reviewed_by,
    review_date: application.review_date ? application.review_date.toString() : undefined,
    expiry_date: application.expiry_date ? application.expiry_date.toString() : undefined,
    property: application.property
  };
}; 
-- Create a function to count tenant contacts for properties
CREATE OR REPLACE FUNCTION public.get_tenant_contact_counts(property_ids UUID[])
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  email_count INT;
  sms_count INT;
  whatsapp_count INT;
  total_count INT;
BEGIN
  -- Get total unique tenants
  SELECT COUNT(DISTINCT t.id) INTO total_count
  FROM tenants t
  JOIN leases l ON t.id = l.tenant_id
  JOIN units u ON l.unit_id = u.id
  WHERE l.status = 'Active'
  AND u.property_id = ANY(property_ids);
  
  -- Get email counts
  SELECT COUNT(DISTINCT t.id) INTO email_count
  FROM tenants t
  JOIN leases l ON t.id = l.tenant_id
  JOIN units u ON l.unit_id = u.id
  WHERE l.status = 'Active'
  AND u.property_id = ANY(property_ids)
  AND t.email IS NOT NULL
  AND t.email != '';
  
  -- Get SMS counts
  SELECT COUNT(DISTINCT t.id) INTO sms_count
  FROM tenants t
  JOIN leases l ON t.id = l.tenant_id
  JOIN units u ON l.unit_id = u.id
  WHERE l.status = 'Active'
  AND u.property_id = ANY(property_ids)
  AND t.phone_number IS NOT NULL
  AND t.phone_number != '';
  
  -- Get WhatsApp counts
  SELECT COUNT(DISTINCT t.id) INTO whatsapp_count
  FROM tenants t
  JOIN leases l ON t.id = l.tenant_id
  JOIN units u ON l.unit_id = u.id
  WHERE l.status = 'Active'
  AND u.property_id = ANY(property_ids)
  AND t.whatsapp_number IS NOT NULL
  AND t.whatsapp_number != '';
  
  -- Return as JSON
  RETURN json_build_object(
    'total', total_count,
    'email', email_count,
    'sms', sms_count,
    'whatsapp', whatsapp_count
  );
END;
$$; 
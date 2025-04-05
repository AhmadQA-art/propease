-- Function to get all tenant contacts for an announcement
-- This efficiently fetches all tenant contacts that should receive an announcement
CREATE OR REPLACE FUNCTION get_announcement_tenant_contacts(announcement_id UUID)
RETURNS TABLE (
  id UUID,
  email TEXT,
  phone_number TEXT,
  whatsapp_number TEXT,
  first_name TEXT,
  last_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH announcement_properties AS (
    -- Get all properties targeted by this announcement
    SELECT DISTINCT property_id
    FROM announcement_targets
    WHERE announcement_id = $1
      AND target_type = 'property'
      AND property_id IS NOT NULL
  ),
  target_tenants AS (
    -- Get all tenants directly targeted
    SELECT target_id AS tenant_id
    FROM announcement_targets
    WHERE announcement_id = $1
      AND target_type = 'tenant'
      AND target_id IS NOT NULL
    
    UNION
    
    -- Get all tenants with active leases in the targeted properties
    SELECT DISTINCT l.tenant_id
    FROM leases l
    JOIN units u ON l.unit_id = u.id
    JOIN announcement_properties ap ON u.property_id = ap.property_id
    WHERE l.status = 'Active'
  )
  -- Get contact details for all target tenants (removing duplicates)
  SELECT DISTINCT t.id, t.email, t.phone_number, t.whatsapp_number, t.first_name, t.last_name
  FROM tenants t
  JOIN target_tenants tt ON t.id = tt.tenant_id
  WHERE 
    -- At least one contact method must be available
    (t.email IS NOT NULL OR t.phone_number IS NOT NULL OR t.whatsapp_number IS NOT NULL);
END;
$$ LANGUAGE plpgsql; 
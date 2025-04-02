-- Test query to find leases expiring in the next 30 days
-- This helps validate what the notification function will detect

-- Calculate date ranges
WITH date_range AS (
  SELECT 
    CURRENT_DATE AS today,
    CURRENT_DATE + INTERVAL '30 days' AS thirty_days_later
)

-- Find leases expiring within 30 days and include property manager info
SELECT 
  l.id AS lease_id,
  l.property_id,
  l.rental_id,
  l.tenant_id,
  l.start_date,
  l.end_date,
  l.lease_term,
  l.payment_frequency,
  p.name AS property_name,
  
  -- Include property managers who would receive notifications
  jsonb_agg(
    jsonb_build_object(
      'user_id', pm.user_id,
      'name', u.email  -- or u.first_name || ' ' || u.last_name if available
    )
  ) AS property_managers
  
FROM 
  leases l
  JOIN date_range dr ON TRUE
  JOIN properties p ON l.property_id = p.id
  LEFT JOIN property_managers pm ON l.property_id = pm.property_id
  LEFT JOIN users u ON pm.user_id = u.id

WHERE
  -- For leases with end_date (fixed term)
  (l.end_date IS NOT NULL AND l.end_date >= dr.today AND l.end_date <= dr.thirty_days_later)
  OR
  -- For month-to-month leases where the term is about to expire (typically 1 month)
  -- This part of the query handles month-to-month leases created with null end_date
  (l.end_date IS NULL AND l.lease_term = 'month-to-month' AND l.start_date <= dr.today AND 
   (date_trunc('month', l.start_date) + INTERVAL '1 month' - INTERVAL '1 day') BETWEEN dr.today AND dr.thirty_days_later)

GROUP BY
  l.id, l.property_id, l.rental_id, l.tenant_id, l.start_date, l.end_date, l.lease_term, l.payment_frequency, p.name

-- Order by soonest expiring
ORDER BY 
  COALESCE(l.end_date, date_trunc('month', l.start_date) + INTERVAL '1 month' - INTERVAL '1 day') ASC;

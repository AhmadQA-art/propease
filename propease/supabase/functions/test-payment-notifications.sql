-- Test query to find overdue payments that would trigger notifications
-- This matches the logic in the notification job

-- Find overdue payments and include property manager info
SELECT 
  lpp.id AS payment_id,
  lpp.lease_id,
  lpp.period_start_date,
  lpp.due_date,
  lpp.total_amount,
  lpp.status,
  l.property_id,
  p.name AS property_name,
  l.payment_frequency,
  
  -- Include property managers who would receive notifications
  jsonb_agg(
    jsonb_build_object(
      'user_id', pm.user_id,
      'name', u.email  -- or u.first_name || ' ' || u.last_name if available
    )
  ) AS property_managers
  
FROM 
  lease_period_payments lpp
  JOIN leases l ON lpp.lease_id = l.id
  JOIN properties p ON l.property_id = p.id
  LEFT JOIN property_managers pm ON l.property_id = pm.property_id
  LEFT JOIN users u ON pm.user_id = u.id

WHERE
  -- Payment is overdue (using the 'Ended' status as specified in your notification job)
  lpp.status = 'Ended'
  
  -- If you want to use due_date instead, uncomment this:
  -- OR (lpp.due_date < CURRENT_DATE AND lpp.status != 'Paid')

GROUP BY
  lpp.id, lpp.lease_id, lpp.period_start_date, lpp.due_date, 
  lpp.total_amount, lpp.status, l.property_id, p.name, l.payment_frequency

-- Order by oldest overdue first
ORDER BY lpp.due_date ASC;

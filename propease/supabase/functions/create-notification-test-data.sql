-- Test data generator for PropEase notification system
-- This script creates test lease data for testing notifications
-- NOTE: By default this script ROLLS BACK all changes!
-- To keep the test data, uncomment COMMIT and comment out ROLLBACK at the bottom

BEGIN;

-- Create Sample Leases Using Provided IDs
DO $$
DECLARE
    expiring_lease_id UUID;
    month_to_month_lease_id UUID;
    future_lease_id UUID;
    current_date_val DATE := CURRENT_DATE;
    expiry_date DATE := current_date_val + INTERVAL '15 days';
BEGIN
    RAISE NOTICE '--- Creating test lease data (current date: %) ---', current_date_val;
    
    -- Expiring Lease (Fixed Term) - should trigger an expiration notification.
    INSERT INTO leases (
        unit_id, tenant_id, start_date, end_date, rent_amount,
        lease_terms, payment_frequency, payment_date, lease_issuer_id, document_status
    )
    VALUES (
        '14ca375e-8537-45c1-93bd-77eafca548dc',                    -- unit_id from test units
        '4472aa84-e732-40a1-9430-fe4fe2570b1a',                    -- tenant_id (Test Tenant1)
        current_date_val - INTERVAL '11 months',                   -- start_date
        expiry_date,                                               -- end_date (expires in 15 days)
        1200,                                                      -- rent_amount
        'Fixed Term',                                              -- lease_terms (must match allowed values)
        'Monthly',                                                 -- payment_frequency
        1,                                                         -- payment_date (day of month)
        '331721e9-e742-4e26-ac0b-0b7d323702e7',                     -- lease_issuer_id (property manager)
        'Not Signed'                                               -- document_status (exactly as allowed)
    )
    RETURNING id INTO expiring_lease_id;
    
    RAISE NOTICE 'Created expiring lease: % (expires on %)', expiring_lease_id, expiry_date;
    
    -- Month-to-Month Lease - should trigger notification for renewals.
    INSERT INTO leases (
        unit_id, tenant_id, start_date, end_date, rent_amount,
        lease_terms, payment_frequency, payment_date, lease_issuer_id, document_status
    )
    VALUES (
        '082d409c-680f-4500-ba26-b402607886ea',                    -- unit_id from test units (different unit)
        '44bc4b66-39b9-4ec1-9e27-b17b9f664f24',                    -- tenant_id (Test Tenant2)
        current_date_val - INTERVAL '20 days',                     -- start_date
        NULL,                                                      -- end_date (month-to-month leases have NULL end_date)
        1000,                                                      -- rent_amount
        'Month-to-Month',                                          -- lease_terms for month-to-month leases
        'Monthly',                                                 -- payment_frequency
        1,                                                         -- payment_date
        '331721e9-e742-4e26-ac0b-0b7d323702e7',                     -- lease_issuer_id
        'Not Signed'                                               -- document_status
    )
    RETURNING id INTO month_to_month_lease_id;
    
    RAISE NOTICE 'Created month-to-month lease: %', month_to_month_lease_id;
    
    -- Future Lease (Fixed Term) - should NOT trigger a notification.
    INSERT INTO leases (
        unit_id, tenant_id, start_date, end_date, rent_amount,
        lease_terms, payment_frequency, payment_date, lease_issuer_id, document_status
    )
    VALUES (
        '14ca375e-8537-45c1-93bd-77eafca548dc',                    -- unit_id from test units
        '4472aa84-e732-40a1-9430-fe4fe2570b1a',                    -- tenant_id (Test Tenant1)
        current_date_val,                                          -- start_date
        current_date_val + INTERVAL '6 months',                    -- end_date (6 months from now)
        1500,                                                      -- rent_amount
        'Fixed Term',                                              -- lease_terms
        'Monthly',                                                 -- payment_frequency
        15,                                                        -- payment_date
        '331721e9-e742-4e26-ac0b-0b7d323702e7',                     -- lease_issuer_id
        'Not Signed'                                               -- document_status
    )
    RETURNING id INTO future_lease_id;
    
    RAISE NOTICE 'Created future lease: % (expires in 6 months)', future_lease_id;
    
    -- Trigger the manage_lease_payments trigger by updating the leases (even if no change)
    -- This ensures payment periods are created by your existing triggers
    UPDATE leases
    SET rent_amount = rent_amount
    WHERE id IN (expiring_lease_id, month_to_month_lease_id, future_lease_id);
    
    -- Update some payment periods to 'Ended' status to test overdue notifications
    UPDATE lease_period_payments
    SET status = 'Ended'
    WHERE lease_id IN (expiring_lease_id, month_to_month_lease_id)
    AND due_date < current_date_val
    LIMIT 2;
    
    RAISE NOTICE 'Updated payment periods to Ended status to test overdue payment notifications';
END $$;

-- Test Queries to show what we created
DO $$
BEGIN
    RAISE NOTICE '--- Leases that should trigger expiration notifications: ---';
    PERFORM * FROM (
      SELECT l.id AS lease_id, l.end_date, l.lease_terms, l.payment_frequency,
             (CASE WHEN l.end_date IS NOT NULL THEN l.end_date - CURRENT_DATE ELSE NULL END) AS days_until_expiration
      FROM leases l
      WHERE l.end_date IS NOT NULL 
        AND l.end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
      UNION
      SELECT l.id AS lease_id, l.end_date, l.lease_terms, l.payment_frequency, NULL AS days_until_expiration
      FROM leases l
      WHERE l.end_date IS NULL AND l.lease_terms = 'Month-to-Month'
    ) AS all_leases;
    
    RAISE NOTICE '--- Lease payment records with status ''Ended'' (overdue payments): ---';
    PERFORM * FROM (
      SELECT lpp.id, lpp.lease_id, lpp.due_date, lpp.total_amount
      FROM lease_period_payments lpp
      WHERE lpp.status = 'Ended'
    ) AS overdue_payments;
END $$;

-- IMPORTANT: By default we ROLLBACK all changes to avoid cluttering your database
-- TO KEEP THE TEST DATA: Comment out the ROLLBACK line and uncomment the COMMIT line below
ROLLBACK;
-- COMMIT;

-- After running this script successfully WITH COMMIT, check if data was persisted:
-- SELECT * FROM leases ORDER BY created_at DESC LIMIT 10;

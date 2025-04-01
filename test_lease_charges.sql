
-- Test script for lease charges calculation
-- This script helps diagnose why charges aren't correctly applied to payment periods

-- 1. Check basic lease information
SELECT id, start_date, end_date, rent_amount, payment_frequency, payment_date, lease_terms
FROM leases
WHERE id = '74a32cbb-a866-437d-a74d-4ea08532dc33';

-- 2. Check existing lease charges
SELECT id, lease_id, description, amount, period_start_date, created_at
FROM lease_charges
WHERE lease_id = '74a32cbb-a866-437d-a74d-4ea08532dc33'
ORDER BY period_start_date;

-- 3. Check payment periods and their total amounts
SELECT id, lease_id, period_start_date, due_date, total_amount, status
FROM lease_period_payments
WHERE lease_id = '74a32cbb-a866-437d-a74d-4ea08532dc33'
ORDER BY period_start_date;

-- 4. Calculate what payment periods SHOULD have by manually applying the calculation logic
WITH lease_data AS (
  SELECT rent_amount
  FROM leases
  WHERE id = '74a32cbb-a866-437d-a74d-4ea08532dc33'
),
charge_data AS (
  SELECT 
    period_start_date,
    SUM(amount) as period_charges
  FROM lease_charges
  WHERE lease_id = '74a32cbb-a866-437d-a74d-4ea08532dc33'
  GROUP BY period_start_date
),
payments AS (
  SELECT
    lpp.id,
    lpp.period_start_date,
    lpp.total_amount as current_total,
    l.rent_amount as base_rent,
    COALESCE(cd.period_charges, 0) as charges_for_period,
    l.rent_amount + COALESCE(cd.period_charges, 0) as expected_total
  FROM lease_period_payments lpp
  JOIN leases l ON lpp.lease_id = l.id
  LEFT JOIN charge_data cd ON date_trunc('month', lpp.period_start_date) = date_trunc('month', cd.period_start_date)
  WHERE lpp.lease_id = '74a32cbb-a866-437d-a74d-4ea08532dc33'
)
SELECT 
  id,
  period_start_date,
  base_rent,
  charges_for_period,
  current_total,
  expected_total,
  CASE WHEN current_total <> expected_total THEN 'MISMATCH' ELSE 'OK' END as status
FROM payments
ORDER BY period_start_date;

-- 5. Test update functionality - UNCOMMENT TO RUN
/*
-- First add a test charge
INSERT INTO lease_charges (lease_id, description, amount, period_start_date)
VALUES 
  ('74a32cbb-a866-437d-a74d-4ea08532dc33', 'Test Utility Charge', 100.00, '2025-04-01');

-- Check if payment periods were updated
SELECT id, lease_id, period_start_date, due_date, total_amount, status
FROM lease_period_payments
WHERE lease_id = '74a32cbb-a866-437d-a74d-4ea08532dc33'
  AND period_start_date >= '2025-04-01'
ORDER BY period_start_date;

-- Clean up test charge
DELETE FROM lease_charges 
WHERE lease_id = '74a32cbb-a866-437d-a74d-4ea08532dc33'
  AND description = 'Test Utility Charge';
*/

-- 6. Issue investigation - DATE TRUNCATION
-- This checks if the date truncation could be causing mismatches
SELECT 
  lc.id as charge_id,
  lc.period_start_date as charge_date,
  date_trunc('month', lc.period_start_date) as truncated_charge_date,
  lpp.id as payment_id,
  lpp.period_start_date as payment_date,
  date_trunc('month', lpp.period_start_date) as truncated_payment_date,
  CASE 
    WHEN date_trunc('month', lc.period_start_date) = date_trunc('month', lpp.period_start_date) 
    THEN 'MATCH' 
    ELSE 'NO MATCH' 
  END as match_status
FROM lease_charges lc
CROSS JOIN lease_period_payments lpp
WHERE lc.lease_id = '74a32cbb-a866-437d-a74d-4ea08532dc33'
  AND lpp.lease_id = '74a32cbb-a866-437d-a74d-4ea08532dc33'
  AND lpp.period_start_date >= CURRENT_DATE
ORDER BY lc.period_start_date, lpp.period_start_date;

-- 7. Fix - Draft SQL for a potential fix
/*
-- Add is_recurring field to lease_charges if it doesn't exist
ALTER TABLE lease_charges ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;

-- Improved trigger for updating payment amounts
CREATE OR REPLACE FUNCTION update_lease_payment_amounts()
RETURNS TRIGGER AS $$
DECLARE
  lease_rent_amount NUMERIC(12,2);
BEGIN
  -- Get the lease's rent amount
  SELECT rent_amount INTO lease_rent_amount
  FROM leases
  WHERE id = NEW.lease_id;

  IF NEW.is_recurring THEN
    -- For recurring charges, add to all future periods
    UPDATE lease_period_payments
    SET total_amount = lease_rent_amount + NEW.amount
    WHERE lease_id = NEW.lease_id
      AND period_start_date >= CURRENT_DATE;
  ELSE
    -- For one-time charges, add to the specific period
    UPDATE lease_period_payments
    SET total_amount = lease_rent_amount + NEW.amount
    WHERE lease_id = NEW.lease_id
      AND date_trunc('month', period_start_date) = date_trunc('month', NEW.period_start_date);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or update the trigger
DROP TRIGGER IF EXISTS update_lease_charges_trigger ON lease_charges;
CREATE TRIGGER update_lease_charges_trigger
AFTER INSERT OR UPDATE ON lease_charges
FOR EACH ROW
EXECUTE FUNCTION update_lease_payment_amounts();
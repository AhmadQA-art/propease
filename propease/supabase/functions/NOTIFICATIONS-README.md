# PropEase Notification System

This module implements a notification system for PropEase that alerts property managers about lease expirations and overdue payments. The system uses Supabase Edge Functions and scheduled jobs to automatically check for critical events and notify the appropriate users.

## System Components

### 1. Backend Components

- **notification-job**: Edge function that identifies leases expiring within 30 days and overdue payments
- **run-notification-job**: Helper function to manually trigger the notification job
- **Scheduled Cron Job**: PostgreSQL cron job that runs the notification function daily at 8 AM

### 2. Frontend Components

- **NotificationContext**: React context that manages notification state and provides methods to interact with notifications
- **NotificationBell**: UI component displaying notifications with an unread count badge
- **App.tsx Integration**: App-wide notification provider
- **Layout.tsx Integration**: Header placement of the notification bell

## Notification Types

The system currently handles two types of notifications:

1. **Lease Expiration Notifications**
   - Triggers when a lease will expire within 30 days
   - Works with both fixed-term leases (with end_date) and month-to-month leases (null end_date)
   - Integrates with your lease_terms field to distinguish lease types

2. **Overdue Payment Notifications**
   - Triggers when a payment period has status = 'Ended'
   - Uses your lease_period_payments table to identify overdue payments
   - Respects your payment frequency and due date calculations

## Test Plan & Implementation

### Test Data Generation

The `create-notification-test-data.sql` file creates test data to verify the notification system functionality. The script:

1. Creates three test leases:
   - Fixed-term lease expiring in 15 days (should trigger notification)
   - Month-to-month lease (should be checked for notification based on current period)
   - Future lease not expiring soon (should NOT trigger notification)

2. Updates lease payment periods:
   - Creates overdue payments (status = 'Ended') for the first two leases
   - These should trigger overdue payment notifications

### Running the Tests

1. **Create Test Data**:
   - Run `create-notification-test-data.sql` in the Supabase SQL Editor
   - To keep the test data, uncomment the COMMIT line at the bottom
   - To discard test data after testing, leave the ROLLBACK line uncommented

2. **Verify Test Lease Detection**:
   - Run `test-lease-notifications.sql` to confirm the system correctly identifies expiring leases

3. **Verify Test Payment Detection**:
   - Run `test-payment-notifications.sql` to confirm the system identifies overdue payments

4. **Trigger Notification Generation**:
   - Invoke the `run-notification-job` Edge Function from the Supabase dashboard
   - This will process the test data and create notifications in the database

5. **Verify Frontend Display**:
   - Log in to the PropEase application
   - The notification bell should display the unread count 
   - Clicking should show the lease and payment notifications

## Integration with Lease Payment System

This notification system is designed to work seamlessly with your existing lease payment infrastructure:

- **Payment Periods**: Works with your lease_period_payments table to track payment status
- **Month-to-Month Leases**: Correctly handles leases with NULL end_date
- **Payment Frequency**: Respects various payment frequencies (daily, weekly, every 2 weeks, monthly, etc.)
- **Due Date Calculation**: Works with your enhanced date calculation logic

## Deployment Steps

1. **Deploy Edge Functions**:
   ```bash
   # From the Supabase Dashboard > Edge Functions
   # Create and deploy notification-job and run-notification-job functions
   ```

2. **Set Environment Variables**:
   - SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY

3. **Set Up Scheduled Job**:
   ```sql
   -- Run in SQL Editor
   SELECT cron.schedule(
     'propease-lease-notifications',
     '0 8 * * *',
     $$
       SELECT net.http_post(
         url:='https://ljojrcciojdprmvrtbdb.supabase.co/functions/v1/notification-job',
         body:='{}',
         headers:='{
           "Content-Type": "application/json", 
           "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"
         }'::jsonb
       );
     $$
   );
   ```

## File Structure

```
/supabase/functions/
├── notification-job/              # Main notification logic
│   ├── index.ts                   # Function code
│   └── deno.json                  # Deno configuration
├── run-notification-job/          # Test trigger function
│   ├── index.ts                   # Function code
│   └── deno.json                  # Deno configuration
├── test-lease-notifications.sql   # Query to test lease expiration detection
├── test-payment-notifications.sql # Query to test overdue payment detection
├── create-notification-test-data.sql # Test data creation script
├── cron-setup.sql                 # Script to set up scheduled job
└── NOTIFICATIONS-README.md        # This documentation
```

## Monitoring and Maintenance

- **View Cron Job Status**:
  ```sql
  SELECT * FROM cron.job WHERE jobname = 'propease-lease-notifications';
  ```

- **View Recent Job Executions**:
  ```sql
  SELECT * FROM cron.job_run_details 
  WHERE jobname = 'propease-lease-notifications' 
  ORDER BY end_time DESC LIMIT 5;
  ```

- **View Recent Notifications**:
  ```sql
  SELECT * FROM notifications ORDER BY created_at DESC LIMIT 10;
  ```

## Future Enhancements

1. **Additional Notification Types**:
   - Upcoming maintenance events
   - New maintenance requests
   - Document expirations (insurance, licenses)
   
2. **Enhanced Notification Preferences**:
   - Allow users to set notification preferences
   - Enable email/SMS notifications

3. **Notification Analytics**:
   - Track notification interaction rates
   - Monitor system health and performance

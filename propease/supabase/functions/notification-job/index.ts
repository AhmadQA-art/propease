// supabase/functions/notification-job/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { corsHeaders } from '../_shared/cors.ts';
// Allowed related_type values: 'payment_overdue', 'lease_expiring'
const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://ljojrcciojdprmvrtbdb.supabase.co';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
console.log('Starting notification job...');
serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing environment variables');
    }
    const supabase = createClient(supabaseUrl, supabaseKey);
    const today = new Date();
    const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const results = {
      leases: 0,
      payments: 0
    };
    console.log('Today:', today.toISOString());
    console.log('30 days later:', thirtyDaysLater.toISOString());

    // 1. Lease Notifications
    const { data: leasesForNotification, error: leaseError } = await supabase.from('leases').select(`
        id, 
        end_date, 
        lease_terms,
        rent_amount,
        unit_id,
        tenant_id,
        status,
        notice_period_days,
        lease_issuer_id,
        units:unit_id (unit_number, property_id, properties:property_id(name, id, organization_id)),
        tenants:tenant_id (first_name, last_name)
      `).or('status.eq.Active, status.eq.Pending');
    
    if (leaseError) console.error('Error checking leases:', leaseError);
    else {
      console.log(`Found ${leasesForNotification?.length || 0} leases to evaluate`);
      
      // Get unique lease issuer IDs
      const leaseIssuerIds = [...new Set(leasesForNotification
        .filter(lease => lease.lease_issuer_id)
        .map(lease => lease.lease_issuer_id))];
      
      console.log(`Found ${leaseIssuerIds.length} unique lease issuers`);
      
      // Fetch the lease issuers' details
      const { data: leaseIssuers, error: issuersError } = await supabase
        .from('user_profiles')
        .select('id, email')
        .in('id', leaseIssuerIds);
      
      if (issuersError) {
        console.error('Error fetching lease issuers:', issuersError);
      } else {
        console.log(`Retrieved ${leaseIssuers?.length || 0} lease issuers`);
        
        // Create a map for quick access to issuer details
        const issuerMap = {};
        leaseIssuers.forEach(issuer => issuerMap[issuer.id] = issuer);
        
        // Process each lease
        for (const lease of leasesForNotification) {
          // Skip leases without issuers
          if (!lease.lease_issuer_id || !issuerMap[lease.lease_issuer_id]) {
            console.log(`Lease ${lease.id} has no issuer or issuer not found, skipping.`);
            continue;
          }
          
          let notificationTitle = '';
          let notificationMessage = '';
          const endDate = lease.end_date ? new Date(lease.end_date) : null;
          const daysRemaining = endDate ? Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;
          const noticePeriodDays = lease.notice_period_days || 30;
          const noticePeriodThreshold = new Date(today.getTime() + noticePeriodDays * 24 * 60 * 60 * 1000);
          
          if ((lease.status === 'Active' || lease.status === 'Pending') && endDate && endDate >= today && endDate <= thirtyDaysLater) {
            notificationTitle = `Lease Expiring in ${daysRemaining} days`;
            notificationMessage = `The lease for ${lease.units?.unit_number} at ${lease.units?.properties?.name} will expire on ${endDate.toLocaleDateString()}.`;
          } else if (lease.status === 'Active' && endDate && endDate <= noticePeriodThreshold && endDate > today && endDate <= thirtyDaysLater) {
            notificationTitle = `Lease Notice Period Approaching`;
            notificationMessage = `The lease for ${lease.units?.unit_number} at ${lease.units?.properties?.name} requires notice by ${new Date(endDate.getTime() - noticePeriodDays * 24 * 60 * 60 * 1000).toLocaleDateString()} (ends ${endDate.toLocaleDateString()}).`;
          } else {
            continue;
          }
          
          const { data: existingNotifications, error: checkError } = await supabase
            .from('notifications')
            .select('id')
            .eq('related_type', 'lease_expiring')
            .ilike('message', `%${lease.units?.unit_number}%${lease.units?.properties?.name}%`)
            .eq('user_id', lease.lease_issuer_id)
            .eq('is_read', false);
            
          if (checkError) {
            console.error(`Error checking notifications for lease ${lease.id}:`, checkError);
            continue;
          }
          
          if (existingNotifications?.length > 0) {
            console.log(`Notification for lease ${lease.id} already exists for issuer ${lease.lease_issuer_id}, skipping.`);
            continue;
          }
          
          const { error: insertError } = await supabase.from('notifications').insert({
            user_id: lease.lease_issuer_id,
            title: notificationTitle,
            message: notificationMessage,
            related_type: 'lease_expiring',
            is_read: false
          });
          
          if (insertError) {
            console.error(`Error creating notification for lease ${lease.id}:`, insertError);
          } else {
            console.log(`Created notification for lease ${lease.id} to issuer ${lease.lease_issuer_id}: ${notificationTitle}`);
            results.leases++;
          }
        }
      }
    }

    // 2. Payment Notifications
    const { data: overduePayments, error: paymentError } = await supabase.from('lease_period_payments').select(`
        id,
        lease_id,
        due_date,
        total_amount,
        leases:lease_id (
          unit_id,
          tenant_id,
          lease_issuer_id,
          units:unit_id (unit_number, property_id, properties:property_id(name, id, organization_id)),
          tenants:tenant_id (first_name, last_name)
        )
      `).eq('status', 'overdue');
      
    if (paymentError) console.error('Error checking overdue payments:', paymentError);
    else {
      console.log(`Found ${overduePayments?.length || 0} overdue payments`);
      
      // Process each payment
      for (const payment of overduePayments) {
        // Skip payments for leases without issuers
        if (!payment.leases?.lease_issuer_id) {
          console.log(`Payment ${payment.id} has no lease issuer, skipping.`);
          continue;
        }
        
        const formattedAmount = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(payment.total_amount);
        
        const dueDate = new Date(payment.due_date).toLocaleDateString();
        const message = `Payment of ${formattedAmount} for ${payment.leases?.units?.unit_number} at ${payment.leases?.units?.properties?.name} due on ${dueDate} is overdue.`;
        
        const { data: existingNotifications, error: checkError } = await supabase
          .from('notifications')
          .select('id')
          .eq('related_type', 'payment_overdue')
          .eq('message', message)
          .eq('user_id', payment.leases.lease_issuer_id)
          .eq('is_read', false);
          
        if (checkError) {
          console.error(`Error checking notifications for payment ${payment.id}:`, checkError);
          continue;
        }
        
        if (existingNotifications?.length > 0) {
          console.log(`Notification for payment ${payment.id} already exists for issuer ${payment.leases.lease_issuer_id}, skipping.`);
          continue;
        }
        
        const { error: insertError } = await supabase.from('notifications').insert({
          user_id: payment.leases.lease_issuer_id,
          title: `Payment Overdue`,
          message: message,
          related_type: 'payment_overdue',
          is_read: false
        });
        
        if (insertError) {
          console.error(`Error creating notification for payment ${payment.id}:`, insertError);
        } else {
          console.log(`Created payment notification for payment ${payment.id} to issuer ${payment.leases.lease_issuer_id}`);
          results.payments++;
        }
      }
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: `Created ${results.leases} lease notifications and ${results.payments} payment notifications`
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    console.error('Error in notification job:', error.message);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});

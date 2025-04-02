// supabase/functions/notification-job/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the function
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://ljojrcciojdprmvrtbdb.supabase.co'
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxqb2pyY2Npb2pkcHJtdnJ0YmRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODYxMzkxMywiZXhwIjoyMDU0MTg5OTEzfQ.iSwJVhqLhi6PNdDbuSAIGr8Xu2QRmJkkZvsmNecx7QI'
    
    // This is a fallback safety check
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const today = new Date()
    const results = { leases: 0, payments: 0 }

    // 1. Check for leases expiring in the next 30 days
    const { data: expiringLeases, error: leaseError } = await supabase
      .from('leases')
      .select(`
        id, 
        end_date, 
        rent_amount,
        unit_id,
        tenant_id,
        units:unit_id (unit_number, property_id, properties:property_id(name)),
        tenants:tenant_id (first_name, last_name)
      `)
      .eq('status', 'Active')
      .not('end_date', 'is', null)
      .lte('end_date', new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString())
      .gte('end_date', today.toISOString())
    
    if (leaseError) {
      console.error('Error checking expiring leases:', leaseError)
    } else {
      console.log(`Found ${expiringLeases?.length || 0} leases expiring soon`)
      
      // Process each expiring lease
      if (expiringLeases && expiringLeases.length > 0) {
        for (const lease of expiringLeases) {
          // Calculate days until expiration
          const endDate = new Date(lease.end_date)
          const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          
          // Get property managers for this property
          const { data: propertyManagers } = await supabase
            .from('users')
            .select('id')
            .eq('role', 'property_manager')
          
          if (propertyManagers && propertyManagers.length > 0) {
            // Create a notification for each property manager
            for (const manager of propertyManagers) {
              await supabase.from('notifications').insert({
                user_id: manager.id,
                title: `Lease Expiring in ${daysRemaining} days`,
                message: `The lease for ${lease.units?.unit_number} at ${lease.units?.properties?.name} will expire on ${new Date(lease.end_date).toLocaleDateString()}.`,
                related_type: 'lease',
                is_read: false
              })
              results.leases++
            }
          }
        }
      }
    }
    
    // 2. Check for overdue payments
    const { data: overduePayments, error: paymentError } = await supabase
      .from('lease_period_payments')
      .select(`
        id,
        lease_id,
        due_date,
        total_amount,
        leases:lease_id (
          unit_id,
          tenant_id,
          units:unit_id (unit_number, property_id, properties:property_id(name)),
          tenants:tenant_id (first_name, last_name)
        )
      `)
      .eq('status', 'Ended')
    
    if (paymentError) {
      console.error('Error checking overdue payments:', paymentError)
    } else {
      console.log(`Found ${overduePayments?.length || 0} overdue payments`)
      
      // Process each overdue payment
      if (overduePayments && overduePayments.length > 0) {
        for (const payment of overduePayments) {
          // Get property managers
          const { data: propertyManagers } = await supabase
            .from('users')
            .select('id')
            .eq('role', 'property_manager')
          
          if (propertyManagers && propertyManagers.length > 0) {
            // Format amount as currency
            const formattedAmount = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(payment.total_amount)
            
            // Create a notification for each property manager
            for (const manager of propertyManagers) {
              await supabase.from('notifications').insert({
                user_id: manager.id,
                title: `Payment Overdue`,
                message: `Payment of ${formattedAmount} for ${payment.leases?.units?.unit_number} at ${payment.leases?.units?.properties?.name} is overdue.`,
                related_type: 'payment',
                is_read: false
              })
              results.payments++
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Created ${results.leases} lease notifications and ${results.payments} payment notifications` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error in notification job:', error.message)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
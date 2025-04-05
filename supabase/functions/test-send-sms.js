#!/usr/bin/env node
require('dotenv').config();

// Test script for send-sms function
const fetch = require('node-fetch');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ljojrcciojdprmvrtbdb.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxqb2pyY2Npb2pkcHJtdnJ0YmRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2MTM5MTMsImV4cCI6MjA1NDE4OTkxM30.-iqJefSjdHCvChvfYXnZOJIqKHTympzRpVSOy7R2bRc';

// Function to send actual SMS (without debug flag)
async function testSendRealSMS() {
  try {
    console.log(`💬 Sending REAL SMS to ${process.env.TEST_PHONE_NUMBER || '+97477968296'}...`);
    console.log(`⚠️ This will send an actual SMS message to the recipient!`);
    
    const testPhone = process.env.TEST_PHONE_NUMBER || '+97477968296';
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        phoneNumber: testPhone,
        text: 'This is a REAL test SMS from Propease Edge Function. If you received this, the system is working!'
      })
    });
    
    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    return {
      success: response.ok,
      status: response.status,
      data
    };
  } catch (error) {
    console.error('Error testing send-sms function:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Default test function with debug flag
async function testSendSMS() {
  try {
    console.log(`Testing send-sms function on ${SUPABASE_URL}...`);
    const testPhone = process.env.TEST_PHONE_NUMBER || '+97477968296';
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        phoneNumber: testPhone,
        text: 'This is a test SMS to verify the send-sms edge function is working.',
        debug: true
      })
    });
    
    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    return {
      success: response.ok,
      status: response.status,
      data
    };
  } catch (error) {
    console.error('Error testing send-sms function:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Execute the test based on command line argument
if (process.argv.includes('--real')) {
  console.log("🚨 SENDING REAL SMS - THIS IS NOT A DRILL 🚨");
  testSendRealSMS()
    .then(result => {
      console.log('Real SMS test completed with result:', result.success ? 'SUCCESS' : 'FAILURE');
      process.exit(result.success ? 0 : 1);
    });
} else {
  // Default to debug mode
  testSendSMS()
    .then(result => {
      console.log('Test completed with result:', result.success ? 'SUCCESS' : 'FAILURE');
      process.exit(result.success ? 0 : 1);
    });
} 
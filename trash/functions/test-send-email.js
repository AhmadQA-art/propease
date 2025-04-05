#!/usr/bin/env node
require('dotenv').config();

// Test script for send-email function
const fetch = require('node-fetch');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ljojrcciojdprmvrtbdb.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxqb2pyY2Npb2pkcHJtdnJ0YmRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2MTM5MTMsImV4cCI6MjA1NDE4OTkxM30.-iqJefSjdHCvChvfYXnZOJIqKHTympzRpVSOy7R2bRc';

// Function to send actual email (without debug flag)
async function testSendRealEmail() {
  try {
    console.log(`📧 Sending REAL EMAIL to ${process.env.TEST_EMAIL || 'ahmadmesbahqa@gmail.com'}...`);
    console.log(`⚠️ This will send an actual email to the recipient!`);
    
    const testEmail = process.env.TEST_EMAIL || 'ahmadmesbahqa@gmail.com';
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        email: testEmail,
        subject: 'REAL TEST: Propease System',
        text: 'This is a REAL email test message. If you received this, the email sending system is working properly!',
        firstName: 'Ahmad'
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
    console.error('Error testing send-email function:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Default test function with debug flag
async function testSendEmail() {
  try {
    console.log(`Testing send-email function on ${SUPABASE_URL}...`);
    const testEmail = process.env.TEST_EMAIL || 'ahmadmesbahqa@gmail.com';
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        email: testEmail,
        subject: 'Test Email from Edge Function',
        text: 'This is a test email to verify the send-email edge function is working.',
        firstName: 'Test',
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
    console.error('Error testing send-email function:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Execute the test based on command line argument
if (process.argv.includes('--real')) {
  console.log("🚨 SENDING REAL EMAIL - THIS IS NOT A DRILL 🚨");
  testSendRealEmail()
    .then(result => {
      console.log('Real email test completed with result:', result.success ? 'SUCCESS' : 'FAILURE');
      process.exit(result.success ? 0 : 1);
    });
} else {
  // Default to debug mode
  testSendEmail()
    .then(result => {
      console.log('Test completed with result:', result.success ? 'SUCCESS' : 'FAILURE');
      process.exit(result.success ? 0 : 1);
    });
} 
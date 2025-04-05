#!/usr/bin/env node
require('dotenv').config();

// Test script for send-whatsapp function
const fetch = require('node-fetch');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ljojrcciojdprmvrtbdb.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxqb2pyY2Npb2pkcHJtdnJ0YmRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2MTM5MTMsImV4cCI6MjA1NDE4OTkxM30.-iqJefSjdHCvChvfYXnZOJIqKHTympzRpVSOy7R2bRc';

// Function to send actual WhatsApp (without debug flag)
async function testSendRealWhatsapp() {
  try {
    console.log(`💬 Sending REAL WhatsApp to ${process.env.TEST_WHATSAPP_NUMBER || '+201151359701'}...`);
    console.log(`⚠️ This will send an actual WhatsApp message to the recipient!`);
    
    const testPhone = process.env.TEST_WHATSAPP_NUMBER || '+201151359701';
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-whatsapp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        to: testPhone,
        templateName: 'general_announcement',
        placeholders: [
          'REAL TEST: Propease System',
          'This is a REAL WhatsApp test message. If you received this, the system is working properly!'
        ]
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
    console.error('Error testing send-whatsapp function:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Default test function with debug flag
async function testSendWhatsapp() {
  try {
    console.log(`Testing send-whatsapp function on ${SUPABASE_URL}...`);
    const testPhone = process.env.TEST_WHATSAPP_NUMBER || '+201151359701';
    
    console.log(`Using test WhatsApp number: ${testPhone}`);
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-whatsapp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        to: testPhone,
        templateName: 'general_announcement',
        placeholders: [
          'Test Announcement',
          'This is a test WhatsApp message to verify the send-whatsapp edge function is working.'
        ],
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
    console.error('Error testing send-whatsapp function:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Execute the test based on command line argument
if (process.argv.includes('--real')) {
  console.log("🚨 SENDING REAL WHATSAPP - THIS IS NOT A DRILL 🚨");
  testSendRealWhatsapp()
    .then(result => {
      console.log('Real WhatsApp test completed with result:', result.success ? 'SUCCESS' : 'FAILURE');
      process.exit(result.success ? 0 : 1);
    });
} else {
  // Default to debug mode
  testSendWhatsapp()
    .then(result => {
      console.log('Test completed with result:', result.success ? 'SUCCESS' : 'FAILURE');
      process.exit(result.success ? 0 : 1);
    });
} 
#!/usr/bin/env node
require('dotenv').config();
// Debug script for edge functions
const fetch = require('node-fetch');

// Get environment variables with correct fallbacks
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ljojrcciojdprmvrtbdb.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxqb2pyY2Npb2pkcHJtdnJ0YmRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2MTM5MTMsImV4cCI6MjA1NDE4OTkxM30.-iqJefSjdHCvChvfYXnZOJIqKHTympzRpVSOy7R2bRc';
const INFOBIP_BASE_URL = process.env.INFOBIP_BASE_URL || 'https://9kg1xy.api.infobip.com';

// For Supabase CLI development, check if the functions are running
async function checkFunctionsStatus() {
  try {
    console.log('Checking if Supabase Edge Functions are running...');
    
    // Get a list of functions
    const response = await fetch(`${SUPABASE_URL}/functions/v1`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    if (response.ok) {
      console.log('✅ Supabase Functions API is responding');
      return true;
    } else {
      console.log('❌ Supabase Functions API is not responding correctly:', response.status);
      console.log('Response:', await response.text());
      return false;
    }
  } catch (error) {
    console.error('❌ Error checking functions status:', error.message);
    return false;
  }
}

// Test minimal echo function to verify basic functionality
async function testEcho() {
  try {
    console.log('Testing echo function with minimal code...');
    
    // Create a temporary echo function in _shared/debug/echo.ts
    console.log('Creating echo function...');
    
    // Send test request
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        debug: true,
        test: 'This is a test'
      })
    });
    
    console.log('Response status:', response.status);
    try {
      const data = await response.json();
      console.log('Response data:', JSON.stringify(data, null, 2));
    } catch (e) {
      console.log('Response text:', await response.text());
    }
    
    return {
      success: response.ok,
      status: response.status
    };
  } catch (error) {
    console.error('Error testing echo function:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Check environment variables
function checkEnvironment() {
  console.log('\n--- Environment Variables Check ---');
  
  // Check Supabase URL
  if (!process.env.SUPABASE_URL) {
    console.log('⚠️ SUPABASE_URL not set, using default:', SUPABASE_URL);
  } else {
    console.log('✅ SUPABASE_URL:', process.env.SUPABASE_URL);
  }
  
  // Check Supabase Anon Key
  if (!process.env.SUPABASE_ANON_KEY) {
    console.log('⚠️ SUPABASE_ANON_KEY not set, using default placeholder');
  } else {
    console.log('✅ SUPABASE_ANON_KEY is set (value hidden)');
  }
  
  console.log('----------------------------------\n');
}

// Run debug tests
async function runDebug() {
  console.log('==== Edge Function Debug Tool ====');
  
  // Check environment variables
  checkEnvironment();
  
  // Step 1: Check if functions are running
  const functionsRunning = await checkFunctionsStatus();
  if (!functionsRunning) {
    console.log('\n⚠️ Supabase Edge Functions may not be running properly.');
    console.log('Try running: supabase functions serve');
    console.log('Or if deployed: check your Supabase project settings');
  }
  
  // Step 2: Test echo function
  console.log('\n--- Testing Basic Function Response ---');
  const echoResult = await testEcho();
  
  // Summary
  console.log('\n=== Debug Summary ===');
  if (functionsRunning) {
    console.log('✅ Functions API is responding');
  } else {
    console.log('❌ Functions API is not responding correctly');
  }
  
  if (echoResult.success) {
    console.log('✅ Basic function test succeeded');
  } else {
    console.log('❌ Basic function test failed');
    console.log('   This suggests issues with the function code or environment');
  }
  
  console.log('\nNext steps:');
  console.log('1. Check Supabase dashboard logs for edge function errors');
  console.log('2. Verify Infobip API credentials are correctly set');
  console.log('3. Run "supabase functions serve" locally for live debugging');
}

// Execute the debug
runDebug(); 
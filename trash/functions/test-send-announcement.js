#!/usr/bin/env node

// Test script for send-announcement function
const fetch = require('node-fetch');

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

// You need to create an announcement in the database first and get its ID
const ANNOUNCEMENT_ID = process.env.TEST_ANNOUNCEMENT_ID || 'your-test-announcement-id';

async function testSendAnnouncement() {
  try {
    console.log(`Testing send-announcement with announcement ID: ${ANNOUNCEMENT_ID}`);
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-announcement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        announcementId: ANNOUNCEMENT_ID
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
    console.error('Error testing send-announcement function:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Execute the test
testSendAnnouncement()
  .then(result => {
    console.log('Test completed with result:', result.success ? 'SUCCESS' : 'FAILURE');
    process.exit(result.success ? 0 : 1);
  }); 
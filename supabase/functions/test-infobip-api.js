#!/usr/bin/env node

// Direct test script for Infobip API
// This bypasses Supabase Edge Functions to test the API directly
const fetch = require('node-fetch');
const FormData = require('form-data');

// Load .env file if it exists
require('dotenv').config();

// Infobip credentials - from environment or defaults
const INFOBIP_BASE_URL = process.env.INFOBIP_BASE_URL || 'https://9kg1xy.api.infobip.com';
const INFOBIP_API_KEY = process.env.INFOBIP_API_KEY || '14054828b2fbf700bfeffa15f306167e-5a626b8d-fd34-4f6d-b62b-fb10beda64cc';
const INFOBIP_WHATSAPP_NUMBER = process.env.INFOBIP_WHATSAPP_NUMBER || '447860099299';

// Test recipient details - use your own test contacts
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@example.com';
const TEST_PHONE = process.env.TEST_PHONE_NUMBER || '+1234567890';
const TEST_WHATSAPP = process.env.TEST_WHATSAPP_NUMBER || '+1234567890';

// Test email sending
async function testEmailAPI() {
  console.log('\n--- Testing Infobip Email API ---');
  console.log(`Sending test email to ${TEST_EMAIL}`);
  
  try {
    const formData = new FormData();
    formData.append('from', 'propease <test@propeasesolutions.com>');
    formData.append('subject', 'Test Email from Infobip API');
    
    // Add recipient with placeholder
    const recipientJson = JSON.stringify({ 
      to: TEST_EMAIL, 
      placeholders: { firstName: 'Test' } 
    });
    formData.append('to', recipientJson);
    
    // Add message content with placeholder
    formData.append('text', 'Hi {{firstName}}, this is a test message sent directly via Infobip API.');
    
    const response = await fetch(`${INFOBIP_BASE_URL}/email/3/send`, {
      method: 'POST',
      headers: {
        'Authorization': `App ${INFOBIP_API_KEY}`,
        'Accept': 'application/json'
      },
      body: formData
    });
    
    let data;
    try {
      data = await response.json();
    } catch (e) {
      console.log('Failed to parse JSON response. Raw response:', await response.text());
      return { success: false };
    }
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    return {
      success: response.ok,
      status: response.status,
      data
    };
  } catch (error) {
    console.error('Error testing email API:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Test SMS sending
async function testSmsAPI() {
  console.log('\n--- Testing Infobip SMS API ---');
  console.log(`Sending test SMS to ${TEST_PHONE}`);
  
  try {
    const response = await fetch(`${INFOBIP_BASE_URL}/sms/2/text/advanced`, {
      method: 'POST',
      headers: {
        'Authorization': `App ${INFOBIP_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        messages: [{
          destinations: [{ to: TEST_PHONE }],
          from: 'ServiceSMS',
          text: 'This is a test SMS sent directly via Infobip API.'
        }]
      })
    });
    
    let data;
    try {
      data = await response.json();
    } catch (e) {
      console.log('Failed to parse JSON response. Raw response:', await response.text());
      return { success: false };
    }
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    return {
      success: response.ok,
      status: response.status,
      data
    };
  } catch (error) {
    console.error('Error testing SMS API:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Test WhatsApp sending
async function testWhatsAppAPI() {
  console.log('\n--- Testing Infobip WhatsApp API ---');
  console.log(`Sending test WhatsApp message to ${TEST_WHATSAPP}`);
  
  try {
    // Generate a unique message ID
    const messageId = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
    
    const response = await fetch(`${INFOBIP_BASE_URL}/whatsapp/1/message/template`, {
      method: 'POST',
      headers: {
        'Authorization': `App ${INFOBIP_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        messages: [{
          from: INFOBIP_WHATSAPP_NUMBER,
          to: TEST_WHATSAPP,
          messageId: messageId,
          content: {
            templateName: 'general_announcement',
            templateData: {
              body: {
                placeholders: [
                  'Test Announcement',
                  'This is a test WhatsApp message sent directly via Infobip API.'
                ]
              }
            },
            language: 'en'
          }
        }]
      })
    });
    
    let data;
    try {
      data = await response.json();
    } catch (e) {
      console.log('Failed to parse JSON response. Raw response:', await response.text());
      return { success: false };
    }
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    return {
      success: response.ok,
      status: response.status,
      data
    };
  } catch (error) {
    console.error('Error testing WhatsApp API:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run all tests
async function runAllTests() {
  console.log('==== Infobip API Direct Test Tool ====');
  console.log('API Base URL:', INFOBIP_BASE_URL);
  console.log('API Key (truncated):', INFOBIP_API_KEY.substring(0, 8) + '...');
  
  const emailResult = await testEmailAPI();
  const smsResult = await testSmsAPI();
  const whatsappResult = await testWhatsAppAPI();
  
  console.log('\n=== Test Results Summary ===');
  console.log('Email API:', emailResult.success ? 'SUCCESS' : 'FAILED');
  console.log('SMS API:', smsResult.success ? 'SUCCESS' : 'FAILED');
  console.log('WhatsApp API:', whatsappResult.success ? 'SUCCESS' : 'FAILED');
  
  // Return overall success status for script exit code
  return (emailResult.success || smsResult.success || whatsappResult.success);
}

// Run the tests and exit with appropriate code
runAllTests()
  .then(overallSuccess => {
    console.log('\nTest run completed.');
    process.exit(overallSuccess ? 0 : 1);
  })
  .catch(error => {
    console.error('Error running tests:', error);
    process.exit(1);
  }); 
/**
 * Script to register WhatsApp templates with Infobip
 * 
 * Usage:
 * 1. npm install node-fetch
 * 2. node register-whatsapp-templates.js
 */

const fetch = require('node-fetch');

// Infobip API config
const INFOBIP_CONFIG = {
  BASE_URL: 'https://9kg1xy.api.infobip.com',
  API_KEY: '14054828b2fbf700bfeffa15f306167e-5a626b8d-fd34-4f6d-b62b-fb10beda64cc'
};

// Templates to register
const templates = [
  {
    name: 'general_announcement',
    language: 'en',
    category: 'MARKETING',
    text: 'Announcement: {{1}}\n{{2}}'
  },
  {
    name: 'community_event',
    language: 'en',
    category: 'MARKETING',
    text: 'Join us for {{1}} on {{2}} at {{3}}'
  }
];

// Function to register a template
async function registerTemplate(template) {
  try {
    const url = `${INFOBIP_CONFIG.BASE_URL}/whatsapp/1/message/template`;
    const headers = {
      'Authorization': `App ${INFOBIP_CONFIG.API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    const body = {
      name: template.name,
      language: template.language,
      category: template.category,
      structure: {
        body: {
          text: template.text
        }
      }
    };

    console.log(`Registering template: ${template.name}`);
    console.log(JSON.stringify(body, null, 2));

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error(`Failed to register template ${template.name}:`, data);
      return false;
    }

    console.log(`Successfully registered template ${template.name}:`, data);
    return true;
  } catch (error) {
    console.error(`Error registering template ${template.name}:`, error);
    return false;
  }
}

// Main function to register all templates
async function registerAllTemplates() {
  console.log('Starting template registration...');
  
  let successes = 0;
  let failures = 0;
  
  for (const template of templates) {
    const success = await registerTemplate(template);
    if (success) {
      successes++;
    } else {
      failures++;
    }
  }
  
  console.log('Template registration complete:');
  console.log(`- Successful: ${successes}`);
  console.log(`- Failed: ${failures}`);
}

// Run the script
registerAllTemplates().catch(error => {
  console.error('Script execution failed:', error);
  process.exit(1);
}); 
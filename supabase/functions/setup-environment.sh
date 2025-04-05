#!/bin/bash

# Environment Setup Script for Propease Edge Functions
# This script helps set up the required environment for running and testing edge functions

# Set colored output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to prompt for values
prompt_value() {
  local name=$1
  local default=$2
  local current=$3
  local is_secret=$4
  
  if [ -n "$current" ] && [ "$current" != "$default" ]; then
    if [ "$is_secret" = true ]; then
      echo -n "Enter $name (currently set) [$default]: "
    else
      echo -n "Enter $name (current: $current) [$default]: "
    fi
  else
    echo -n "Enter $name [$default]: "
  fi
  
  read value
  if [ -z "$value" ]; then
    echo $default
  else
    echo $value
  fi
}

# Check if .env file exists
if [ -f .env ]; then
  source .env
  echo -e "${GREEN}Loaded existing .env file${NC}"
else
  echo -e "${YELLOW}No .env file found, will create one${NC}"
fi

echo -e "\n${BLUE}===== Propease Edge Functions Environment Setup =====${NC}"
echo -e "This script will help you configure the environment variables needed by the Supabase Edge Functions.\n"

# Supabase Configuration
echo -e "${BLUE}--- Supabase Configuration ---${NC}"
SUPABASE_URL=$(prompt_value "Supabase URL" "https://ljojrcciojdprmvrtbdb.supabase.co" "$SUPABASE_URL" false)
SUPABASE_ANON_KEY=$(prompt_value "Supabase Anon Key" "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxqb2pyY2Npb2pkcHJtdnJ0YmRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2MTM5MTMsImV4cCI6MjA1NDE4OTkxM30.-iqJefSjdHCvChvfYXnZOJIqKHTympzRpVSOy7R2bRc" "$SUPABASE_ANON_KEY" true)
SUPABASE_SERVICE_ROLE_KEY=$(prompt_value "Supabase Service Role Key" "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxqb2pyY2Npb2pkcHJtdnJ0YmRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODYxMzkxMywiZXhwIjoyMDU0MTg5OTEzfQ.iSwJVhqLhi6PNdDbuSAIGr8Xu2QRmJkkZvsmNecx7QI" "$SUPABASE_SERVICE_ROLE_KEY" true)

# Infobip API Configuration
echo -e "\n${BLUE}--- Infobip API Configuration ---${NC}"
INFOBIP_API_KEY=$(prompt_value "Infobip API Key" "your-infobip-api-key" "$INFOBIP_API_KEY" true)
INFOBIP_BASE_URL=$(prompt_value "Infobip Base URL" "https://xxxxx.api.infobip.com" "$INFOBIP_BASE_URL" false)
INFOBIP_WHATSAPP_NUMBER=$(prompt_value "Infobip WhatsApp Number" "+1234567890" "$INFOBIP_WHATSAPP_NUMBER" false)

# Testing Configuration
echo -e "\n${BLUE}--- Testing Configuration ---${NC}"
echo -e "${YELLOW}Note: For testing the announcement system, you can create a test announcement in the database and use its ID below.${NC}"
TEST_ANNOUNCEMENT_ID=$(prompt_value "Test Announcement ID (optional)" "" "$TEST_ANNOUNCEMENT_ID" false)
TEST_EMAIL=$(prompt_value "Test Email Address" "test@example.com" "$TEST_EMAIL" false)
TEST_PHONE_NUMBER=$(prompt_value "Test Phone Number" "+1234567890" "$TEST_PHONE_NUMBER" false)
TEST_WHATSAPP_NUMBER=$(prompt_value "Test WhatsApp Number" "+1234567890" "$TEST_WHATSAPP_NUMBER" false)

# Create or update .env file
cat > .env << EOL
# Supabase Configuration
SUPABASE_URL=${SUPABASE_URL}
SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}

# Infobip API Configuration
INFOBIP_API_KEY=${INFOBIP_API_KEY}
INFOBIP_BASE_URL=${INFOBIP_BASE_URL}
INFOBIP_WHATSAPP_NUMBER=${INFOBIP_WHATSAPP_NUMBER}

# Testing Configuration
TEST_ANNOUNCEMENT_ID=${TEST_ANNOUNCEMENT_ID}
TEST_EMAIL=${TEST_EMAIL}
TEST_PHONE_NUMBER=${TEST_PHONE_NUMBER}
TEST_WHATSAPP_NUMBER=${TEST_WHATSAPP_NUMBER}
EOL

echo -e "\n${GREEN}Environment variables saved to .env file${NC}"

# Check if running with Supabase CLI
echo -e "\n${BLUE}--- Configuring Supabase Edge Functions ---${NC}"
if command -v supabase &> /dev/null; then
  echo -e "${GREEN}Supabase CLI is installed${NC}"
  
  echo -e "\nWould you like to set up environment variables in Supabase functions now? (y/n)"
  read setup_vars
  
  if [ "$setup_vars" = "y" ] || [ "$setup_vars" = "Y" ]; then
    echo -e "\n${YELLOW}Setting environment variables for local development...${NC}"
    
    # Set key environment variables
    supabase secrets set API_URL=$SUPABASE_URL
    supabase secrets set SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
    supabase secrets set ANON_KEY=$SUPABASE_ANON_KEY
    
    # Set Infobip variables
    supabase secrets set INFOBIP_API_KEY=$INFOBIP_API_KEY
    supabase secrets set INFOBIP_BASE_URL=$INFOBIP_BASE_URL
    supabase secrets set INFOBIP_WHATSAPP_NUMBER=$INFOBIP_WHATSAPP_NUMBER
    
    echo -e "\n${GREEN}Environment variables set in Supabase Edge Functions${NC}"
  else
    echo -e "\n${YELLOW}Skipped setting Supabase environment variables${NC}"
    echo -e "To set them manually, run:"
    echo "  supabase secrets set API_URL=$SUPABASE_URL"
    echo "  supabase secrets set SERVICE_ROLE_KEY=your-service-role-key"
    echo "  supabase secrets set ANON_KEY=your-anon-key"
    echo "  supabase secrets set INFOBIP_API_KEY=your-infobip-api-key"
    echo "  supabase secrets set INFOBIP_BASE_URL=$INFOBIP_BASE_URL"
    echo "  supabase secrets set INFOBIP_WHATSAPP_NUMBER=$INFOBIP_WHATSAPP_NUMBER"
  fi
else
  echo -e "${YELLOW}Supabase CLI not installed${NC}"
  echo -e "To install Supabase CLI, follow the instructions at: https://supabase.com/docs/guides/cli"
  echo -e "After installing, set environment variables using:"
  echo "  supabase secrets set API_URL=$SUPABASE_URL"
  echo "  supabase secrets set SERVICE_ROLE_KEY=your-service-role-key"
  echo "  supabase secrets set ANON_KEY=your-anon-key"
  echo "  supabase secrets set INFOBIP_API_KEY=your-infobip-api-key"
  echo "  supabase secrets set INFOBIP_BASE_URL=$INFOBIP_BASE_URL"
  echo "  supabase secrets set INFOBIP_WHATSAPP_NUMBER=$INFOBIP_WHATSAPP_NUMBER"
fi

echo -e "\n${BLUE}=== Setup Complete ===${NC}"
echo -e "You can now run the test scripts with the configured environment."
echo -e "  ./test-runner.sh           # Run all tests"
echo -e "  ./test-debug.js            # Diagnose edge function issues"
echo -e ""
echo -e "${YELLOW}Note: If testing remotely deployed functions, make sure to deploy with:${NC}"
echo -e "  supabase functions deploy [function-name]"

# Make test scripts executable
chmod +x test-runner.sh
chmod +x test-debug.js
echo -e "\n${GREEN}Made test scripts executable${NC}" 
#!/bin/bash

# Test runner for Announcement Edge Functions
# This script tests all the announcement-related edge functions

# Set environment variables for Supabase
export SUPABASE_URL='https://ljojrcciojdprmvrtbdb.supabase.co'
export SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxqb2pyY2Npb2pkcHJtdnJ0YmRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2MTM5MTMsImV4cCI6MjA1NDE4OTkxM30.-iqJefSjdHCvChvfYXnZOJIqKHTympzRpVSOy7R2bRc'
export SUPABASE_SERVICE_ROLE_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxqb2pyY2Npb2pkcHJtdnJ0YmRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODYxMzkxMywiZXhwIjoyMDU0MTg5OTEzfQ.iSwJVhqLhi6PNdDbuSAIGr8Xu2QRmJkkZvsmNecx7QI'

# Set environment variables for Infobip
export INFOBIP_BASE_URL="https://9kg1xy.api.infobip.com"
export INFOBIP_API_KEY="14054828b2fbf700bfeffa15f306167e-5a626b8d-fd34-4f6d-b62b-fb10beda64cc"
export INFOBIP_WHATSAPP_NUMBER="447860099299"

# Set colored output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get real mode flag
REAL_MODE=false
if [[ "$*" == *"--real"* ]]; then
  REAL_MODE=true
  echo -e "${RED}⚠️ REAL MODE ENABLED - ACTUAL MESSAGES WILL BE SENT ⚠️${NC}"
  echo -e "Messages will be sent to: "
  echo -e "  Email: ${YELLOW}${TEST_EMAIL:-ahmadmesbahqa@gmail.com}${NC}"
  echo -e "  SMS: ${YELLOW}${TEST_PHONE_NUMBER:-+97477968296}${NC}"
  echo -e "  WhatsApp: ${YELLOW}${TEST_WHATSAPP_NUMBER:-+201151359701}${NC}"
  echo
  read -p "Are you sure you want to continue? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted"
    exit 1
  fi
fi

# Configuration - load from .env file if exists
if [ -f .env ]; then
  source .env
fi

# Test settings
TEST_ANNOUNCEMENT_ID=${TEST_ANNOUNCEMENT_ID:-""}

echo -e "${BLUE}Announcement Edge Functions Test Runner${NC}"
echo -e "Using Supabase URL: ${SUPABASE_URL}"
echo -e "Using Infobip URL: ${INFOBIP_BASE_URL}"

# Check if node is installed
if ! command -v node &> /dev/null; then
  echo -e "${RED}Error: Node.js is required but not installed.${NC}"
  exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
  echo -e "${RED}Error: npm is required but not installed.${NC}"
  exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Installing test dependencies...${NC}"
  npm install node-fetch@2 dotenv
fi

# Verify dotenv is installed
if [ ! -d "node_modules/dotenv" ]; then
  echo -e "${YELLOW}Installing dotenv...${NC}"
  npm install dotenv
fi

# Test send-email function
test_send_email() {
  echo -e "\n${BLUE}Testing send-email function...${NC}"
  if [ "$REAL_MODE" = true ]; then
    echo -e "${YELLOW}Sending a real email...${NC}"
    node test-send-email.js --real
  else
    node test-send-email.js
  fi
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ send-email test passed${NC}"
    return 0
  else
    echo -e "${RED}✗ send-email test failed${NC}"
    return 1
  fi
}

# Test send-sms function
test_send_sms() {
  echo -e "\n${BLUE}Testing send-sms function...${NC}"
  if [ "$REAL_MODE" = true ]; then
    echo -e "${YELLOW}Sending a real SMS...${NC}"
    node test-send-sms.js --real
  else
    node test-send-sms.js
  fi
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ send-sms test passed${NC}"
    return 0
  else
    echo -e "${RED}✗ send-sms test failed${NC}"
    return 1
  fi
}

# Test send-whatsapp function
test_send_whatsapp() {
  echo -e "\n${BLUE}Testing send-whatsapp function...${NC}"
  if [ "$REAL_MODE" = true ]; then
    echo -e "${YELLOW}Sending a real WhatsApp message...${NC}"
    node test-send-whatsapp.js --real
  else
    node test-send-whatsapp.js
  fi
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ send-whatsapp test passed${NC}"
    return 0
  else
    echo -e "${RED}✗ send-whatsapp test failed${NC}"
    return 1
  fi
}

# Test send-announcement function
test_send_announcement() {
  if [ -z "$TEST_ANNOUNCEMENT_ID" ]; then
    echo -e "\n${YELLOW}Skipping send-announcement test (no announcement ID provided)${NC}"
    echo "Set TEST_ANNOUNCEMENT_ID in your environment or .env file"
    return 0
  fi
  
  echo -e "\n${BLUE}Testing send-announcement function...${NC}"
  export TEST_ANNOUNCEMENT_ID=$TEST_ANNOUNCEMENT_ID
  node test-send-announcement.js
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ send-announcement test passed${NC}"
    return 0
  else
    echo -e "${RED}✗ send-announcement test failed${NC}"
    return 1
  fi
}

# Run all tests
run_all_tests() {
  echo -e "\n${BLUE}Running all tests...${NC}"
  
  local failed=0
  
  test_send_email
  if [ $? -ne 0 ]; then
    failed=$((failed+1))
  fi
  
  test_send_sms
  if [ $? -ne 0 ]; then
    failed=$((failed+1))
  fi
  
  test_send_whatsapp
  if [ $? -ne 0 ]; then
    failed=$((failed+1))
  fi
  
  test_send_announcement
  if [ $? -ne 0 ]; then
    failed=$((failed+1))
  fi
  
  echo -e "\n${BLUE}Test Summary:${NC}"
  if [ $failed -eq 0 ]; then
    echo -e "${GREEN}All tests passed successfully!${NC}"
    return 0
  else
    echo -e "${RED}$failed test(s) failed.${NC}"
    return 1
  fi
}

# Process command line arguments
case "$1" in
  email)
    test_send_email
    ;;
  sms)
    test_send_sms
    ;;
  whatsapp)
    test_send_whatsapp
    ;;
  announcement)
    test_send_announcement
    ;;
  *)
    run_all_tests
    ;;
esac

exit $? 
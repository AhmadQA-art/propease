#!/bin/bash

# Set colored output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project reference
PROJECT_REF="ljojrcciojdprmvrtbdb"

# Deploy shared module first
echo -e "${BLUE}Deploying shared module...${NC}"
supabase functions deploy shared --project-ref $PROJECT_REF --no-verify-jwt
if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to deploy shared module. Aborting.${NC}"
  exit 1
fi
echo -e "${GREEN}Shared module deployed successfully${NC}"

# Deploy all functions
functions=(
  "send-email"
  "send-sms"
  "send-whatsapp"
  "send-announcement"
  "process-announcement-batch"
  "register-whatsapp-template"
  "check-schedules"
  "whatsapp-webhook"
)

for func in "${functions[@]}"; do
  echo -e "${BLUE}Deploying $func function...${NC}"
  supabase functions deploy $func --project-ref $PROJECT_REF --no-verify-jwt
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to deploy $func function${NC}"
  else
    echo -e "${GREEN}$func function deployed successfully${NC}"
  fi
done

echo -e "${BLUE}Setting Supabase secrets...${NC}"
# Set environment variables
supabase secrets set INFOBIP_BASE_URL="https://9kg1xy.api.infobip.com" --project-ref $PROJECT_REF
supabase secrets set INFOBIP_API_KEY="14054828b2fbf700bfeffa15f306167e-5a626b8d-fd34-4f6d-b62b-fb10beda64cc" --project-ref $PROJECT_REF
supabase secrets set INFOBIP_WHATSAPP_NUMBER="447860099299" --project-ref $PROJECT_REF

echo -e "${GREEN}All functions deployed and secrets set!${NC}"
echo -e "${YELLOW}To test the functions, run:${NC}"
echo -e "./test-runner.sh" 
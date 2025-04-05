#!/bin/bash

# Set colored output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Production project reference 
PROD_PROJECT_REF="pgghucjqxicqpavxendw"
echo -e "${BLUE}Using production project reference: ${GREEN}$PROD_PROJECT_REF${NC}"

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
  echo -e "${RED}Supabase CLI is not installed. Please install it first.${NC}"
  exit 1
fi

# Login to Supabase (if needed)
echo -e "${BLUE}Checking Supabase login status...${NC}"
if ! supabase projects list &> /dev/null; then
  echo -e "${YELLOW}Please login to Supabase CLI:${NC}"
  supabase login
fi

# Verify production project
echo -e "${BLUE}Verifying production project...${NC}"
if ! supabase projects list | grep -q "$PROD_PROJECT_REF"; then
  echo -e "${RED}Production project with reference '$PROD_PROJECT_REF' not found.${NC}"
  echo -e "${YELLOW}Available projects:${NC}"
  supabase projects list
  exit 1
fi

# Set environment variables for production
echo -e "${BLUE}Setting environment variables for production...${NC}"

# Prompt for environment variables
read -p "Enter INFOBIP_BASE_URL for production: " INFOBIP_BASE_URL
read -p "Enter INFOBIP_API_KEY for production: " INFOBIP_API_KEY
read -p "Enter INFOBIP_WHATSAPP_NUMBER for production: " INFOBIP_WHATSAPP_NUMBER

# Set secrets
supabase secrets set INFOBIP_BASE_URL="$INFOBIP_BASE_URL" --project-ref $PROD_PROJECT_REF
supabase secrets set INFOBIP_API_KEY="$INFOBIP_API_KEY" --project-ref $PROD_PROJECT_REF
supabase secrets set INFOBIP_WHATSAPP_NUMBER="$INFOBIP_WHATSAPP_NUMBER" --project-ref $PROD_PROJECT_REF

# Set additional API keys that might be needed
echo -e "${YELLOW}Do you want to set Supabase API environment variables/secrets for production? (y/n)${NC}"
read set_additional

if [ "$set_additional" = "y" ] || [ "$set_additional" = "Y" ]; then
  echo -e "${BLUE}Setting Supabase API environment variables...${NC}"
  read -p "Enter API_URL (Supabase URL): " API_URL
  read -p "Enter ANON_KEY: " ANON_KEY
  read -p "Enter SERVICE_ROLE_KEY: " SERVICE_ROLE_KEY

  supabase secrets set API_URL="$API_URL" --project-ref $PROD_PROJECT_REF
  supabase secrets set ANON_KEY="$ANON_KEY" --project-ref $PROD_PROJECT_REF
  supabase secrets set SERVICE_ROLE_KEY="$SERVICE_ROLE_KEY" --project-ref $PROD_PROJECT_REF
fi

echo -e "${GREEN}All secrets set for production functions!${NC}" 
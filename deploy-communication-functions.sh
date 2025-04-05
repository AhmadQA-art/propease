#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_message() {
  echo -e "${2}${1}${NC}"
}

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check if supabase CLI is installed
if ! command_exists supabase; then
  print_message "Supabase CLI not found. Installing..." "$YELLOW"
  
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    if command_exists brew; then
      brew install supabase/tap/supabase
    else
      print_message "Homebrew not found. Please install homebrew first: https://brew.sh/" "$RED"
      exit 1
    fi
  elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    curl -s https://api.github.com/repos/supabase/cli/releases/latest | \
      grep "browser_download_url.*$(uname -s | tr '[:upper:]' '[:lower:]')-$(uname -m)" | \
      cut -d : -f 2,3 | \
      tr -d \" | \
      wget -qi - -O supabase
    chmod +x supabase
    sudo mv supabase /usr/local/bin/supabase
  else
    print_message "Unsupported OS. Please install Supabase CLI manually: https://supabase.com/docs/guides/cli" "$RED"
    exit 1
  fi
fi

# Check for supabase project
if [ ! -f "supabase/config.toml" ]; then
  print_message "No Supabase project found. Initializing..." "$YELLOW"
  supabase init
fi

# Rename _shared to shared if it exists but shared doesn't
if [ -d "supabase/functions/_shared" ] && [ ! -d "supabase/functions/shared" ]; then
  print_message "Renaming _shared directory to shared..." "$YELLOW"
  mv supabase/functions/_shared supabase/functions/shared
  
  # Update imports in all function files
  print_message "Updating imports in function files..." "$YELLOW"
  find supabase/functions -name "*.ts" -type f -exec sed -i 's/\.\.\/\_shared/\.\.\/shared/g' {} \;
fi

# Check if we're logged in to Supabase
print_message "Checking Supabase login status..." "$YELLOW"
if ! supabase projects list &>/dev/null; then
  print_message "Not logged in to Supabase. Please log in..." "$YELLOW"
  supabase login
fi

# Create secrets file for deployment
print_message "Creating environment variables file..." "$YELLOW"
cat > .env << EOL
# Supabase configuration
API_URL=https://ljojrcciojdprmvrtbdb.supabase.co
SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxqb2pyY2Npb2pkcHJtdnJ0YmRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODYxMzkxMywiZXhwIjoyMDU0MTg5OTEzfQ.iSwJVhqLhi6PNdDbuSAIGr8Xu2QRmJkkZvsmNecx7QI
ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxqb2pyY2Npb2pkcHJtdnJ0YmRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2MTM5MTMsImV4cCI6MjA1NDE4OTkxM30.N5vvUNaWZ1yLQW2DsOc2vfgmLOMG18W_aAn12S9Esu4

# Infobip configuration
INFOBIP_API_KEY=14054828b2fbf700bfeffa15f306167e-5a626b8d-fd34-4f6d-b62b-fb10beda64cc
INFOBIP_BASE_URL=https://9kg1xy.api.infobip.com
WHATSAPP_NUMBER=447860099299
EOL

# Deploy the functions
print_message "Deploying functions..." "$GREEN"

# First deploy shared modules (renamed from _shared)
print_message "Deploying shared module..." "$YELLOW"
supabase functions deploy shared

# Deploy all other functions
FUNCTIONS=(
  "send-announcement"
  "send-email"
  "send-sms"
  "send-whatsapp"
  "whatsapp-webhook"
  "check-schedules"
  "register-whatsapp-template"
)

for func in "${FUNCTIONS[@]}"; do
  print_message "Deploying $func..." "$YELLOW"
  supabase functions deploy "$func"
done

# Apply database migrations
print_message "Applying database migrations..." "$YELLOW"
cd supabase
supabase db push
cd ..

# Set environment variables from file
print_message "Setting environment variables..." "$YELLOW"
supabase secrets set --env-file .env

# Clean up
print_message "Cleaning up temporary files..." "$YELLOW"
rm .env

print_message "\nDeployment complete! Your functions are now live at:" "$GREEN"
print_message "https://ljojrcciojdprmvrtbdb.supabase.co/functions/v1/[function-name]" "$GREEN"

print_message "\nTo test the announcement system:" "$GREEN"
print_message "1. Create an announcement in the Communications page" "$GREEN"
print_message "2. Select one or more properties with active leases" "$GREEN"
print_message "3. Choose your preferred communication methods" "$GREEN"
print_message "4. Click 'Send Now' to trigger the send-announcement function" "$GREEN"

print_message "\nFor scheduled announcements:" "$GREEN"
print_message "1. Create an announcement with the 'Schedule for later' option" "$GREEN"
print_message "2. Set the date and time" "$GREEN"
print_message "3. The check-schedules function will process it at the scheduled time" "$GREEN"
print_message "   (You'll need to set up a cron job to call this function regularly)" "$GREEN" 
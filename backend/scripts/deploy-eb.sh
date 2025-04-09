#!/bin/bash

# Exit on error
set -e

# Navigate to the backend directory if not already there
cd "$(dirname "$0")/.."

# Clear previous deployment package if it exists
rm -f eb-deploy.zip

# Install production dependencies
echo "Installing production dependencies..."
npm ci --production

# Create deployment package
echo "Creating deployment package..."
zip -r eb-deploy.zip . -x "node_modules/*" "*.git*" "*.env*" "postman/*" "*.md" "dist/*" "netlify/*" "scripts/*"

# Install dev dependencies back for local development
echo "Reinstalling development dependencies..."
npm install

echo "Deployment package created: eb-deploy.zip"
echo "Use the AWS Management Console or AWS CLI to deploy this package to Elastic Beanstalk."
echo ""
echo "Example AWS CLI command:"
echo "aws elasticbeanstalk create-application-version --application-name YOUR_APP_NAME --version-label v1.0.0-$(date +%Y%m%d%H%M%S) --source-bundle S3Bucket=YOUR_S3_BUCKET,S3Key=eb-deploy.zip"
echo "aws elasticbeanstalk update-environment --application-name YOUR_APP_NAME --environment-name YOUR_ENV_NAME --version-label v1.0.0-$(date +%Y%m%d%H%M%S)"

# Make the script executable 
chmod +x "$0" 
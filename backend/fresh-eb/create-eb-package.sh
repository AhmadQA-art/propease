#!/bin/bash

# Exit on error
set -e

# Navigate to the backend directory
cd ..

# Clear previous deployment package if it exists
rm -f fresh-eb.zip

# Copy necessary files to a temporary directory
mkdir -p temp-eb-package
cp -r src package.json fresh-eb/Procfile temp-eb-package/
mkdir -p temp-eb-package/.ebextensions
cp fresh-eb/.ebextensions/nodeconfig.config temp-eb-package/.ebextensions/

# Create .platform directory for Node.js version configuration
mkdir -p temp-eb-package/.platform/hooks/prebuild
cat > temp-eb-package/.platform/hooks/prebuild/01_install_node.sh << 'EOL'
#!/bin/bash
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 20
nvm use 20
nvm alias default 20
echo "Node.js version set to: $(node -v)"
EOL
chmod +x temp-eb-package/.platform/hooks/prebuild/01_install_node.sh

# Create health check endpoint in index.js if it doesn't exist
if ! grep -q "app.get('/health'" temp-eb-package/src/index.js; then
  sed -i '/app.use(express.json());/a\
// Health check endpoint for AWS Elastic Beanstalk\
app.get("/health", (req, res) => {\
  res.status(200).send("OK");\
});' temp-eb-package/src/index.js
fi

# Add root endpoint to redirect to API documentation
if ! grep -q "app.get('/'," temp-eb-package/src/index.js; then
  sed -i '/app.use(express.json());/a\
// Root endpoint\
app.get("/", (req, res) => {\
  res.redirect("/api-docs");\
});' temp-eb-package/src/index.js
fi

# Go to the temporary directory
cd temp-eb-package

# Install production dependencies
echo "Installing production dependencies..."
npm install --production --no-package-lock

# Navigate back to backend directory
cd ..

# Create deployment package
echo "Creating deployment package..."
cd temp-eb-package && zip -r ../fresh-eb.zip * .ebextensions .platform -x "node_modules/*"
cd ..

# Clean up
rm -rf temp-eb-package

echo "Deployment package created: fresh-eb.zip"
echo "Use the AWS Management Console to deploy this package to Elastic Beanstalk." 
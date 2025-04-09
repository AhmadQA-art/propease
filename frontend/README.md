# PropEase Frontend

PropEase is a property management system designed to simplify property management tasks.

## Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment to AWS Amplify

### Method 1: Manual Deployment

1. Set up AWS Amplify:
   - Log in to the AWS Management Console
   - Navigate to AWS Amplify
   - Click "New app" > "Host web app"
   - Choose GitHub as your repository provider
   - Connect to your GitHub account
   - Select your repository and branch
   - Configure build settings as follows:

   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - nvm install 20
           - nvm use 20
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: dist
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
         - .npm/**/*
   ```

2. Environment Variables:
   Set the following environment variables in your Amplify app:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `VITE_API_URL`: Your backend API URL (without trailing slash)
     
   For production environment: Set `VITE_API_URL` to your Elastic Beanstalk URL or custom domain.

3. Configure Rewrites and Redirects:
   - In your Amplify app settings, go to "Rewrites and redirects"
   - Add a rewrite rule to handle API requests:
     - Source: `/api/<*>`
     - Target: `http://your-backend-url.elasticbeanstalk.com/<*>`
     - Type: `Proxy`
   - Add a redirect for client-side routing:
     - Source: `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>`
     - Target: `/index.html`
     - Type: `200 (Rewrite)`

### Method 2: CI/CD Deployment

1. GitHub Workflows:
   - The CI/CD pipelines are already configured in:
     - `.github/workflows/production.yml` - Production deployment
     - `.github/workflows/development.yml` - Development deployment

2. To use these workflows, configure these GitHub secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AMPLIFY_CLI_TOKEN` (from AWS Amplify)
   - `DEV_SUPABASE_URL` (development Supabase URL)
   - `DEV_SUPABASE_ANON_KEY` (development Supabase anon key)
   - `DEV_API_URL` (development API URL)

3. Workflow:
   - Push to `develop` branch to deploy to development environment
   - Merge `develop` to `main` branch to deploy to production environment

## Setting Up a Custom Domain

1. In the AWS Amplify console, select your app
2. Go to "Domain management"
3. Click "Add domain"
4. Enter your domain name
5. Follow the steps to verify ownership
6. Add subdomains if needed (e.g., www)
7. Click "Save"

## Troubleshooting

- **Build errors**: Check the Amplify build logs
- **API connection issues**: Verify the `VITE_API_URL` environment variable
- **CORS errors**: Make sure your backend CORS settings include your Amplify domain

## License

[MIT](LICENSE) 
# PropEase Deployment Guide

This guide explains how to deploy the PropEase application, consisting of a backend API deployed to AWS Elastic Beanstalk and a frontend React application deployed to AWS Amplify.

## Prerequisites

- AWS Account
- GitHub Repository
- Supabase Account with two projects (development and production)
- Node.js 20 installed locally

## Step 1: Deploy the Backend to AWS Elastic Beanstalk

### Current Deployment Information
- Backend URL: http://propease-backend-2-env.eba-mgfe8nm9.us-east-2.elasticbeanstalk.com/

### Deployment Steps
1. Create or update the deployment package:
   ```bash
   cd backend/fresh-eb
   ./create-eb-package.sh
   ```

2. Deploy to Elastic Beanstalk:
   - Log in to the AWS Management Console
   - Go to Elastic Beanstalk
   - Select your application and environment
   - Click on "Upload and Deploy"
   - Upload the `fresh-eb.zip` file created in the previous step
   - Set a version label (e.g., `v1.0.0-production`)
   - Click "Deploy"

3. Configure Environment Variables:
   - In the Elastic Beanstalk console, go to your environment
   - Click "Configuration" > "Software"
   - Under "Environment properties", add the following variables:
     - `NODE_ENV`: `production`
     - `PORT`: `8081`
     - `SUPABASE_URL`: `https://pgghucjqxicqpavxendw.supabase.co`
     - `SUPABASE_SERVICE_KEY`: Your Supabase service role key
     - `CORS_ORIGIN`: Your frontend Amplify URL (once you have it)

## Step 2: Deploy the Frontend to AWS Amplify

### Deployment Steps
1. Log in to the AWS Management Console and go to Amplify

2. Click "New app" > "Host web app"

3. Connect to your GitHub repository:
   - Choose GitHub as the repository provider
   - Connect to your GitHub account
   - Select your repository and the branch to deploy

4. Configure build settings:
   - Confirm the auto-detected settings or use the following:
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

5. Configure environment variables:
   - In the Amplify console, go to your app
   - Click "Environment variables" on the left menu
   - Add the following variables:
     - `VITE_SUPABASE_URL`: `https://pgghucjqxicqpavxendw.supabase.co`
     - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
     - `VITE_API_URL`: `http://propease-backend-2-env.eba-mgfe8nm9.us-east-2.elasticbeanstalk.com`

6. Configure Rewrites and Redirects:
   - In the Amplify console, go to your app
   - Click "Rewrites and redirects" on the left menu
   - Add the following rules:
     - Rule 1 (API Proxy):
       - Source: `/api/<*>`
       - Target: `http://propease-backend-2-env.eba-mgfe8nm9.us-east-2.elasticbeanstalk.com/<*>`
       - Type: `Proxy`
     - Rule 2 (Client-side routing):
       - Source: `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>`
       - Target: `/index.html`
       - Type: `200 (Rewrite)`

7. Save and deploy

### Fixing the CORS Issue
To fix CORS issues, you need to update the CORS configuration on your backend:

1. After your frontend is deployed and you have the Amplify URL, update the `CORS_ORIGIN` environment variable in your Elastic Beanstalk environment to include your Amplify URL.

2. For example, if your Amplify URL is `https://main.d3fa4pbfi6dm3q.amplifyapp.com`, set:
   ```
   CORS_ORIGIN=https://main.d3fa4pbfi6dm3q.amplifyapp.com
   ```

3. If you need to allow multiple origins, separate them with commas.

## Step 3: Set Up CI/CD for Automated Deployments

### GitHub Repository Setup
1. Push your code to GitHub
2. Create two branches:
   - `main` for production
   - `develop` for development

### Configure GitHub Secrets
Add these secrets to your GitHub repository:
- `AWS_ACCESS_KEY_ID`: Your AWS access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
- `AMPLIFY_CLI_TOKEN`: Your Amplify CLI token
- `DEV_SUPABASE_URL`: Your development Supabase URL
- `DEV_SUPABASE_ANON_KEY`: Your development Supabase anon key
- `DEV_API_URL`: Your development API URL

### Deploy Using CI/CD
- To deploy to the development environment, push to the `develop` branch
- To deploy to production, merge the `develop` branch into the `main` branch

## Troubleshooting

### Backend Issues
- **404 Errors**: Make sure your application has a root endpoint
- **CORS Errors**: Ensure the `CORS_ORIGIN` environment variable includes your frontend URL
- **Health Check Issues**: Check if the `/health` endpoint is responding correctly
- **Node.js Version**: Verify if Node.js 20 is installed and being used

### Frontend Issues
- **API Connection**: Check if the `VITE_API_URL` is set correctly
- **Build Failures**: Look at the Amplify build logs for errors
- **Routing Issues**: Make sure your rewrite rules are configured correctly

## Monitoring and Maintenance

### Elastic Beanstalk
- Regularly check the health of your environment
- Monitor logs for errors
- Set up CloudWatch alarms for important metrics

### Amplify
- Review build logs for errors
- Monitor usage metrics
- Keep environment variables updated

## Additional Resources
- [AWS Elastic Beanstalk Documentation](https://docs.aws.amazon.com/elasticbeanstalk/)
- [AWS Amplify Documentation](https://docs.aws.amazon.com/amplify/)
- [Supabase Documentation](https://supabase.com/docs) 
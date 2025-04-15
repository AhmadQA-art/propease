# PropEase Frontend Deployment Guide for AWS Amplify

## Project Structure Overview

```
frontend/
├── .env*               # Environment configuration files
├── build-amplify.*     # Amplify deployment scripts
├── dist/               # Build output directory
├── public/            # Static assets
├── src/               # Source code
├── scripts/           # Build scripts
├── fix/               # Fix utilities
└── config files       # Configuration files for Vite, TypeScript, etc.
```

## Key Configuration Files

### 1. Environment Configuration
- [.env](cci:7://file:///home/ahmadmesbah/Desktop/propease/frontend/.env:0:0-0:0) - Base environment variables
- [.env.development](cci:7://file:///home/ahmadmesbah/Desktop/propease/frontend/.env.development:0:0-0:0) - Development environment
- [.env.production](cci:7://file:///home/ahmadmesbah/Desktop/propease/frontend/.env.production:0:0-0:0) - Production environment
- [.env.example](cci:7://file:///home/ahmadmesbah/Desktop/propease/frontend/.env.example:0:0-0:0) - Template for environment variables

### 2. Build Configuration
- [vite.config.js](cci:7://file:///home/ahmadmesbah/Desktop/propease/frontend/vite.config.js:0:0-0:0) - Main Vite build configuration
- [vite.config.ts](cci:7://file:///home/ahmadmesbah/Desktop/propease/frontend/vite.config.ts:0:0-0:0) - TypeScript version of Vite config
- [build-amplify.js](cci:7://file:///home/ahmadmesbah/Desktop/propease/frontend/build-amplify.js:0:0-0:0) - Custom Amplify deployment script

### 3. TypeScript Configuration
- [tsconfig.json](cci:7://file:///home/ahmadmesbah/Desktop/propease/frontend/tsconfig.json:0:0-0:0) - Root TypeScript configuration
- [tsconfig.app.json](cci:7://file:///home/ahmadmesbah/Desktop/propease/frontend/tsconfig.app.json:0:0-0:0) - Application-specific TypeScript config
- [tsconfig.node.json](cci:7://file:///home/ahmadmesbah/Desktop/propease/frontend/tsconfig.node.json:0:0-0:0) - Node.js TypeScript config

## Build and Deployment Process

### 1. Build Commands
```bash
# Development build
npm run dev

# Production build
npm run build

# Amplify-specific build
npm run build-amplify
```

### 2. Amplify Build Settings
- Base directory: `/frontend`
- Build command: `npm run build`
- Start command: `npm run preview`
- Build output: `dist`

### 3. Important Notes for Amplify
1. Ensure all environment variables are properly set in Amplify console
2. The `build-amplify.js` script creates necessary placeholder files for deployment
3. The `dist` directory should be the root of your Amplify app
4. Keep `.env.production` up to date with production configuration

## Common Deployment Issues and Solutions

### 1. Environment Variables
- Ensure all required environment variables are set in Amplify console
- Check `.env.production` for required variables
- Use `.env.example` as a reference for required variables

### 2. Build Output
- Verify `dist` directory is properly populated after build
- Check for any build errors in the console
- Ensure all static assets are correctly copied

### 3. Routing
- React Router is used for client-side routing
- Ensure Amplify is configured to handle client-side routing
- Add appropriate rewrite rules in Amplify console

## Security Considerations

1. Never commit sensitive information to version control
2. Use Amplify environment variables for sensitive configuration
3. Regularly review and update security settings in Amplify console
4. Implement proper CORS configuration for Supabase integration

## Troubleshooting

1. Build Failures:
   - Check build logs for specific errors
   - Verify all dependencies are installed
   - Ensure proper TypeScript configuration

2. Deployment Issues:
   - Verify Amplify build settings
   - Check environment variables
   - Review deployment logs in Amplify console

3. Performance:
   - Monitor build times
   - Optimize images and assets
   - Implement proper caching strategies

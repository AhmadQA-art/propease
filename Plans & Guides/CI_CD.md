### Key Points
- It seems likely that setting up development and production branches with a CI/CD pipeline involves using Git for branching and AWS/Github Actions for automation, with testing integrated at each stage.
- Research suggests a Gitflow-inspired strategy with feature flags and environment-specific deployments ensures robust separation and testing.
- The evidence leans toward using AWS Amplify for frontend CI/CD and AWS CodePipeline for backend CI/CD, with GitHub Actions as an alternative for both.

### Detailed Steps for Development and Production Branches and CI/CD Pipeline

Here’s a comprehensive guide to creating development and production branches, setting up a CI/CD pipeline, and managing testing, development, and production of features for your React/Vite frontend on AWS Amplify and Node.js/Express backend on AWS Elastic Beanstalk, integrated with Supabase.

---

### Step 1: Set Up Git Branches
Adopt a Git branching strategy to separate development and production code effectively.

1. **Initialize Git Repository (If Not Already Done)**:
   - Ensure your project is in a GitHub repository:
     ```
     git init
     git add .
     git commit -m "Initial commit"
     git remote add origin git@github.com:your-username/your-repo.git
     git push -u origin main
     ```

2. **Create Production Branch (`main`)**:
   - The `main` branch will hold production-ready code:
     ```
     git checkout main
     ```

3. **Create Development Branch (`dev`)**:
   - Branch off `main` for development work:
     ```
     git checkout -b dev
     git push origin dev
     ```

4. **Feature Branch Workflow**:
   - For new features, create branches off `dev`:
     ```
     git checkout dev
     git checkout -b feature/new-feature
     # Work on feature
     git add .
     git commit -m "Add new feature"
     git push origin feature/new-feature
     ```
   - Merge back to `dev` after testing:
     ```
     git checkout dev
     git merge feature/new-feature
     git push origin dev
     ```

5. **Merge to Production**:
   - Once features are tested and stable in `dev`, merge to `main`:
     ```
     git checkout main
     git merge dev
     git push origin main
     ```

---

### Step 2: Configure Environment-Specific Settings
Use environment variables and feature flags to control behavior across environments.

#### Frontend (React/Vite)
1. **Create Environment Files**:
   - In `frontend/`:
     - `.env.development`:
       ```
       VITE_SUPABASE_URL=https://your-dev-supabase-url.supabase.co
       VITE_SUPABASE_KEY=your-dev-anon-key
       VITE_BACKEND_URL=http://propease-backend-dev.us-east-1.elasticbeanstalk.com
       VITE_ENABLE_NEW_FEATURE=true
       ```
     - `.env.production`:
       ```
       VITE_SUPABASE_URL=https://your-prod-supabase-url.supabase.co
       VITE_SUPABASE_KEY=your-prod-anon-key
       VITE_BACKEND_URL=http://propease-backend.us-east-1.elasticbeanstalk.com
       VITE_ENABLE_NEW_FEATURE=false
       ```

2. **Use Feature Flags**:
   - In `frontend/src/config/featureFlags.js`:
     ```javascript
     export const featureFlags = {
       newFeature: import.meta.env.VITE_ENABLE_NEW_FEATURE === "true",
     };
     ```
   - In components:
     ```javascript
     import { featureFlags } from "../config/featureFlags";

     function MyComponent() {
       return featureFlags.newFeature ? <NewFeature /> : <StableFeature />;
     }
     ```

#### Backend (Node.js/Express)
1. **Configure Environment Variables**:
   - In `backend/src/index.js`:
     ```javascript
     const port = process.env.PORT;
     const supabaseUrl = process.env.SUPABASE_URL;
     const supabaseKey = process.env.SUPABASE_KEY;
     app.listen(port, () => console.log(`Running on ${port}`));
     ```

2. **Feature Flags**:
   - Add conditional logic:
     ```javascript
     if (process.env.NODE_ENV === "development") {
       app.get("/dev-only", (req, res) => res.send("Dev route"));
     }
     ```

---

### Step 3: Set Up Development and Production Environments

#### Frontend (AWS Amplify)
1. **Production Environment (`main`)**:
   - In Amplify Console:
     - Connect your GitHub repo > Select `main` branch > Auto-build enabled.
     - Set environment variables:
       ```
       VITE_SUPABASE_URL=https://your-prod-supabase-url.supabase.co
       VITE_SUPABASE_KEY=your-prod-anon-key
       VITE_BACKEND_URL=http://propease-backend.us-east-1.elasticbeanstalk.com
       VITE_ENABLE_NEW_FEATURE=false
       ```
     - Deploy URL: e.g., `https://main.xxx.amplifyapp.com`.

2. **Development Environment (`dev`)**:
   - In Amplify > **Branching** > Add `dev` branch:
     - Enable auto-build.
     - Set env vars:
       ```
       VITE_SUPABASE_URL=https://your-dev-supabase-url.supabase.co
       VITE_SUPABASE_KEY=your-dev-anon-key
       VITE_BACKEND_URL=http://propease-backend-dev.us-east-1.elasticbeanstalk.com
       VITE_ENABLE_NEW_FEATURE=true
       ```
     - Deploy URL: e.g., `https://dev.xxx.amplifyapp.com`.

3. **Amplify Build Config (`amplify.yml`)**:
   - In repo root:
     ```yaml
     version: 1
     frontend:
       phases:
         preBuild:
           commands:
             - nvm install 20
             - nvm use 20
             - cd frontend
             - npm ci --cache .npm --prefer-offline
         build:
           commands:
             - npm run build
       artifacts:
         baseDirectory: frontend/dist
         files:
           - '**/*'
       cache:
         paths:
           - frontend/.npm/**/*
     ```

#### Backend (AWS Elastic Beanstalk)
1. **Production Environment (`main`)**:
   - Create environment:
     - Elastic Beanstalk Console > Create environment > Web server > Platform: "Node.js 20 on Amazon Linux 2".
     - Upload `backend.zip` from `main` branch:
       ```
       cd backend
       git checkout main
       zip -r ../backend.zip . -x "*.git*"
       ```
     - Set env vars (Configuration > Software > Environment properties):
       ```
       SUPABASE_URL=https://your-prod-supabase-url.supabase.co
       SUPABASE_KEY=your-prod-anon-key
       NODE_ENV=production
       CORS_ORIGIN=https://main.xxx.amplifyapp.com
       ```
     - URL: e.g., `http://propease-backend.us-east-1.elasticbeanstalk.com`.

2. **Development Environment (`dev`)**:
   - Create a second environment:
     - Same steps, name it `propease-backend-dev`.
     - Upload `backend.zip` from `dev` branch:
       ```
       git checkout dev
       zip -r ../backend.zip . -x "*.git*"
       ```
     - Set env vars:
       ```
       SUPABASE_URL=https://your-dev-supabase-url.supabase.co
       SUPABASE_KEY=your-dev-anon-key
       NODE_ENV=development
       CORS_ORIGIN=https://dev.xxx.amplifyapp.com
       ```
     - URL: e.g., `http://propease-backend-dev.us-east-1.elasticbeanstalk.com`.

3. **Procfile**:
   - In `backend/`:
     ```
     web: npm start
     ```

---

### Step 4: Develop CI/CD Pipeline

#### Frontend CI/CD (AWS Amplify + GitHub Actions)
1. **Amplify Built-In CI/CD**:
   - Already set up with branch auto-builds. Add tests to `amplify.yml`:
     ```yaml
     preBuild:
       commands:
         - nvm install 20
         - nvm use 20
         - cd frontend
         - npm ci --cache .npm --prefer-offline
         - npm test  # Add test script
     ```

2. **GitHub Actions for Testing**:
   - In `.github/workflows/test-frontend.yml`:
     ```yaml
     name: Test Frontend
     on:
       push:
         branches: [dev, main]
       pull_request:
         branches: [dev, main]
     jobs:
       test:
         runs-on: ubuntu-latest
         steps:
           - uses: actions/checkout@v3
           - uses: actions/setup-node@v3
             with:
               node-version: 20
           - run: cd frontend && npm ci
           - run: cd frontend && npm test
     ```
   - Add to `frontend/package.json`:
     ```json
     "scripts": {
       "test": "vitest run"  # Install vitest if needed
     }
     ```

#### Backend CI/CD (AWS CodePipeline)
1. **Set Up CodePipeline for Production**:
   - In AWS Console > CodePipeline > Create pipeline:
     - Source: GitHub (`main` branch).
     - Build: AWS CodeBuild:
       - `buildspec.yml` in `backend/`:
         ```yaml
         version: 0.2
         phases:
           install:
             commands:
               - cd backend
               - npm ci
           build:
             commands:
               - npm test  # Add test script
               - npm run build  # If applicable
           artifacts:
             files:
               - '**/*'
         ```
     - Deploy: Elastic Beanstalk (`propease-backend` environment).
   - Trigger on `main` push.

2. **Development Pipeline**:
   - Create a second pipeline:
     - Source: GitHub (`dev` branch).
     - Deploy to `propease-backend-dev`.

3. **Testing**:
   - Add to `backend/package.json`:
     ```json
     "scripts": {
       "test": "jest"  # Install jest if needed
     }
     ```

#### Alternative: GitHub Actions for Backend
- In `.github/workflows/deploy-backend.yml`:
  ```yaml
  name: Deploy Backend
  on:
    push:
      branches: [main, dev]
  jobs:
    deploy:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - uses: actions/setup-node@v3
          with:
            node-version: 20
        - run: cd backend && npm ci
        - run: cd backend && npm test
        - run: cd backend && zip -r ../backend.zip . -x "*.git*"
        - uses: aws-actions/configure-aws-credentials@v1
          with:
            aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
            aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
            aws-region: us-east-1
        - run: |
            if [ "${{ github.ref }}" == "refs/heads/main" ]; then
              aws elasticbeanstalk update-environment --environment-name propease-backend --application-name propease-backend --version-label ${{ github.sha }} --option-settings file://env-prod.json
            else
              aws elasticbeanstalk update-environment --environment-name propease-backend-dev --application-name propease-backend --version-label ${{ github.sha }} --option-settings file://env-dev.json
            fi
  ```
- Add AWS credentials to GitHub Secrets.

---

### Step 5: Workflow for Features
1. **Develop**:
   - Work on `feature/new-feature` off `dev`.
   - Test locally with `.env.development`.

2. **Test**:
   - Push to `feature/new-feature`, GitHub Actions runs tests.
   - Merge to `dev`, deploy to dev environment, manual testing.

3. **Production**:
   - Merge `dev` to `main`, triggers production deployment.
   - Feature flags ensure only stable features are active.

---

### Survey Note: Detailed CI/CD Pipeline Setup
This guide uses Gitflow-inspired branching, AWS Amplify for frontend CI/CD, and AWS CodePipeline/GitHub Actions for backend CI/CD, ensuring testing, development, and production are separated with automated pipelines.

**Citations**:
- [AWS Amplify CI/CD](https://docs.aws.amazon.com/amplify/latest/userguide/welcome.html)
- [Elastic Beanstalk Deployment](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/create_deploy_nodejs.html)
- [GitHub Actions](https://docs.github.com/en/actions)
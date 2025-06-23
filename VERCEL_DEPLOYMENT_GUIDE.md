# Vercel Deployment Guide for Entry Management Server

## 📋 Prerequisites
- Vercel account
- GitHub repository
- MongoDB Atlas database
- Node.js 16+ installed locally

## 🚀 Deployment Steps

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```
Choose your preferred login method (GitHub, GitLab, Bitbucket, etc.)

### 3. Initialize Deployment
```bash
vercel
```
Follow the prompts:
- **Set up and deploy project?** → Y
- **Which scope?** → Select your team/personal account
- **Link to existing project?** → N (for first deployment)
- **Project name** → entry-management-server (or your preferred name)
- **Directory** → ./
- **Override settings?** → N

### 4. Set Environment Variables
Go to your Vercel Dashboard → Project → Settings → Environment Variables

Add the following variables:

#### Required Variables:
```
NODE_ENV = production
MONGODB_URI = mongodb+srv://parkashmi66:hNYBgbRSXnmQFpd7@cluster0.qjqfglf.mongodb.net/EntryManagement?retryWrites=true&w=majority
JWT_SECRET = your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET = your-super-secret-refresh-key-change-this-in-production
```

#### Optional Variables:
```
PORT = 3000
JWT_EXPIRE = 7d
JWT_REFRESH_EXPIRE = 30d
CORS_ORIGIN = https://your-frontend-domain.vercel.app
RATE_LIMIT_WINDOW_MS = 900000
RATE_LIMIT_MAX_REQUESTS = 100
MAX_FILE_SIZE = 5242880
UPLOAD_PATH = uploads/
BCRYPT_SALT_ROUNDS = 12
MONGODB_TEST_URI = mongodb+srv://parkashmi66:hNYBgbRSXnmQFpd7@cluster0.qjqfglf.mongodb.net/EntryManagementTest?retryWrites=true&w=majority
```

### 5. Deploy to Production
```bash
vercel --prod
```

## 📁 Project Structure for Vercel

```
EntryManagementServer/
├── dist/                     # Compiled TypeScript files
├── src/                      # Source TypeScript files
├── vercel.json              # Vercel configuration
├── package.json             # Dependencies and scripts
└── tsconfig.json            # TypeScript configuration
```

## 🔧 Configuration Files

### vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "regions": ["bom1"]
}
```

### package.json scripts
```json
{
  "scripts": {
    "start": "node dist/index.js",
    "build": "tsc",
    "vercel-build": "npm run build"
  }
}
```

## 🌐 API Endpoints After Deployment

Your deployed API will be available at:
- **Base URL**: `https://your-project-name.vercel.app`
- **Health Check**: `https://your-project-name.vercel.app/api/v1/health`
- **Authentication**: `https://your-project-name.vercel.app/api/v1/auth/*`
- **Entries**: `https://your-project-name.vercel.app/api/v1/entries/*`

## 📱 React Native Integration

Update your React Native app's API configuration:

```typescript
// In your React Native app
const API_BASE_URL = 'https://your-project-name.vercel.app/api/v1';

// Example usage
const apiService = {
  baseURL: API_BASE_URL,
  // ... rest of your API service
};
```

## 🔒 Security Considerations

1. **JWT Secrets**: Change the default JWT secrets in production
2. **CORS Origins**: Update CORS_ORIGIN to match your frontend domain
3. **Rate Limiting**: Adjust rate limits based on your needs
4. **MongoDB**: Ensure your MongoDB Atlas IP whitelist includes Vercel's IPs (or use 0.0.0.0/0)

## 🚨 Troubleshooting

### Common Issues:

1. **Build Failures**
   - Run `npm run build` locally to check for TypeScript errors
   - Ensure all dependencies are in package.json

2. **Environment Variables Not Working**
   - Ensure variables are set in Vercel Dashboard
   - Redeploy after adding variables

3. **Database Connection Issues**
   - Check MongoDB Atlas IP whitelist
   - Verify connection string
   - Check network access in MongoDB Atlas

4. **CORS Issues**
   - Update CORS_ORIGIN environment variable
   - Add your frontend domain to allowed origins

5. **Deployment Timeout**
   - Ensure MongoDB connects quickly
   - Check for any blocking operations in startup

### Quick Test Commands:
```bash
# Test locally after build
npm run build && npm start

# Deploy to Vercel
vercel --prod
```

## 🔄 Continuous Deployment

To enable automatic deployments:
1. Connect your GitHub repository to Vercel
2. Enable auto-deployments in project settings
3. Every push to main branch will trigger a deployment

## 📊 Monitoring

- **Vercel Dashboard**: Monitor function invocations, errors, and performance
- **MongoDB Atlas**: Monitor database connections and queries
- **Logs**: Check Vercel function logs for debugging

---

## 🎉 You're Ready!

Your Entry Management Server is now deployed on Vercel and ready to handle requests from your React Native app! 
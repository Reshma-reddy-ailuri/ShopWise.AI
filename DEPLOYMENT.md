# 🚀 ShopWise AI Deployment Guide

Complete guide to deploy ShopWise AI to production using Vercel (Frontend) and Render (Backend).

## 📋 Prerequisites

- GitHub account
- Vercel account (free)
- Render account (free)
- MongoDB Atlas account (free)
- Cloudinary account (free)
- Stripe account

## 🗄️ Database Setup (MongoDB Atlas)

### 1. Create MongoDB Atlas Cluster
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a new project: "ShopWise AI"
3. Build a database (free tier)
4. Choose AWS, region closest to you
5. Create cluster name: "shopwise-cluster"

### 2. Configure Database Access
1. **Database Access** → Add new user
   - Username: `shopwise-user`
   - Password: Generate secure password
   - Role: `Atlas admin`

2. **Network Access** → Add IP Address
   - Add `0.0.0.0/0` (allow from anywhere)
   - Or add specific IPs for better security

### 3. Get Connection String
1. **Clusters** → Connect → Connect your application
2. Copy connection string:
   ```
   mongodb+srv://shopwise-user:<password>@shopwise-cluster.xxxxx.mongodb.net/shopwise?retryWrites=true&w=majority
   ```

## ☁️ Backend Deployment (Render)

### 1. Create Render Account
1. Go to [Render](https://render.com/)
2. Sign up with GitHub account

### 2. Deploy Backend Service
1. **New** → **Web Service**
2. Connect GitHub repository
3. Configure service:
   - **Name**: `shopwise-ai-backend`
   - **Environment**: `Node`
   - **Region**: Choose closest region
   - **Branch**: `main` or `master`
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### 3. Environment Variables
Add these environment variables in Render dashboard:

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://shopwise-user:<password>@shopwise-cluster.xxxxx.mongodb.net/shopwise?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
CLIENT_URL=https://your-frontend-url.vercel.app
```

### 4. Deploy
1. Click **Create Web Service**
2. Wait for deployment (5-10 minutes)
3. Note your backend URL: `https://shopwise-ai-backend.onrender.com`

## 🌐 Frontend Deployment (Vercel)

### 1. Create Vercel Account
1. Go to [Vercel](https://vercel.com/)
2. Sign up with GitHub account

### 2. Deploy Frontend
1. **New Project** → Import Git Repository
2. Select your ShopWise AI repository
3. Configure project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 3. Environment Variables
Add these environment variables in Vercel dashboard:

```env
VITE_API_URL=https://shopwise-ai-backend.onrender.com/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-publishable-key
```

### 4. Deploy
1. Click **Deploy**
2. Wait for deployment (2-5 minutes)
3. Note your frontend URL: `https://shopwise-ai.vercel.app`

## 🔄 Update Backend with Frontend URL

1. Go back to Render dashboard
2. Update `CLIENT_URL` environment variable:
   ```env
   CLIENT_URL=https://shopwise-ai.vercel.app
   ```
3. Redeploy backend service

## 🧪 Testing Deployment

### 1. Test Backend API
```bash
curl https://shopwise-ai-backend.onrender.com/api/health
```

### 2. Test Frontend
1. Visit your Vercel URL
2. Test user registration/login
3. Test product browsing
4. Test admin dashboard (if you have admin user)

### 3. Test Analytics
1. Login as admin
2. Go to Admin Dashboard → Analytics tab
3. Verify charts load (may be empty without data)

## 🔧 Custom Domain (Optional)

### Frontend (Vercel)
1. **Settings** → **Domains**
2. Add your custom domain
3. Configure DNS records as instructed

### Backend (Render)
1. **Settings** → **Custom Domains**
2. Add your API subdomain (e.g., `api.yourdomain.com`)
3. Update frontend environment variables

## 🔐 Security Checklist

### Environment Variables
- [ ] All sensitive data in environment variables
- [ ] No hardcoded secrets in code
- [ ] Different keys for development/production

### Database Security
- [ ] Strong database password
- [ ] Network access properly configured
- [ ] Database user has minimal required permissions

### API Security
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] JWT secrets are strong and unique

## 📊 Monitoring & Analytics

### Render Monitoring
- Check service logs in Render dashboard
- Monitor CPU and memory usage
- Set up alerts for downtime

### Vercel Analytics
- Enable Vercel Analytics for frontend metrics
- Monitor Core Web Vitals
- Track deployment frequency

### Database Monitoring
- Monitor MongoDB Atlas metrics
- Set up alerts for high usage
- Regular backup verification

## 🚨 Troubleshooting

### Common Issues

#### Backend Won't Start
1. Check Render logs for errors
2. Verify all environment variables are set
3. Ensure MongoDB connection string is correct

#### Frontend API Calls Fail
1. Check CORS configuration in backend
2. Verify API URL in frontend environment variables
3. Check network tab in browser dev tools

#### Database Connection Issues
1. Verify MongoDB Atlas IP whitelist
2. Check connection string format
3. Ensure database user has correct permissions

#### Charts Not Loading
1. Check browser console for JavaScript errors
2. Verify Chart.js dependencies are installed
3. Check if analytics API endpoints are working

### Getting Help
- Check service logs in respective dashboards
- Use browser developer tools for frontend issues
- Test API endpoints directly with curl or Postman

## 🔄 Continuous Deployment

The included GitHub Actions workflow will automatically:
1. Run tests on every push
2. Deploy to production on main/master branch
3. Build and test both frontend and backend

### Setup GitHub Secrets
Add these secrets in GitHub repository settings:

```
VERCEL_TOKEN=your-vercel-token
ORG_ID=your-vercel-org-id
PROJECT_ID=your-vercel-project-id
RENDER_SERVICE_ID=your-render-service-id
RENDER_API_KEY=your-render-api-key
```

## 🎉 Success!

Your ShopWise AI application is now live! 

- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-backend.onrender.com
- **Admin Dashboard**: https://your-app.vercel.app/admin

Share your live application and start getting users! 🚀

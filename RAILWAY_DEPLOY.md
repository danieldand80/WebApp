# 🚂 Railway Deployment Guide

## Why Railway?
- ✅ $5/month (500 hours free trial)
- ✅ File uploads work perfectly
- ✅ Persistent storage with volumes
- ✅ Automatic HTTPS
- ✅ Easy setup

## Step-by-Step Deployment

### 1. Create Railway Account
Go to https://railway.app and sign up with GitHub

### 2. Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose **MaksymGurzhiy/Hamozot**
4. Railway will auto-detect Node.js

### 3. Configure Environment Variables
In Railway dashboard:
- Click your service
- Go to **"Variables"** tab
- Add:
  ```
  NODE_ENV=production
  ```

### 4. Add Persistent Volume (Important!)
To keep uploaded videos:
1. Click your service
2. Go to **"Settings"** tab
3. Scroll to **"Volumes"**
4. Click **"Add Volume"**
5. Mount path: `/app/videos`
6. Size: 1GB (or more)

### 5. Deploy!
Railway will automatically deploy. Wait 2-3 minutes.

### 6. Get Your URL
Your app will be at:
```
https://hamozot-production.up.railway.app
```

Or set custom domain in Settings → Networking

## 🎯 After Deployment

### Test Admin Panel:
```
https://your-app.railway.app/admin
Password: Liron3214
```

### Upload a video and verify it persists after redeployment!

## 💰 Pricing
- Free: $5 credit (500 hours)
- After trial: $5/month for hobby plan
- Includes persistent storage

## 🔧 Troubleshooting

### Videos disappear after deploy
- Make sure you added persistent volume
- Mount path must be `/app/videos`

### App crashes
- Check logs in Railway dashboard
- Verify all dependencies installed

### Port issues
- Railway automatically sets PORT environment variable
- Our code already uses `process.env.PORT`

## 📊 Monitoring
Railway dashboard shows:
- Logs
- Metrics (CPU, Memory)
- Deployments history
- Environment variables


# 🚀 Deployment Guide

## Overview
- **Frontend**: GitHub Pages (Free)
- **Backend**: Render (Free)

---

## Step 1: Deploy Backend to Render

### 1.1 Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub

### 1.2 Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `asta-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### 1.3 Deploy
1. Click **"Create Web Service"**
2. Wait for deployment (~2-5 minutes)
3. Copy your URL: `https://asta-backend.onrender.com`

### 1.4 Test Backend
```bash
curl https://asta-backend.onrender.com/health
```

---

## Step 2: Deploy Frontend to GitHub Pages

### 2.1 Configure GitHub Repository

1. Go to your GitHub repo → **Settings** → **Pages**
2. Source: **GitHub Actions**

### 2.2 Set Environment Variable

1. Go to repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **"Variables"** tab → **"New repository variable"**
3. Add:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://asta-backend.onrender.com/api`

### 2.3 Trigger Deployment

Push to `main` branch or manually trigger:
1. Go to **Actions** tab
2. Select **"Deploy Frontend to GitHub Pages"**
3. Click **"Run workflow"**

### 2.4 Access Your App
```
https://pravn27.github.io/stock-market-tech-analysis/
```

---

## Environment Variables

### Backend (Render)
| Variable | Description | Example |
|----------|-------------|---------|
| `CORS_ORIGINS` | Additional allowed origins | `https://custom-domain.com` |

### Frontend (GitHub Actions)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://asta-backend.onrender.com/api` |

---

## Updating the App

### Backend Updates
1. Push changes to `main` branch
2. Render auto-deploys from GitHub

### Frontend Updates
1. Push changes to `frontend/` folder
2. GitHub Actions auto-deploys to Pages

---

## Troubleshooting

### Backend Not Responding
- Check Render dashboard for logs
- Free tier sleeps after 15 min - first request may take ~30s

### CORS Errors
- Verify `CORS_ORIGINS` includes your frontend URL
- Check browser console for exact error

### Frontend 404 on Refresh
- GitHub Pages doesn't support client-side routing
- App uses hash routing to avoid this

---

## Costs

| Service | Plan | Cost |
|---------|------|------|
| Render | Free | $0 |
| GitHub Pages | Free | $0 |
| **Total** | | **$0** |

### Free Tier Limits
- **Render**: 750 hours/month, sleeps after 15 min idle
- **GitHub Pages**: 100GB bandwidth/month

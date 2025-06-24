# 🚀 Insomnia Video Editor - Cloud Deployment Implementation Plan

**Generated:** December 24, 2024  
**Target Architecture:** Vercel Frontend + Google Cloud Platform Backend  
**Performance Focus:** Resource-intensive video processing optimization  

---

## 📋 **EXECUTIVE SUMMARY**

This implementation plan provides step-by-step instructions for deploying your insomniavideo editor to the cloud while maintaining exact local functionality and optimizing for performance and cost.

### **Deployment Architecture**
- **Frontend**: Vercel (Global CDN, automatic deployments)
- **Backend**: Google Cloud Run (Auto-scaling, high-performance)
- **Storage**: Google Cloud Storage (Video files, processed content)
- **Database**: Cloud SQL PostgreSQL (Production-ready)
- **AI Services**: Integrated Google Cloud AI APIs

---

## 🎯 **PHASE 1: GOOGLE CLOUD PROJECT SETUP**

### **Step 1.1: Create New GCP Project**

```bash
# Install Google Cloud CLI if not already installed
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Authenticate and create new project
gcloud auth login
gcloud projects create insomnia-video-editor-prod --name="Insomnia Video Editor Production"
gcloud config set project insomnia-video-editor-prod

# Enable billing (required for Cloud Run and other services)
# Note: You'll need to link a billing account through the console
```

### **Step 1.2: Enable Required APIs**

```bash
# Enable all required Google Cloud APIs
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  storage.googleapis.com \
  speech.googleapis.com \
  translate.googleapis.com \
  sqladmin.googleapis.com \
  iam.googleapis.com \
  aiplatform.googleapis.com
```

### **Step 1.3: Create Service Account**

```bash
# Create service account for the application
gcloud iam service-accounts create insomnia-video-service \
  --display-name="Insomnia Video Editor Service Account" \
  --description="Service account for video processing and AI operations"

# Grant necessary permissions
gcloud projects add-iam-policy-binding insomnia-video-editor-prod \
  --member="serviceAccount:insomnia-video-service@insomnia-video-editor-prod.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding insomnia-video-editor-prod \
  --member="serviceAccount:insomnia-video-service@insomnia-video-editor-prod.iam.gserviceaccount.com" \
  --role="roles/speech.editor"

gcloud projects add-iam-policy-binding insomnia-video-editor-prod \
  --member="serviceAccount:insomnia-video-service@insomnia-video-editor-prod.iam.gserviceaccount.com" \
  --role="roles/translate.editor"

gcloud projects add-iam-policy-binding insomnia-video-editor-prod \
  --member="serviceAccount:insomnia-video-service@insomnia-video-editor-prod.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"

# Create and download service account key
gcloud iam service-accounts keys create keyb.json \
  --iam-account=insomnia-video-service@insomnia-video-editor-prod.iam.gserviceaccount.com
```

### **Step 1.4: Create Cloud Storage Bucket**

```bash
# Create bucket for video storage
gsutil mb -p insomnia-video-editor-prod -c STANDARD -l us-central1 gs://insomnia-video-storage-prod

# Set bucket permissions for web access
gsutil iam ch allUsers:objectViewer gs://insomnia-video-storage-prod

# Configure CORS for web uploads
cat > cors-config.json << EOF
[
  {
    "origin": ["*"],
    "method": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "responseHeader": ["Content-Type", "Authorization", "x-goog-resumable"],
    "maxAgeSeconds": 3600
  }
]
EOF

gsutil cors set cors-config.json gs://insomnia-video-storage-prod
```

---

## 🔧 **PHASE 2: BACKEND PREPARATION & DEPLOYMENT**

### **Step 2.1: Update Configuration Files**

First, update the service account configuration:

```bash
# Replace the old keyb.json files with the new service account key
cp keyb.json backend/keyb.json
cp keyb.json backend/multi_tool_agent/keyb.json
```

### **Step 2.2: Create Production Dockerfile**

Create `backend/Dockerfile.production`:

```dockerfile
# Multi-stage build optimized for Cloud Run
FROM python:3.12-slim as builder

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    ffmpeg \
    libsm6 \
    libxext6 \
    libfontconfig1 \
    libxrender1 \
    libgl1-mesa-glx \
    pkg-config \
    libhdf5-dev \
    python3-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Production stage
FROM python:3.12-slim as production

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8080

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsm6 \
    libxext6 \
    libfontconfig1 \
    libxrender1 \
    libgl1-mesa-glx \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

WORKDIR /app

# Copy Python packages from builder
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application code
COPY . .

# Install Node.js for Remotion renderer integration
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# Install Remotion renderer dependencies
WORKDIR /app/remotion-renderer
RUN npm ci --only=production

# Create necessary directories
WORKDIR /app
RUN mkdir -p temp_video_uploads analyzed_videos_store analysis_data_store exported_videos translated_videos && \
    chown -R appuser:appuser /app

USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/api/health || exit 1

EXPOSE 8080

# Start both backend and remotion renderer
CMD ["sh", "-c", "cd /app/remotion-renderer && npm start & cd /app && uvicorn main:app --host 0.0.0.0 --port 8080 --workers 1"]
```

### **Step 2.3: Create Environment Configuration**

Create `backend/.env.production`:

```bash
# Server Configuration
PORT=8080
FRONTEND_URL=https://your-vercel-app.vercel.app

# Database Configuration (Cloud SQL)
DATABASE_URL=postgresql://insomnia_user:your_secure_password@/insomnia_db?host=/cloudsql/insomnia-video-editor-prod:us-central1:insomnia-db

# AI Processing APIs
GEMINI_API_KEY=your-gemini-api-key-here
ASSEMBLYAI_API_KEY=your-assemblyai-api-key-here

# Cloud Storage Configuration
CLOUD_STORAGE_ENABLED=true
GCS_BUCKET_NAME=insomnia-video-storage-prod
GCP_PROJECT_ID=insomnia-video-editor-prod

# Google Cloud credentials
GOOGLE_APPLICATION_CREDENTIALS=/app/keyb.json

# CORS Configuration
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,http://localhost:5173

# Production Settings
DEBUG=false
LOG_LEVEL=INFO
PYTHONUNBUFFERED=1
MOVIEPY_PROGRESS_BAR=0
```

---

## 🗄️ **PHASE 3: DATABASE SETUP**

### **Step 3.1: Create Cloud SQL Instance**

```bash
# Create Cloud SQL PostgreSQL instance
gcloud sql instances create insomnia-db \
  --database-version=POSTGRES_15 \
  --tier=db-g1-small \
  --region=us-central1 \
  --storage-type=SSD \
  --storage-size=20GB \
  --storage-auto-increase

# Create database
gcloud sql databases create insomnia_transcripts --instance=insomnia-db

# Create database user
gcloud sql users create insomnia_user \
  --instance=insomnia-db \
  --password=your_secure_password_here
```

### **Step 3.2: Configure Database Connection**

```bash
# Get connection name for Cloud SQL Proxy
gcloud sql instances describe insomnia-db --format="value(connectionName)"
# This will output something like: insomnia-video-editor-prod:us-central1:insomnia-db
```

---

## 🚀 **PHASE 4: BACKEND DEPLOYMENT**

### **Step 4.1: Build and Deploy to Cloud Run**

```bash
# Navigate to backend directory
cd backend

# Copy video analysis scripts (required for processing)
cp -r ../video_analysis ./

# Build container image
gcloud builds submit --tag gcr.io/insomnia-video-editor-prod/insomnia-backend -f Dockerfile.production

# Deploy to Cloud Run with optimized settings for video processing
gcloud run deploy insomnia-backend \
  --image gcr.io/insomnia-video-editor-prod/insomnia-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 16Gi \
  --cpu 8 \
  --timeout 3600 \
  --max-instances 5 \
  --min-instances 0 \
  --concurrency 1 \
  --execution-environment gen2 \
  --add-cloudsql-instances insomnia-video-editor-prod:us-central1:insomnia-db \
  --set-env-vars="CLOUD_STORAGE_ENABLED=true,GCS_BUCKET_NAME=insomnia-video-storage-prod,GCP_PROJECT_ID=insomnia-video-editor-prod,DATABASE_URL=postgresql://insomnia_user:your_secure_password@/insomnia_transcripts?host=/cloudsql/insomnia-video-editor-prod:us-central1:insomnia-db"
```

### **Step 4.2: Get Backend URL**

```bash
# Get the deployed backend URL
gcloud run services describe insomnia-backend --region us-central1 --format="value(status.url)"
# Save this URL - you'll need it for frontend configuration
```

---

## 🌐 **PHASE 5: FRONTEND DEPLOYMENT**

### **Step 5.1: Update Configuration Files**

Update `vercel.json` with your new backend URL:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://insomnia-backend-YOUR_HASH.a.run.app/api/$1"
    },
    {
      "source": "/((?!api).*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ],
  "env": {
    "VITE_API_URL": "https://insomnia-backend-YOUR_HASH.a.run.app",
    "VITE_ENVIRONMENT": "production"
  },
  "build": {
    "env": {
      "VITE_API_URL": "https://insomnia-backend-YOUR_HASH.a.run.app",
      "VITE_ENVIRONMENT": "production"
    }
  }
}
```

### **Step 5.2: Deploy to Vercel**

```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Build and deploy
npm run build
vercel --prod

# Or deploy with environment variables directly
vercel --prod \
  --env VITE_API_URL="https://insomnia-backend-YOUR_HASH.a.run.app" \
  --env VITE_ENVIRONMENT="production"
```

### **Step 5.3: Update Backend CORS**

After getting your Vercel URL, update the backend CORS settings:

```bash
# Update Cloud Run service with new frontend URL
gcloud run services update insomnia-backend \
  --region us-central1 \
  --set-env-vars="FRONTEND_URL=https://your-vercel-app.vercel.app"
```

---

## 🔑 **PHASE 6: API KEYS & SECRETS MANAGEMENT**

### **Step 6.1: Update API Keys**

You'll need to obtain and configure these API keys:

1. **Gemini API Key**: Get from Google AI Studio
2. **AssemblyAI API Key**: Get from AssemblyAI dashboard

### **Step 6.2: Secure Configuration**

```bash
# Update Cloud Run with API keys (use Secret Manager for production)
gcloud run services update insomnia-backend \
  --region us-central1 \
  --set-env-vars="GEMINI_API_KEY=your-gemini-key,ASSEMBLYAI_API_KEY=your-assemblyai-key"
```

---

## 📊 **PHASE 7: PERFORMANCE OPTIMIZATION**

### **Step 7.1: Cloud Run Optimization**

Your current configuration is optimized for resource-intensive video processing:

- **Memory**: 16GB (handles large video files)
- **CPU**: 8 cores (parallel processing)
- **Timeout**: 3600s (1 hour for long processing)
- **Concurrency**: 1 (dedicated resources per request)
- **Auto-scaling**: 0-5 instances (cost optimization)

### **Step 7.2: Storage Optimization**

```bash
# Set up lifecycle management for cost optimization
cat > lifecycle-config.json << EOF
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "Delete"},
        "condition": {
          "age": 30,
          "matchesPrefix": ["temp/"]
        }
      },
      {
        "action": {"type": "SetStorageClass", "storageClass": "COLDLINE"},
        "condition": {
          "age": 7,
          "matchesPrefix": ["processed/"]
        }
      }
    ]
  }
}
EOF

gsutil lifecycle set lifecycle-config.json gs://insomnia-video-storage-prod
```

---

## 🧪 **PHASE 8: TESTING & VALIDATION**

### **Step 8.1: Health Checks**

```bash
# Test backend health
curl https://insomnia-backend-YOUR_HASH.a.run.app/api/health

# Test frontend
curl https://your-vercel-app.vercel.app
```

### **Step 8.2: Audio Translation Testing**

Test the critical audio translation feature:

1. Upload a video through the frontend
2. Create a scene with audio
3. Use the audio translator AI agent
4. Verify the translated video is saved correctly

### **Step 8.3: Performance Testing**

Monitor resource usage and adjust Cloud Run settings if needed:

```bash
# Monitor Cloud Run metrics
gcloud run services describe insomnia-backend --region us-central1
```

---

## 💰 **COST OPTIMIZATION STRATEGIES**

### **Estimated Monthly Costs (Moderate Usage)**

- **Cloud Run**: $50-150/month (depends on processing volume)
- **Cloud Storage**: $10-30/month (depends on video storage)
- **Cloud SQL**: $25-50/month (db-g1-small instance)
- **API Calls**: $20-100/month (depends on AI usage)

**Total Estimated**: $105-330/month

### **Cost Reduction Tips**

1. **Auto-scaling**: Configured to scale to zero when not in use
2. **Storage Lifecycle**: Automatic cleanup of temporary files
3. **Instance Sizing**: Start with smaller instances and scale up if needed
4. **Regional Deployment**: Use us-central1 for lower costs

---

## 🚨 **TROUBLESHOOTING GUIDE**

### **Common Issues & Solutions**

1. **Audio Translation Fails**
   - Check service account permissions
   - Verify Gemini API key is valid
   - Ensure Speech-to-Text API is enabled

2. **Video Upload Errors**
   - Check Cloud Storage bucket permissions
   - Verify CORS configuration
   - Check file size limits

3. **Performance Issues**
   - Increase Cloud Run memory/CPU
   - Check database connection pooling
   - Monitor Cloud Run logs

4. **CORS Errors**
   - Update FRONTEND_URL environment variable
   - Verify Vercel domain in CORS settings

---

## 📋 **POST-DEPLOYMENT CHECKLIST**

- [ ] All GCP APIs enabled
- [ ] Service account created with proper permissions
- [ ] Cloud Storage bucket configured with CORS
- [ ] Cloud SQL database created and accessible
- [ ] Backend deployed to Cloud Run with correct environment variables
- [ ] Frontend deployed to Vercel with correct API URL
- [ ] API keys configured and working
- [ ] Audio translation feature tested and working
- [ ] Video upload and processing tested
- [ ] Performance monitoring set up
- [ ] Cost alerts configured

---

## 🔄 **MAINTENANCE & UPDATES**

### **Regular Maintenance Tasks**

1. **Weekly**: Monitor costs and usage
2. **Monthly**: Clean up old storage files
3. **Quarterly**: Review and optimize resource allocation
4. **As Needed**: Update API keys and dependencies

### **Update Deployment Process**

```bash
# Backend updates
cd backend
gcloud builds submit --tag gcr.io/insomnia-video-editor-prod/insomnia-backend -f Dockerfile.production
gcloud run deploy insomnia-backend --image gcr.io/insomnia-video-editor-prod/insomnia-backend --region us-central1

# Frontend updates
npm run build
vercel --prod
```

---

## 📞 **SUPPORT & NEXT STEPS**

This deployment plan provides a production-ready, scalable solution for your insomniavideo editor. The architecture is designed to:

- ✅ Maintain exact local functionality
- ✅ Handle resource-intensive video processing
- ✅ Optimize for cost-effectiveness
- ✅ Ensure audio translation works correctly
- ✅ Provide automatic scaling and high availability

**Ready to implement?** Start with Phase 1 and work through each phase systematically. Each phase builds on the previous one, ensuring a smooth deployment process.

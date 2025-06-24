# 🚀 Insomnia Video Editor - Cloud Deployment Guide

**Status**: Ready for Production Deployment  
**Architecture**: Vercel Frontend + Google Cloud Platform Backend  
**Performance**: Optimized for Resource-Intensive Video Processing  

---

## 📋 **QUICK START**

### **Automated Deployment (Recommended)**

```bash
# 1. Deploy backend to Google Cloud Platform
./deploy-to-cloud.sh

# 2. Deploy frontend to Vercel
./deploy-frontend.sh
```

### **Manual Deployment**

Follow the detailed steps in `DEPLOYMENT_IMPLEMENTATION_PLAN.md`

---

## 🏗️ **ARCHITECTURE OVERVIEW**

### **Current Local Setup (Working)**
- **Frontend**: React app on localhost:5173 (`npm run dev`)
- **Backend**: Python FastAPI on localhost:8080 (`python backend/main.py`)
- **Remotion Renderer**: Node.js service on localhost:3001 (`npm start` in backend/remotion-renderer)

### **Cloud Deployment Architecture**
- **Frontend**: Vercel (Global CDN, automatic deployments)
- **Backend**: Google Cloud Run (Auto-scaling, high-performance)
- **Storage**: Google Cloud Storage (Video files, processed content)
- **Database**: Cloud SQL PostgreSQL (Production-ready)
- **AI Services**: Google Cloud AI APIs (Speech, Translation, Gemini)

---

## 🔑 **KEY FEATURES PRESERVED**

✅ **Audio Translation**: Complete pipeline with Google Cloud Speech-to-Text, Translation, and Gemini TTS  
✅ **Video Processing**: Full video analysis, segmentation, and export capabilities  
✅ **AI Agents**: All 12+ AI agents including subtitle generation, content analysis  
✅ **Real-time Editing**: Timeline editing, scene management, and preview  
✅ **File Management**: Intelligent storage with local and cloud integration  
✅ **Authentication**: Google OAuth integration  
✅ **Performance**: Optimized for resource-intensive video processing  

---

## 💰 **COST OPTIMIZATION**

### **Estimated Monthly Costs**
- **Cloud Run**: $50-150 (auto-scales to zero when not in use)
- **Cloud Storage**: $10-30 (lifecycle management for cleanup)
- **Cloud SQL**: $25-50 (right-sized for application needs)
- **API Calls**: $20-100 (depends on AI usage)
- **Total**: $105-330/month

### **Cost-Saving Features**
- Auto-scaling to zero instances when not in use
- Automatic cleanup of temporary files
- Optimized resource allocation
- Regional deployment for lower costs

---

## 🔧 **REQUIRED SETUP**

### **Before Deployment**

1. **Google Cloud Account** with billing enabled
2. **API Keys**:
   - Gemini API key (from Google AI Studio)
   - AssemblyAI API key (from AssemblyAI dashboard)
3. **Vercel Account** for frontend deployment
4. **Domain** (optional, for custom frontend URL)

### **Required GCP APIs**
- Cloud Storage API
- Cloud Speech-to-Text API
- Cloud Translation API
- Cloud Run API
- Cloud Build API
- Gemini API
- IAM Service Account Credentials API

---

## 📁 **FILES CREATED/MODIFIED**

### **New Files**
- `deploy-to-cloud.sh` - Automated backend deployment script
- `deploy-frontend.sh` - Automated frontend deployment script
- `DEPLOYMENT_IMPLEMENTATION_PLAN.md` - Detailed implementation guide
- `backend/Dockerfile.production` - Optimized production container

### **Configuration Updates**
- `vercel.json` - Updated with new backend URL
- `backend/keyb.json` - New service account credentials
- `backend/multi_tool_agent/keyb.json` - Updated for audio translation

### **Removed Files**
- `backend/Dockerfile*` - Old deployment artifacts
- `backend/.dockerignore` - Outdated configuration
- `docs/09-DEPLOYMENT-GUIDE.md` - Outdated deployment guide
- `docs/text.txt` - Old deployment notes

---

## 🚀 **DEPLOYMENT PROCESS**

### **Phase 1: Backend Deployment**

```bash
# Run the automated deployment script
./deploy-to-cloud.sh
```

This script will:
1. Create new GCP project (`insomnia-video-editor-prod`)
2. Enable required APIs
3. Create service account with proper permissions
4. Set up Cloud Storage bucket with CORS
5. Create Cloud SQL PostgreSQL database
6. Build and deploy backend to Cloud Run
7. Configure environment variables

### **Phase 2: Frontend Deployment**

```bash
# Deploy frontend to Vercel
./deploy-frontend.sh
```

This script will:
1. Update `vercel.json` with backend URL
2. Build frontend with production settings
3. Deploy to Vercel
4. Update backend CORS settings
5. Test deployment

---

## 🧪 **TESTING CHECKLIST**

After deployment, test these critical features:

- [ ] **Video Upload**: Upload a video file through the frontend
- [ ] **Video Analysis**: Verify video segmentation and scene detection
- [ ] **Audio Translation**: Test the complete audio translation pipeline
- [ ] **AI Agents**: Test subtitle generation and other AI features
- [ ] **Video Export**: Export a timeline to MP4
- [ ] **Authentication**: Test Google OAuth login
- [ ] **File Storage**: Verify files are saved to Cloud Storage
- [ ] **Performance**: Check response times and resource usage

---

## 🔍 **MONITORING & MAINTENANCE**

### **Health Checks**
- Backend: `https://your-backend-url/api/health`
- Frontend: `https://your-vercel-app.vercel.app`

### **Monitoring Tools**
- Google Cloud Console for backend metrics
- Vercel Dashboard for frontend analytics
- Cloud Storage usage monitoring
- Cost tracking and alerts

### **Regular Maintenance**
- Weekly: Monitor costs and usage
- Monthly: Clean up old storage files
- Quarterly: Review and optimize resources

---

## 🚨 **TROUBLESHOOTING**

### **Common Issues**

1. **Audio Translation Fails**
   - Check service account permissions
   - Verify Gemini API key
   - Ensure Speech-to-Text API is enabled

2. **CORS Errors**
   - Update `FRONTEND_URL` in Cloud Run environment
   - Verify Vercel domain in backend settings

3. **Performance Issues**
   - Increase Cloud Run memory/CPU
   - Check database connections
   - Monitor Cloud Run logs

4. **File Upload Errors**
   - Check Cloud Storage permissions
   - Verify CORS configuration
   - Check file size limits

### **Support Commands**

```bash
# Check backend logs
gcloud run services logs read insomnia-backend --region us-central1

# Update environment variables
gcloud run services update insomnia-backend \
  --region us-central1 \
  --set-env-vars="KEY=value"

# Scale resources
gcloud run services update insomnia-backend \
  --region us-central1 \
  --memory 32Gi \
  --cpu 16
```

---

## 📞 **NEXT STEPS**

1. **Run Deployment Scripts**: Start with `./deploy-to-cloud.sh`
2. **Configure API Keys**: Add your Gemini and AssemblyAI keys
3. **Test Audio Translation**: Verify this critical feature works
4. **Monitor Performance**: Watch resource usage and costs
5. **Set Up Alerts**: Configure monitoring and cost alerts

---

## 🎯 **SUCCESS CRITERIA**

Your deployment is successful when:
- ✅ Frontend loads and connects to backend
- ✅ Video upload and processing works
- ✅ Audio translation completes successfully
- ✅ All AI agents function correctly
- ✅ Video export generates proper MP4 files
- ✅ Performance matches local development
- ✅ Costs are within expected range

---

**Ready to deploy?** Start with `./deploy-to-cloud.sh` and follow the prompts!

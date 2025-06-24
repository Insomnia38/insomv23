#!/bin/bash

# 🚀 Insomnia Video Editor - Cloud Deployment Script
# This script automates the deployment of the Insomnia Video Editor to Google Cloud Platform

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="insomnia-video-editor-prod"
REGION="us-central1"
SERVICE_NAME="insomnia-backend"
BUCKET_NAME="insomnia-video-storage-prod"
DB_INSTANCE="insomnia-db"
DB_NAME="insomnia_transcripts"
DB_USER="insomnia_user"

echo -e "${BLUE}🚀 Starting Insomnia Video Editor Cloud Deployment${NC}"
echo "=================================================="

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if required tools are installed
check_prerequisites() {
    echo -e "${BLUE}🔍 Checking prerequisites...${NC}"
    
    if ! command -v gcloud &> /dev/null; then
        print_error "Google Cloud CLI is not installed. Please install it first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install Node.js first."
        exit 1
    fi
    
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    
    print_status "Prerequisites check completed"
}

# Authenticate and set up project
setup_gcp_project() {
    echo -e "${BLUE}🔧 Setting up Google Cloud Project...${NC}"
    
    # Check if already authenticated
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
        echo "Please authenticate with Google Cloud:"
        gcloud auth login
    fi
    
    # Create project if it doesn't exist
    if ! gcloud projects describe $PROJECT_ID &> /dev/null; then
        echo "Creating new project: $PROJECT_ID"
        gcloud projects create $PROJECT_ID --name="Insomnia Video Editor"
    fi
    
    gcloud config set project $PROJECT_ID
    print_status "Project setup completed"
}

# Enable required APIs
enable_apis() {
    echo -e "${BLUE}🔌 Enabling required APIs...${NC}"
    
    gcloud services enable \
        cloudbuild.googleapis.com \
        run.googleapis.com \
        storage.googleapis.com \
        speech.googleapis.com \
        translate.googleapis.com \
        sqladmin.googleapis.com \
        iam.googleapis.com \
        aiplatform.googleapis.com
    
    print_status "APIs enabled successfully"
}

# Create service account
create_service_account() {
    echo -e "${BLUE}👤 Creating service account...${NC}"
    
    SERVICE_ACCOUNT_EMAIL="insomnia-video-service@${PROJECT_ID}.iam.gserviceaccount.com"
    
    # Create service account if it doesn't exist
    if ! gcloud iam service-accounts describe $SERVICE_ACCOUNT_EMAIL &> /dev/null; then
        gcloud iam service-accounts create insomnia-video-service \
            --display-name="Insomnia Video Editor Service Account" \
            --description="Service account for video processing and AI operations"
    fi
    
    # Grant permissions
    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
        --role="roles/storage.admin"
    
    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
        --role="roles/speech.editor"
    
    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
        --role="roles/cloudtranslate.user"
    
    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
        --role="roles/aiplatform.user"
    
    # Create service account key
    if [ ! -f "keyb.json" ]; then
        gcloud iam service-accounts keys create keyb.json \
            --iam-account=$SERVICE_ACCOUNT_EMAIL
    fi
    
    print_status "Service account created and configured"
}

# Create Cloud Storage bucket
create_storage_bucket() {
    echo -e "${BLUE}🪣 Creating Cloud Storage bucket...${NC}"
    
    # Create bucket if it doesn't exist
    if ! gsutil ls -b gs://$BUCKET_NAME &> /dev/null; then
        gsutil mb -p $PROJECT_ID -c STANDARD -l $REGION gs://$BUCKET_NAME
        
        # Set bucket permissions
        gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME
        
        # Configure CORS
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
        gsutil cors set cors-config.json gs://$BUCKET_NAME
        rm cors-config.json
    fi
    
    print_status "Cloud Storage bucket created and configured"
}

# Create Cloud SQL database
create_database() {
    echo -e "${BLUE}🗄️ Creating Cloud SQL database...${NC}"
    
    # Create Cloud SQL instance if it doesn't exist
    if ! gcloud sql instances describe $DB_INSTANCE &> /dev/null; then
        echo "Creating Cloud SQL instance (this may take several minutes)..."
        gcloud sql instances create $DB_INSTANCE \
            --database-version=POSTGRES_15 \
            --tier=db-g1-small \
            --region=$REGION \
            --storage-type=SSD \
            --storage-size=20GB \
            --storage-auto-increase
        
        # Create database
        gcloud sql databases create $DB_NAME --instance=$DB_INSTANCE
        
        # Create database user
        echo "Please enter a secure password for the database user:"
        read -s DB_PASSWORD
        gcloud sql users create $DB_USER \
            --instance=$DB_INSTANCE \
            --password=$DB_PASSWORD
        
        echo "DB_PASSWORD=$DB_PASSWORD" > .env.db
        print_warning "Database password saved to .env.db - keep this file secure!"
    fi
    
    print_status "Cloud SQL database created and configured"
}

# Prepare backend for deployment
prepare_backend() {
    echo -e "${BLUE}🔧 Preparing backend for deployment...${NC}"
    
    cd backend
    
    # Copy video analysis scripts
    if [ -d "../video_analysis" ]; then
        cp -r ../video_analysis ./
    fi
    
    # Copy service account key
    if [ -f "../keyb.json" ]; then
        cp ../keyb.json ./keyb.json
        cp ../keyb.json ./multi_tool_agent/keyb.json
    fi
    
    # Create production Dockerfile
    cat > Dockerfile.production << 'EOF'
FROM python:3.12-slim as builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

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
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.12-slim as production

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8080

RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsm6 \
    libxext6 \
    libfontconfig1 \
    libxrender1 \
    libgl1-mesa-glx \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd -r appuser && useradd -r -g appuser appuser

WORKDIR /app

COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

COPY . .

RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

WORKDIR /app/remotion-renderer
RUN npm ci --only=production

WORKDIR /app
RUN mkdir -p temp_video_uploads analyzed_videos_store analysis_data_store exported_videos translated_videos && \
    chown -R appuser:appuser /app

USER appuser

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/api/health || exit 1

EXPOSE 8080

CMD ["sh", "-c", "cd /app/remotion-renderer && npm start & cd /app && uvicorn main:app --host 0.0.0.0 --port 8080 --workers 1"]
EOF
    
    cd ..
    print_status "Backend prepared for deployment"
}

# Deploy backend to Cloud Run
deploy_backend() {
    echo -e "${BLUE}🚀 Deploying backend to Cloud Run...${NC}"
    
    cd backend
    
    # Build container image using Dockerfile
    gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME .
    
    # Get database connection name
    DB_CONNECTION_NAME=$(gcloud sql instances describe $DB_INSTANCE --format="value(connectionName)")
    
    # Load database password
    if [ -f "../.env.db" ]; then
        source ../.env.db
    else
        echo "Please enter the database password:"
        read -s DB_PASSWORD
    fi
    
    # Deploy to Cloud Run
    gcloud run deploy $SERVICE_NAME \
        --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
        --platform managed \
        --region $REGION \
        --allow-unauthenticated \
        --port 8080 \
        --memory 16Gi \
        --cpu 8 \
        --timeout 3600 \
        --max-instances 5 \
        --min-instances 0 \
        --concurrency 1 \
        --execution-environment gen2 \
        --add-cloudsql-instances $DB_CONNECTION_NAME \
        --set-env-vars="CLOUD_STORAGE_ENABLED=true,GCS_BUCKET_NAME=$BUCKET_NAME,GCP_PROJECT_ID=$PROJECT_ID,DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@/$DB_NAME?host=/cloudsql/$DB_CONNECTION_NAME"
    
    # Get backend URL
    BACKEND_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format="value(status.url)")
    echo "BACKEND_URL=$BACKEND_URL" > ../.env.backend
    
    cd ..
    print_status "Backend deployed successfully to: $BACKEND_URL"
}

# Main deployment function
main() {
    echo -e "${BLUE}Starting deployment process...${NC}"
    
    check_prerequisites
    setup_gcp_project
    enable_apis
    create_service_account
    create_storage_bucket
    create_database
    prepare_backend
    deploy_backend
    
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo "=================================================="
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Update your API keys (Gemini, AssemblyAI) in Cloud Run environment variables"
    echo "2. Deploy frontend to Vercel using the backend URL from .env.backend"
    echo "3. Test the audio translation feature"
    echo "4. Set up monitoring and alerts"
    
    if [ -f ".env.backend" ]; then
        source .env.backend
        echo -e "${YELLOW}Backend URL: $BACKEND_URL${NC}"
    fi
}

# Run main function
main "$@"

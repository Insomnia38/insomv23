#!/bin/bash

# 🌐 Insomnia Video Editor - Frontend Deployment Script
# This script deploys the frontend to Vercel with the correct backend configuration

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🌐 Starting Frontend Deployment to Vercel${NC}"
echo "=============================================="

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

# Check if backend URL is available
check_backend_url() {
    if [ -f ".env.backend" ]; then
        source .env.backend
        if [ -z "$BACKEND_URL" ]; then
            print_error "Backend URL not found in .env.backend"
            echo "Please run the backend deployment script first or manually set BACKEND_URL"
            exit 1
        fi
        print_status "Backend URL found: $BACKEND_URL"
    else
        print_warning "Backend URL file not found. Please enter your backend URL:"
        read -p "Backend URL: " BACKEND_URL
        if [ -z "$BACKEND_URL" ]; then
            print_error "Backend URL is required"
            exit 1
        fi
        echo "BACKEND_URL=$BACKEND_URL" > .env.backend
    fi
}

# Update vercel.json with backend URL
update_vercel_config() {
    echo -e "${BLUE}🔧 Updating Vercel configuration...${NC}"
    
    # Extract the backend URL without protocol for the rewrite destination
    BACKEND_DOMAIN=$(echo $BACKEND_URL | sed 's|https://||' | sed 's|http://||')
    
    cat > vercel.json << EOF
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
      "destination": "https://$BACKEND_DOMAIN/api/\$1"
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
    "VITE_API_URL": "$BACKEND_URL",
    "VITE_ENVIRONMENT": "production"
  },
  "build": {
    "env": {
      "VITE_API_URL": "$BACKEND_URL",
      "VITE_ENVIRONMENT": "production"
    }
  }
}
EOF
    
    print_status "Vercel configuration updated"
}

# Check prerequisites
check_prerequisites() {
    echo -e "${BLUE}🔍 Checking prerequisites...${NC}"
    
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

# Install dependencies and build
build_frontend() {
    echo -e "${BLUE}🔨 Building frontend...${NC}"
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        echo "Installing dependencies..."
        npm install
    fi
    
    # Build with production environment variables
    echo "Building with backend URL: $BACKEND_URL"
    VITE_API_URL="$BACKEND_URL" VITE_ENVIRONMENT="production" npm run build
    
    print_status "Frontend build completed"
}

# Deploy to Vercel
deploy_to_vercel() {
    echo -e "${BLUE}🚀 Deploying to Vercel...${NC}"
    
    # Deploy to production
    vercel --prod --yes \
        --env VITE_API_URL="$BACKEND_URL" \
        --env VITE_ENVIRONMENT="production"
    
    print_status "Frontend deployed to Vercel"
}

# Update backend CORS settings
update_backend_cors() {
    echo -e "${BLUE}🔄 Updating backend CORS settings...${NC}"
    
    # Get the Vercel URL from the deployment
    echo "Please enter your Vercel deployment URL (e.g., https://your-app.vercel.app):"
    read -p "Vercel URL: " VERCEL_URL
    
    if [ -z "$VERCEL_URL" ]; then
        print_warning "Vercel URL not provided. You'll need to update backend CORS manually."
        return
    fi
    
    # Check if we have GCP project info
    if [ -f ".env.backend" ]; then
        echo "Updating backend CORS settings..."
        echo "Please run this command to update your backend CORS:"
        echo ""
        echo -e "${YELLOW}gcloud run services update insomnia-backend \\"
        echo "  --region us-central1 \\"
        echo "  --set-env-vars=\"FRONTEND_URL=$VERCEL_URL\"${NC}"
        echo ""
        echo "Would you like to run this command now? (y/n)"
        read -p "Update CORS: " UPDATE_CORS
        
        if [ "$UPDATE_CORS" = "y" ] || [ "$UPDATE_CORS" = "Y" ]; then
            if command -v gcloud &> /dev/null; then
                gcloud run services update insomnia-backend \
                    --region us-central1 \
                    --set-env-vars="FRONTEND_URL=$VERCEL_URL"
                print_status "Backend CORS updated successfully"
            else
                print_warning "gcloud CLI not found. Please update CORS manually."
            fi
        fi
    else
        print_warning "Backend deployment info not found. Please update CORS manually."
    fi
}

# Test deployment
test_deployment() {
    echo -e "${BLUE}🧪 Testing deployment...${NC}"
    
    # Test backend health
    echo "Testing backend health..."
    if curl -s "$BACKEND_URL/api/health" > /dev/null; then
        print_status "Backend is responding"
    else
        print_warning "Backend health check failed"
    fi
    
    print_status "Deployment testing completed"
}

# Main deployment function
main() {
    echo -e "${BLUE}Starting frontend deployment process...${NC}"
    
    check_prerequisites
    check_backend_url
    update_vercel_config
    build_frontend
    deploy_to_vercel
    update_backend_cors
    test_deployment
    
    echo -e "${GREEN}🎉 Frontend deployment completed successfully!${NC}"
    echo "=================================================="
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Test your application end-to-end"
    echo "2. Verify audio translation functionality"
    echo "3. Set up monitoring and alerts"
    echo "4. Configure custom domain (optional)"
    
    echo -e "${YELLOW}Important:${NC}"
    echo "- Make sure to test the audio translation feature thoroughly"
    echo "- Monitor Cloud Run costs and adjust resources as needed"
    echo "- Set up proper API key management for production"
}

# Run main function
main "$@"

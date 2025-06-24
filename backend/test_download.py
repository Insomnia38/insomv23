#!/usr/bin/env python3
"""
Test script for video download functionality
"""

import requests

def test_download():
    """Test the video download endpoint"""
    
    analysis_id = "76daf835-847d-4301-b169-4f844f562a8d"
    filename = "test_export_20250607_211014.mp4"
    
    download_url = f"http://localhost:8000/api/export/{analysis_id}/{filename}"
    
    print(f"🔗 Testing download URL: {download_url}")
    
    try:
        # Test HEAD request first
        head_response = requests.head(download_url)
        print(f"📡 HEAD Response status: {head_response.status_code}")
        
        if head_response.status_code == 200:
            print("✅ Download endpoint is accessible!")
            print(f"📄 Content-Type: {head_response.headers.get('content-type')}")
            print(f"📏 Content-Length: {head_response.headers.get('content-length')} bytes")
            print(f"📎 Content-Disposition: {head_response.headers.get('content-disposition')}")
            return True
        else:
            print(f"❌ Download endpoint failed: {head_response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend server.")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 Testing video download...\n")
    success = test_download()
    print(f"\n{'✅ Download test passed!' if success else '❌ Download test failed!'}")

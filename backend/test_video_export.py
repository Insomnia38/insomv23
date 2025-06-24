#!/usr/bin/env python3
"""
Test script for video export functionality
"""

import requests
import json
import sys
import os

def test_video_export():
    """Test the video export endpoint with sample timeline data"""

    # Use real analysis ID and segment filenames
    analysis_id = "76daf835-847d-4301-b169-4f844f562a8d"

    # Sample timeline data that would come from the frontend
    sample_timeline_data = {
        "id": "test-timeline",
        "size": {"width": 1920, "height": 1080},
        "duration": 10000,  # 10 seconds in ms
        "trackItemsMap": {
            "item1": {
                "id": "item1",
                "type": "video",
                "display": {"from": 0, "to": 5000},
                "details": {"src": f"/api/segment/{analysis_id}/mezzanine/scene_ca047586-eedb-42ab-a97d-7b0715c4141d_mezzanine.mp4"},
                "metadata": {
                    "isMezzanineSegment": True,
                    "sceneId": "ca047586-eedb-42ab-a97d-7b0715c4141d"
                }
            },
            "item2": {
                "id": "item2",
                "type": "video",
                "display": {"from": 5000, "to": 10000},
                "details": {"src": f"/api/segment/{analysis_id}/mezzanine/scene_ef6e79d4-ca2f-473e-af4e-b0ee9b227720_mezzanine.mp4"},
                "metadata": {
                    "isMezzanineSegment": True,
                    "sceneId": "ef6e79d4-ca2f-473e-af4e-b0ee9b227720"
                }
            }
        },
        "clips": [
            {
                "id": "item1",
                "type": "video",
                "display": {"from": 0, "to": 5000},
                "details": {"src": f"/api/segment/{analysis_id}/mezzanine/scene_ca047586-eedb-42ab-a97d-7b0715c4141d_mezzanine.mp4"},
                "metadata": {
                    "isMezzanineSegment": True,
                    "sceneId": "ca047586-eedb-42ab-a97d-7b0715c4141d"
                }
            },
            {
                "id": "item2",
                "type": "video",
                "display": {"from": 5000, "to": 10000},
                "details": {"src": f"/api/segment/{analysis_id}/mezzanine/scene_ef6e79d4-ca2f-473e-af4e-b0ee9b227720_mezzanine.mp4"},
                "metadata": {
                    "isMezzanineSegment": True,
                    "sceneId": "ef6e79d4-ca2f-473e-af4e-b0ee9b227720"
                }
            }
        ]
    }

    export_payload = {
        "timeline_data": sample_timeline_data,
        "analysis_id": analysis_id,
        "composition_settings": {
            "width": 1920,
            "height": 1080,
            "fps": 30
        },
        "export_name": "test_export"
    }
    
    print("🧪 Testing video export endpoint...")
    print(f"📊 Timeline data: {len(sample_timeline_data.get('clips', []))} clips")
    print(f"🎬 Analysis ID: {export_payload['analysis_id']}")
    
    try:
        response = requests.post(
            "http://localhost:8000/api/export/video",
            json=export_payload,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"📡 Response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Export request successful!")
            print(f"📁 Download URL: {result.get('download_url')}")
            print(f"📄 Filename: {result.get('filename')}")
            print(f"📏 File size: {result.get('file_size')} bytes")
            print(f"🎞️ Segments: {result.get('segments_count')}")
            print(f"⏱️ Duration: {result.get('export_duration')} seconds")
        else:
            print("❌ Export request failed!")
            try:
                error_data = response.json()
                print(f"Error: {error_data.get('detail', 'Unknown error')}")
            except:
                print(f"Error: {response.text}")
                
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend server.")
        print("Make sure the backend is running on http://localhost:8000")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        return False
    
    return True

def test_health_check():
    """Test if the backend is running"""
    try:
        response = requests.get("http://localhost:8000/api/health")
        if response.status_code == 200:
            print("✅ Backend health check passed")
            return True
        else:
            print(f"❌ Backend health check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Backend is not running")
        return False

if __name__ == "__main__":
    print("🚀 Starting video export tests...\n")
    
    # Test health check first
    if not test_health_check():
        print("\n💡 Start the backend with: cd backend && python main.py")
        sys.exit(1)
    
    print()
    
    # Test video export
    success = test_video_export()
    
    print(f"\n{'✅ All tests passed!' if success else '❌ Some tests failed!'}")

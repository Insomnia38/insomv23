#!/usr/bin/env python3

import requests
import sys

def test_api():
    url = "http://localhost:8000/api/analyze"

    # Test with AI-based segmentation
    video_path = "analyzed_videos_store/0db05a20-b368-4edd-b2cd-4ffd94db3b6a.mp4"

    with open(video_path, 'rb') as video_file:
        files = {'video': ('test.mp4', video_file, 'video/mp4')}
        data = {'segmentation_method': 'ai-based'}

        print("Sending request with AI-based segmentation...")
        response = requests.post(url, files=files, data=data)

        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            scenes = result.get('scenes', [])
            print(f"Number of scenes: {len(scenes)}")
            if scenes:
                first_scene = scenes[0]
                print(f"First scene segmentation_method: {first_scene.get('segmentation_method', 'NOT_SET')}")
                print(f"First scene transition_type: {first_scene.get('transition_type', 'NOT_SET')}")
        else:
            print(f"Error: {response.text}")

if __name__ == "__main__":
    test_api()

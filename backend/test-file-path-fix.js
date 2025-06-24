#!/usr/bin/env node

/**
 * Test the file path resolution fix
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test the URL resolution function (copied from render.js)
function resolveVideoUrl(url) {
  if (!url) {
    console.warn('⚠️ Empty video URL provided');
    return null;
  }

  // If already a file path, return as-is
  if (url.startsWith('/') && !url.startsWith('/api/')) {
    return url;
  }

  // Convert API segment URLs to direct file paths
  if (url.startsWith('/api/segment/')) {
    // Extract analysis ID and file path from URL
    // Format: /api/segment/{analysis_id}/mezzanine/{filename}
    const urlParts = url.split('/');
    if (urlParts.length >= 5) {
      const analysisId = urlParts[3];
      const quality = urlParts[4]; // 'mezzanine' or 'proxy'
      const filename = urlParts[5];
      
      // Convert to direct file path
      const filePath = path.join(__dirname, 'analyzed_videos_store', analysisId, 'segments', quality, filename);
      
      // Check if file exists
      if (fs.existsSync(filePath)) {
        console.log('🔗 Resolved API URL to file path:', url, '->', filePath);
        return filePath;
      } else {
        console.error('❌ Video file not found:', filePath);
        return null;
      }
    }
  }

  // If it's an HTTP URL, we can't use it directly in server-side Remotion
  if (url.startsWith('http://') || url.startsWith('https://')) {
    console.warn('⚠️ HTTP URLs not supported in server-side Remotion:', url);
    return null;
  }

  // Return as-is if we can't determine how to resolve it
  console.warn('⚠️ Unable to resolve video URL:', url);
  return url;
}

// Test with actual URLs from your analysis
const testUrls = [
  '/api/segment/e38c31f5-c01e-46f0-92fe-15d60d29a27d/mezzanine/scene_e22f5a0e-4c02-4eca-9993-c1aa4da55f27_mezzanine.mp4',
  '/api/segment/e38c31f5-c01e-46f0-92fe-15d60d29a27d/mezzanine/scene_ae130f2e-83ea-4ffc-ba3f-09a9fff51419_mezzanine.mp4',
  'http://example.com/video.mp4',
  '/some/absolute/path.mp4'
];

console.log('🧪 Testing file path resolution...\n');

testUrls.forEach((url, index) => {
  console.log(`Test ${index + 1}:`);
  console.log(`  Input: ${url}`);
  const resolved = resolveVideoUrl(url);
  console.log(`  Output: ${resolved}`);
  
  if (resolved && resolved.startsWith('/') && !resolved.startsWith('/api/')) {
    // Check if the resolved file actually exists
    if (fs.existsSync(resolved)) {
      const stats = fs.statSync(resolved);
      console.log(`  ✅ File exists (${Math.round(stats.size / 1024)} KB)`);
    } else {
      console.log(`  ❌ File does not exist`);
    }
  }
  console.log('');
});

console.log('🎯 File path resolution test completed!');

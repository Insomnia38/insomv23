#!/usr/bin/env node

/**
 * Test script to verify Remotion URL resolution fix
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test the URL resolution function
function resolveVideoUrl(url) {
  if (!url) {
    console.warn('⚠️ Empty video URL provided');
    return null;
  }

  // If already absolute URL, return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // If relative URL starting with /api/, convert to absolute using localhost:8080
  if (url.startsWith('/api/')) {
    const absoluteUrl = `http://localhost:8080${url}`;
    console.log('🔗 Resolved relative API URL:', url, '->', absoluteUrl);
    return absoluteUrl;
  }

  // For other relative URLs, assume they need localhost:8080 prefix
  if (url.startsWith('/')) {
    const absoluteUrl = `http://localhost:8080${url}`;
    console.log('🔗 Resolved relative URL:', url, '->', absoluteUrl);
    return absoluteUrl;
  }

  // Return as-is if we can't determine how to resolve it
  console.warn('⚠️ Unable to resolve video URL:', url);
  return url;
}

// Test with sample URLs from the analysis data
const testUrls = [
  '/api/segment/e38c31f5-c01e-46f0-92fe-15d60d29a27d/mezzanine/scene_e22f5a0e-4c02-4eca-9993-c1aa4da55f27_mezzanine.mp4',
  '/api/segment/e38c31f5-c01e-46f0-92fe-15d60d29a27d/mezzanine/scene_ae130f2e-83ea-4ffc-ba3f-09a9fff51419_mezzanine.mp4',
  'http://example.com/video.mp4',
  null,
  ''
];

console.log('🧪 Testing URL resolution function...\n');

testUrls.forEach((url, index) => {
  console.log(`Test ${index + 1}:`);
  console.log(`  Input: ${url}`);
  console.log(`  Output: ${resolveVideoUrl(url)}`);
  console.log('');
});

// Test if we can access the actual video files
const analysisId = 'e38c31f5-c01e-46f0-92fe-15d60d29a27d';
const mezzanineDir = path.join(__dirname, 'analyzed_videos_store', analysisId, 'segments', 'mezzanine');

console.log('🎬 Checking if mezzanine video files exist...');
console.log(`Directory: ${mezzanineDir}`);

if (fs.existsSync(mezzanineDir)) {
  const files = fs.readdirSync(mezzanineDir);
  console.log(`✅ Found ${files.length} mezzanine video files:`);
  files.slice(0, 5).forEach((file, index) => {
    const filePath = path.join(mezzanineDir, file);
    const stats = fs.statSync(filePath);
    console.log(`  ${index + 1}. ${file} (${Math.round(stats.size / 1024)} KB)`);
  });
  if (files.length > 5) {
    console.log(`  ... and ${files.length - 5} more files`);
  }
} else {
  console.log('❌ Mezzanine directory not found');
}

console.log('\n🎯 URL resolution test completed!');

#!/usr/bin/env node

/**
 * Test script to verify the Remotion export fix with real timeline data
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sample timeline data based on the analysis ID from your console logs
const analysisId = 'e38c31f5-c01e-46f0-92fe-15d60d29a27d';

// Create a simplified timeline data structure with real video URLs
const testTimelineData = {
  trackItemsMap: {
    'test-video-1': {
      id: 'test-video-1',
      type: 'video',
      display: { from: 0, to: 3000 }, // 3 seconds
      trim: { from: 0, to: 3000 },
      details: {
        src: `/api/segment/${analysisId}/mezzanine/scene_e22f5a0e-4c02-4eca-9993-c1aa4da55f27_mezzanine.mp4`,
        volume: 100,
        playbackRate: 1
      },
      metadata: {
        sceneId: 'e22f5a0e-4c02-4eca-9993-c1aa4da55f27'
      }
    },
    'test-video-2': {
      id: 'test-video-2',
      type: 'video',
      display: { from: 3000, to: 6000 }, // Next 3 seconds
      trim: { from: 0, to: 3000 },
      details: {
        src: `/api/segment/${analysisId}/mezzanine/scene_ae130f2e-83ea-4ffc-ba3f-09a9fff51419_mezzanine.mp4`,
        volume: 100,
        playbackRate: 1
      },
      metadata: {
        sceneId: 'ae130f2e-83ea-4ffc-ba3f-09a9fff51419'
      }
    }
  },
  trackItemIds: ['test-video-1', 'test-video-2'],
  duration: 6000, // 6 seconds total
  size: { width: 720, height: 1280 }, // Match the original video resolution
  fps: 30,
  compositionSettings: {
    width: 720,
    height: 1280,
    fps: 30,
    durationInFrames: Math.round(6000 / 1000 * 30) // 6 seconds * 30 fps
  }
};

async function testRealExport() {
  console.log('🧪 Testing Remotion export with real video URLs...');
  console.log(`📊 Analysis ID: ${analysisId}`);
  console.log(`🎬 Timeline items: ${Object.keys(testTimelineData.trackItemsMap).length}`);
  console.log(`⏱️ Duration: ${testTimelineData.duration}ms`);
  
  // Check if the video files exist
  const videoUrls = Object.values(testTimelineData.trackItemsMap)
    .filter(item => item.type === 'video')
    .map(item => item.details.src);
  
  console.log('\n🔍 Checking if source video files exist...');
  for (const url of videoUrls) {
    // Convert API URL to file path
    const relativePath = url.replace('/api/segment/', 'analyzed_videos_store/').replace('/mezzanine/', '/segments/mezzanine/');
    const filePath = path.join(__dirname, relativePath);
    
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      console.log(`✅ ${path.basename(filePath)} (${Math.round(stats.size / 1024)} KB)`);
    } else {
      console.log(`❌ ${path.basename(filePath)} - NOT FOUND`);
      console.log(`   Expected path: ${filePath}`);
    }
  }
  
  // Test the export
  const outputPath = path.join(__dirname, 'test-exports', `real-export-test-${Date.now()}.mp4`);
  
  console.log('\n🎬 Starting real export test...');
  console.log(`📁 Output: ${outputPath}`);
  
  try {
    const renderScript = path.join(__dirname, 'remotion-renderer', 'render.js');
    
    const process = spawn('node', [
      renderScript,
      JSON.stringify(testTimelineData),
      outputPath
    ], {
      cwd: path.join(__dirname, 'remotion-renderer'),
      stdio: 'inherit'
    });
    
    return new Promise((resolve, reject) => {
      process.on('close', (code) => {
        if (code === 0) {
          console.log('\n✅ Real export test completed successfully!');
          
          // Check output file
          if (fs.existsSync(outputPath)) {
            const stats = fs.statSync(outputPath);
            console.log(`📊 Output file: ${path.basename(outputPath)} (${Math.round(stats.size / 1024)} KB)`);
            
            if (stats.size > 1000) { // More than 1KB suggests actual content
              console.log('🎉 Export appears to contain actual video content (not just black screen)!');
            } else {
              console.log('⚠️ Export file is very small - might still be black screen');
            }
          } else {
            console.log('❌ Output file was not created');
          }
          
          resolve(true);
        } else {
          console.log(`❌ Real export test failed with code: ${code}`);
          reject(new Error(`Export failed with code ${code}`));
        }
      });
      
      process.on('error', (error) => {
        console.log(`❌ Process error: ${error.message}`);
        reject(error);
      });
    });
    
  } catch (error) {
    console.error('❌ Export test failed:', error.message);
    return false;
  }
}

// Run the test
testRealExport().catch(console.error);

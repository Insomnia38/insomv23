#!/usr/bin/env node

/**
 * Test with a simple video copy to eliminate path issues
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Copy the video to a simpler path
const sourceVideo = path.join(__dirname, 'analyzed_videos_store/e38c31f5-c01e-46f0-92fe-15d60d29a27d/segments/mezzanine/scene_e22f5a0e-4c02-4eca-9993-c1aa4da55f27_mezzanine.mp4');
const testVideo = path.join(__dirname, 'test-video.mp4');

console.log('🧪 Testing with simple video path...');
console.log(`📁 Source: ${sourceVideo}`);
console.log(`📁 Test copy: ${testVideo}`);

// Copy the video
if (fs.existsSync(sourceVideo)) {
  fs.copyFileSync(sourceVideo, testVideo);
  console.log('✅ Video copied successfully');
} else {
  console.log('❌ Source video not found');
  process.exit(1);
}

// Create simple timeline data
const simpleTimeline = {
  trackItemsMap: {
    'simple-video': {
      id: 'simple-video',
      type: 'video',
      display: { from: 0, to: 1400 }, // Use actual video duration
      trim: { from: 0, to: 1400 },
      details: {
        src: testVideo, // Use simple path
        volume: 100,
        playbackRate: 1
      }
    }
  },
  trackItemIds: ['simple-video'],
  duration: 1400, // Match video duration
  size: { width: 720, height: 1280 },
  fps: 30,
  compositionSettings: {
    width: 720,
    height: 1280,
    fps: 30,
    durationInFrames: Math.round(1400 / 1000 * 30) // ~42 frames
  }
};

async function testSimpleVideo() {
  const outputPath = path.join(__dirname, 'test-exports', `simple-video-test-${Date.now()}.mp4`);
  
  console.log('\n🎬 Testing simple video export...');
  console.log(`📁 Output: ${outputPath}`);
  console.log(`⏱️ Duration: ${simpleTimeline.duration}ms`);
  console.log(`🎞️ Frames: ${simpleTimeline.compositionSettings.durationInFrames}`);
  
  try {
    const renderScript = path.join(__dirname, 'remotion-renderer', 'render.js');
    
    const process = spawn('node', [
      renderScript,
      JSON.stringify(simpleTimeline),
      outputPath
    ], {
      cwd: path.join(__dirname, 'remotion-renderer'),
      stdio: 'inherit'
    });
    
    return new Promise((resolve, reject) => {
      process.on('close', (code) => {
        if (code === 0) {
          console.log('\n✅ Simple video test completed!');
          
          // Check output file
          if (fs.existsSync(outputPath)) {
            const stats = fs.statSync(outputPath);
            console.log(`📊 Output file: ${path.basename(outputPath)} (${Math.round(stats.size / 1024)} KB)`);
            
            // Clean up test video
            if (fs.existsSync(testVideo)) {
              fs.unlinkSync(testVideo);
              console.log('🧹 Cleaned up test video');
            }
            
            resolve(true);
          } else {
            console.log('❌ Output file was not created');
            resolve(false);
          }
        } else {
          console.log(`❌ Simple video test failed with code: ${code}`);
          reject(new Error(`Export failed with code ${code}`));
        }
      });
      
      process.on('error', (error) => {
        console.log(`❌ Process error: ${error.message}`);
        reject(error);
      });
    });
    
  } catch (error) {
    console.error('❌ Simple video test failed:', error.message);
    return false;
  }
}

// Run the test
testSimpleVideo().catch(console.error);

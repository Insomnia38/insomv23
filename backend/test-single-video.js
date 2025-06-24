#!/usr/bin/env node

/**
 * Test with a single video file to debug the black screen issue
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test with just one video file
const analysisId = 'e38c31f5-c01e-46f0-92fe-15d60d29a27d';
const testVideoFile = 'scene_e22f5a0e-4c02-4eca-9993-c1aa4da55f27_mezzanine.mp4';
const videoPath = path.join(__dirname, 'analyzed_videos_store', analysisId, 'segments', 'mezzanine', testVideoFile);

console.log('🧪 Testing single video file...');
console.log(`📁 Video path: ${videoPath}`);

// Check if file exists and get info
if (fs.existsSync(videoPath)) {
  const stats = fs.statSync(videoPath);
  console.log(`✅ File exists: ${Math.round(stats.size / 1024)} KB`);
} else {
  console.log('❌ File does not exist!');
  process.exit(1);
}

// Create minimal timeline data with just one video
const singleVideoTimeline = {
  trackItemsMap: {
    'single-video': {
      id: 'single-video',
      type: 'video',
      display: { from: 0, to: 3000 }, // 3 seconds
      trim: { from: 0, to: 3000 },
      details: {
        src: videoPath, // Use direct file path
        volume: 100,
        playbackRate: 1
      }
    }
  },
  trackItemIds: ['single-video'],
  duration: 3000,
  size: { width: 720, height: 1280 },
  fps: 30,
  compositionSettings: {
    width: 720,
    height: 1280,
    fps: 30,
    durationInFrames: 90 // 3 seconds * 30 fps
  }
};

async function testSingleVideo() {
  const outputPath = path.join(__dirname, 'test-exports', `single-video-test-${Date.now()}.mp4`);
  
  console.log('\n🎬 Testing single video export...');
  console.log(`📁 Output: ${outputPath}`);
  
  try {
    const renderScript = path.join(__dirname, 'remotion-renderer', 'render.js');
    
    const process = spawn('node', [
      renderScript,
      JSON.stringify(singleVideoTimeline),
      outputPath
    ], {
      cwd: path.join(__dirname, 'remotion-renderer'),
      stdio: 'inherit'
    });
    
    return new Promise((resolve, reject) => {
      process.on('close', (code) => {
        if (code === 0) {
          console.log('\n✅ Single video test completed!');
          
          // Check output file
          if (fs.existsSync(outputPath)) {
            const stats = fs.statSync(outputPath);
            console.log(`📊 Output file: ${path.basename(outputPath)} (${Math.round(stats.size / 1024)} KB)`);
            
            // Test if we can get video info using ffprobe
            console.log('\n🔍 Analyzing output with ffprobe...');
            const ffprobe = spawn('ffprobe', [
              '-v', 'quiet',
              '-print_format', 'json',
              '-show_format',
              '-show_streams',
              outputPath
            ], { stdio: 'pipe' });
            
            let ffprobeOutput = '';
            ffprobe.stdout.on('data', (data) => {
              ffprobeOutput += data.toString();
            });
            
            ffprobe.on('close', (ffprobeCode) => {
              if (ffprobeCode === 0 && ffprobeOutput) {
                try {
                  const info = JSON.parse(ffprobeOutput);
                  console.log('📹 Video info:');
                  console.log(`  Duration: ${info.format.duration}s`);
                  console.log(`  Size: ${info.format.size} bytes`);
                  if (info.streams && info.streams[0]) {
                    console.log(`  Resolution: ${info.streams[0].width}x${info.streams[0].height}`);
                    console.log(`  Codec: ${info.streams[0].codec_name}`);
                  }
                } catch (e) {
                  console.log('⚠️ Could not parse ffprobe output');
                }
              } else {
                console.log('⚠️ ffprobe failed or not available');
              }
              resolve(true);
            });
          } else {
            console.log('❌ Output file was not created');
            resolve(false);
          }
        } else {
          console.log(`❌ Single video test failed with code: ${code}`);
          reject(new Error(`Export failed with code ${code}`));
        }
      });
      
      process.on('error', (error) => {
        console.log(`❌ Process error: ${error.message}`);
        reject(error);
      });
    });
    
  } catch (error) {
    console.error('❌ Single video test failed:', error.message);
    return false;
  }
}

// Run the test
testSingleVideo().catch(console.error);

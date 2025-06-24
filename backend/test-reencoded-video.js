#!/usr/bin/env node

/**
 * Test with re-encoded video
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const reencodedVideo = path.join(__dirname, 'test-reencoded.mp4');

console.log('🧪 Testing with re-encoded video...');
console.log(`📁 Re-encoded video: ${reencodedVideo}`);

// Check if re-encoded video exists
if (fs.existsSync(reencodedVideo)) {
  const stats = fs.statSync(reencodedVideo);
  console.log(`✅ Re-encoded video exists: ${Math.round(stats.size / 1024)} KB`);
} else {
  console.log('❌ Re-encoded video not found');
  process.exit(1);
}

// Create timeline data with re-encoded video
const reencodedTimeline = {
  trackItemsMap: {
    'reencoded-video': {
      id: 'reencoded-video',
      type: 'video',
      display: { from: 0, to: 1460 }, // Match actual duration
      trim: { from: 0, to: 1460 },
      details: {
        src: reencodedVideo,
        volume: 100,
        playbackRate: 1
      }
    }
  },
  trackItemIds: ['reencoded-video'],
  duration: 1460,
  size: { width: 720, height: 1280 },
  fps: 30,
  compositionSettings: {
    width: 720,
    height: 1280,
    fps: 30,
    durationInFrames: Math.round(1460 / 1000 * 30) // ~44 frames
  }
};

async function testReencodedVideo() {
  const outputPath = path.join(__dirname, 'test-exports', `reencoded-video-test-${Date.now()}.mp4`);
  
  console.log('\n🎬 Testing with re-encoded video...');
  console.log(`📁 Output: ${outputPath}`);
  
  try {
    const renderScript = path.join(__dirname, 'remotion-renderer', 'render.js');
    
    const process = spawn('node', [
      renderScript,
      JSON.stringify(reencodedTimeline),
      outputPath
    ], {
      cwd: path.join(__dirname, 'remotion-renderer'),
      stdio: 'inherit'
    });
    
    return new Promise((resolve, reject) => {
      process.on('close', (code) => {
        if (code === 0) {
          console.log('\n✅ Re-encoded video test completed!');
          
          // Check output file
          if (fs.existsSync(outputPath)) {
            const stats = fs.statSync(outputPath);
            console.log(`📊 Output file: ${path.basename(outputPath)} (${Math.round(stats.size / 1024)} KB)`);
            
            // Check bitrate
            const ffprobe = spawn('ffprobe', [
              '-v', 'quiet',
              '-show_entries', 'format=bit_rate,duration',
              '-of', 'csv=p=0',
              outputPath
            ], { stdio: 'pipe' });
            
            let ffprobeOutput = '';
            ffprobe.stdout.on('data', (data) => {
              ffprobeOutput += data.toString();
            });
            
            ffprobe.on('close', (ffprobeCode) => {
              if (ffprobeCode === 0 && ffprobeOutput) {
                const [duration, bitrate] = ffprobeOutput.trim().split(',');
                console.log(`📊 Duration: ${duration}s, Bitrate: ${bitrate} bps`);
                
                if (parseInt(bitrate) > 50000) {
                  console.log('✅ Video has good bitrate - likely has content!');
                } else {
                  console.log('⚠️ Video has low bitrate - might be black');
                }
              }
              resolve(true);
            });
          } else {
            console.log('❌ Output file was not created');
            resolve(false);
          }
        } else {
          console.log(`❌ Re-encoded video test failed with code: ${code}`);
          reject(new Error(`Export failed with code ${code}`));
        }
      });
      
      process.on('error', (error) => {
        console.log(`❌ Process error: ${error.message}`);
        reject(error);
      });
    });
    
  } catch (error) {
    console.error('❌ Re-encoded video test failed:', error.message);
    return false;
  }
}

// Run the test
testReencodedVideo().catch(console.error);

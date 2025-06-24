#!/usr/bin/env node

/**
 * Test with generated test video
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testVideo = path.join(__dirname, 'test-simple.mp4');

console.log('🧪 Testing with generated test video...');
console.log(`📁 Test video: ${testVideo}`);

// Check if test video exists
if (fs.existsSync(testVideo)) {
  const stats = fs.statSync(testVideo);
  console.log(`✅ Test video exists: ${Math.round(stats.size / 1024)} KB`);
} else {
  console.log('❌ Test video not found');
  process.exit(1);
}

// Create timeline data with test video
const testTimeline = {
  trackItemsMap: {
    'test-video': {
      id: 'test-video',
      type: 'video',
      display: { from: 0, to: 2000 }, // 2 seconds
      trim: { from: 0, to: 2000 },
      details: {
        src: testVideo,
        volume: 100,
        playbackRate: 1
      }
    }
  },
  trackItemIds: ['test-video'],
  duration: 2000,
  size: { width: 720, height: 1280 },
  fps: 30,
  compositionSettings: {
    width: 720,
    height: 1280,
    fps: 30,
    durationInFrames: 60 // 2 seconds * 30 fps
  }
};

async function testWithTestVideo() {
  const outputPath = path.join(__dirname, 'test-exports', `test-video-export-${Date.now()}.mp4`);
  
  console.log('\n🎬 Testing with generated test video...');
  console.log(`📁 Output: ${outputPath}`);
  
  try {
    const renderScript = path.join(__dirname, 'remotion-renderer', 'render.js');
    
    const process = spawn('node', [
      renderScript,
      JSON.stringify(testTimeline),
      outputPath
    ], {
      cwd: path.join(__dirname, 'remotion-renderer'),
      stdio: 'inherit'
    });
    
    return new Promise((resolve, reject) => {
      process.on('close', (code) => {
        if (code === 0) {
          console.log('\n✅ Test video export completed!');
          
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
          console.log(`❌ Test video export failed with code: ${code}`);
          reject(new Error(`Export failed with code ${code}`));
        }
      });
      
      process.on('error', (error) => {
        console.log(`❌ Process error: ${error.message}`);
        reject(error);
      });
    });
    
  } catch (error) {
    console.error('❌ Test video export failed:', error.message);
    return false;
  }
}

// Run the test
testWithTestVideo().catch(console.error);

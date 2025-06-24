#!/usr/bin/env node

/**
 * Test with two videos to debug sequencing
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test with two video files
const analysisId = 'e38c31f5-c01e-46f0-92fe-15d60d29a27d';
const video1 = 'scene_e22f5a0e-4c02-4eca-9993-c1aa4da55f27_mezzanine.mp4';
const video2 = 'scene_ae130f2e-83ea-4ffc-ba3f-09a9fff51419_mezzanine.mp4';

const video1Path = path.join(__dirname, 'analyzed_videos_store', analysisId, 'segments', 'mezzanine', video1);
const video2Path = path.join(__dirname, 'analyzed_videos_store', analysisId, 'segments', 'mezzanine', video2);

console.log('🧪 Testing two video sequence...');
console.log(`📁 Video 1: ${video1Path}`);
console.log(`📁 Video 2: ${video2Path}`);

// Check if files exist
[video1Path, video2Path].forEach((videoPath, index) => {
  if (fs.existsSync(videoPath)) {
    const stats = fs.statSync(videoPath);
    console.log(`✅ Video ${index + 1} exists: ${Math.round(stats.size / 1024)} KB`);
  } else {
    console.log(`❌ Video ${index + 1} does not exist!`);
    process.exit(1);
  }
});

// Create timeline data with two videos in sequence
// Video 1: 0-1430ms (1.43s)
// Video 2: 1430-3640ms (2.21s)
const twoVideoTimeline = {
  trackItemsMap: {
    'video-1': {
      id: 'video-1',
      type: 'video',
      display: { from: 0, to: 1430 },
      trim: { from: 0, to: 1430 },
      details: {
        src: video1Path,
        volume: 100,
        playbackRate: 1
      }
    },
    'video-2': {
      id: 'video-2',
      type: 'video',
      display: { from: 1430, to: 3640 },
      trim: { from: 0, to: 2210 },
      details: {
        src: video2Path,
        volume: 100,
        playbackRate: 1
      }
    }
  },
  trackItemIds: ['video-1', 'video-2'],
  duration: 3640, // Total duration
  size: { width: 720, height: 1280 },
  fps: 30,
  compositionSettings: {
    width: 720,
    height: 1280,
    fps: 30,
    durationInFrames: Math.round(3640 / 1000 * 30) // ~109 frames
  }
};

async function testTwoVideos() {
  const outputPath = path.join(__dirname, 'test-exports', `two-videos-test-${Date.now()}.mp4`);
  
  console.log('\n🎬 Testing two video sequence export...');
  console.log(`📁 Output: ${outputPath}`);
  console.log(`⏱️ Total duration: ${twoVideoTimeline.duration}ms`);
  console.log(`🎞️ Total frames: ${twoVideoTimeline.compositionSettings.durationInFrames}`);
  
  try {
    const renderScript = path.join(__dirname, 'remotion-renderer', 'render.js');
    
    const process = spawn('node', [
      renderScript,
      JSON.stringify(twoVideoTimeline),
      outputPath
    ], {
      cwd: path.join(__dirname, 'remotion-renderer'),
      stdio: 'inherit'
    });
    
    return new Promise((resolve, reject) => {
      process.on('close', (code) => {
        if (code === 0) {
          console.log('\n✅ Two video test completed!');
          
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
                  
                  // Check if duration matches expected
                  const expectedDuration = twoVideoTimeline.duration / 1000;
                  const actualDuration = parseFloat(info.format.duration);
                  console.log(`  Expected duration: ${expectedDuration}s`);
                  console.log(`  Actual duration: ${actualDuration}s`);
                  
                  if (Math.abs(actualDuration - expectedDuration) < 0.1) {
                    console.log('✅ Duration matches expected!');
                  } else {
                    console.log('⚠️ Duration mismatch!');
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
          console.log(`❌ Two video test failed with code: ${code}`);
          reject(new Error(`Export failed with code ${code}`));
        }
      });
      
      process.on('error', (error) => {
        console.log(`❌ Process error: ${error.message}`);
        reject(error);
      });
    });
    
  } catch (error) {
    console.error('❌ Two video test failed:', error.message);
    return false;
  }
}

// Run the test
testTwoVideos().catch(console.error);

#!/usr/bin/env node

/**
 * Test script to simulate the full 14-video export that was failing
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use the actual analysis ID from your console logs
const analysisId = 'e38c31f5-c01e-46f0-92fe-15d60d29a27d';

// Load the actual analysis data to get the scene information
const analysisDataPath = path.join(__dirname, 'analysis_data_store', `${analysisId}.json`);
let analysisData = null;

try {
  const rawData = fs.readFileSync(analysisDataPath, 'utf8');
  analysisData = JSON.parse(rawData);
  console.log('✅ Loaded analysis data successfully');
} catch (error) {
  console.error('❌ Failed to load analysis data:', error.message);
  process.exit(1);
}

// Create timeline data with all 14 scenes
const scenes = analysisData.analysisResult.scenes;
console.log(`📊 Found ${scenes.length} scenes in analysis data`);

const trackItemsMap = {};
const trackItemIds = [];
let currentTime = 0;

scenes.forEach((scene, index) => {
  const itemId = `scene-${scene.sceneId}`;
  const duration = Math.round(scene.duration * 1000); // Convert to milliseconds
  
  trackItemsMap[itemId] = {
    id: itemId,
    type: 'video',
    display: { 
      from: currentTime, 
      to: currentTime + duration 
    },
    trim: { from: 0, to: duration },
    details: {
      src: scene.mezzanine_video_url, // This should be the relative URL
      volume: 100,
      playbackRate: 1
    },
    metadata: {
      sceneId: scene.sceneId,
      sceneIndex: scene.scene_index,
      originalDuration: scene.duration
    }
  };
  
  trackItemIds.push(itemId);
  currentTime += duration;
  
  console.log(`📹 Scene ${index + 1}: ${scene.sceneId} (${scene.duration}s) -> ${scene.mezzanine_video_url}`);
});

const totalDuration = currentTime;
console.log(`⏱️ Total timeline duration: ${totalDuration}ms (${Math.round(totalDuration/1000)}s)`);

// Create the full timeline data structure
const fullTimelineData = {
  trackItemsMap,
  trackItemIds,
  duration: totalDuration,
  size: { 
    width: analysisData.analysisResult.metadata.resolution.width, 
    height: analysisData.analysisResult.metadata.resolution.height 
  },
  fps: Math.round(analysisData.analysisResult.metadata.fps),
  compositionSettings: {
    width: analysisData.analysisResult.metadata.resolution.width,
    height: analysisData.analysisResult.metadata.resolution.height,
    fps: Math.round(analysisData.analysisResult.metadata.fps),
    durationInFrames: Math.round(totalDuration / 1000 * Math.round(analysisData.analysisResult.metadata.fps))
  }
};

async function testFullExport() {
  console.log('\n🎬 Testing full 14-scene export...');
  console.log(`📊 Timeline items: ${Object.keys(fullTimelineData.trackItemsMap).length}`);
  console.log(`📐 Resolution: ${fullTimelineData.size.width}x${fullTimelineData.size.height}`);
  console.log(`🎞️ FPS: ${fullTimelineData.fps}`);
  console.log(`⏱️ Duration: ${Math.round(fullTimelineData.duration/1000)}s`);
  
  // Check if all mezzanine files exist
  console.log('\n🔍 Checking if all mezzanine video files exist...');
  let missingFiles = 0;
  
  for (const [itemId, item] of Object.entries(fullTimelineData.trackItemsMap)) {
    if (item.type === 'video') {
      // Convert API URL to file path
      const relativePath = item.details.src.replace('/api/segment/', 'analyzed_videos_store/').replace('/mezzanine/', '/segments/mezzanine/');
      const filePath = path.join(__dirname, relativePath);
      
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        console.log(`✅ ${path.basename(filePath)} (${Math.round(stats.size / 1024)} KB)`);
      } else {
        console.log(`❌ ${path.basename(filePath)} - NOT FOUND`);
        missingFiles++;
      }
    }
  }
  
  if (missingFiles > 0) {
    console.log(`\n❌ ${missingFiles} video files are missing. Cannot proceed with export.`);
    return false;
  }
  
  // Test the export
  const outputPath = path.join(__dirname, 'test-exports', `full-export-test-${Date.now()}.mp4`);
  
  console.log('\n🎬 Starting full export test...');
  console.log(`📁 Output: ${outputPath}`);
  
  try {
    const renderScript = path.join(__dirname, 'remotion-renderer', 'render.js');
    
    const process = spawn('node', [
      renderScript,
      JSON.stringify(fullTimelineData),
      outputPath
    ], {
      cwd: path.join(__dirname, 'remotion-renderer'),
      stdio: 'inherit'
    });
    
    return new Promise((resolve, reject) => {
      process.on('close', (code) => {
        if (code === 0) {
          console.log('\n✅ Full export test completed successfully!');
          
          // Check output file
          if (fs.existsSync(outputPath)) {
            const stats = fs.statSync(outputPath);
            console.log(`📊 Output file: ${path.basename(outputPath)} (${Math.round(stats.size / 1024)} KB)`);
            
            // Compare with your original export size (1541 KB)
            const expectedSize = 1541; // KB from your console logs
            const actualSize = Math.round(stats.size / 1024);
            
            if (actualSize > 500) { // Reasonable size for video content
              console.log('🎉 Export appears to contain actual video content!');
              console.log(`📈 Size comparison: Expected ~${expectedSize}KB, Got ${actualSize}KB`);
            } else {
              console.log('⚠️ Export file is small - might still have issues');
            }
          } else {
            console.log('❌ Output file was not created');
          }
          
          resolve(true);
        } else {
          console.log(`❌ Full export test failed with code: ${code}`);
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
testFullExport().catch(console.error);

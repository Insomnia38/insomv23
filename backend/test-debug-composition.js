#!/usr/bin/env node

/**
 * Create a debug composition to see what's actually being rendered
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a simple debug composition
const debugComposition = `
import React from 'react';
import { Composition, Sequence, AbsoluteFill, OffthreadVideo, registerRoot } from 'remotion';

const DebugComposition = () => {
  const videoPath = '/home/spen/Desktop/insomnia/insomniav23-3d4707b2e0dbae78fe4a4f9a5ffc2a92b05a86cb/backend/analyzed_videos_store/e38c31f5-c01e-46f0-92fe-15d60d29a27d/segments/mezzanine/scene_e22f5a0e-4c02-4eca-9993-c1aa4da55f27_mezzanine.mp4';
  
  console.log('🎬 Debug: Rendering video from:', videoPath);
  console.log('🎬 Debug: File exists:', require('fs').existsSync(videoPath));
  
  return (
    <AbsoluteFill style={{ backgroundColor: 'red' }}>
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        color: 'white',
        fontSize: 20,
        zIndex: 1000
      }}>
        DEBUG: Frame {require('remotion').useCurrentFrame()}
      </div>
      
      <OffthreadVideo
        src={videoPath}
        volume={1}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
    </AbsoluteFill>
  );
};

registerRoot(() => {
  return (
    <Composition
      id="DebugComposition"
      component={DebugComposition}
      durationInFrames={90}
      fps={30}
      width={720}
      height={1280}
    />
  );
});
`;

// Write the debug composition
const debugPath = path.join(__dirname, 'remotion-renderer', 'debug-composition.jsx');
fs.writeFileSync(debugPath, debugComposition);

console.log('✅ Created debug composition:', debugPath);
console.log('\n🎬 Now run:');
console.log(`cd remotion-renderer && npx remotion render debug-composition.jsx DebugComposition ../test-exports/debug-test.mp4`);

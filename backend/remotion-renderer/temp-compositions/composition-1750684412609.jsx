
import React from 'react';
import { Composition, AbsoluteFill, Video, useCurrentFrame, interpolate, Sequence } from 'remotion';
import path from 'path';

// Helper function to convert API URLs to file paths
function resolveVideoPath(url) {
  if (url.startsWith('/api/segment/')) {
    // Extract analysis ID and file path from URL
    // Format: /api/segment/{analysis_id}/mezzanine/{filename}
    const urlParts = url.split('/');
    if (urlParts.length >= 5) {
      const analysisId = urlParts[3];
      const quality = urlParts[4]; // 'mezzanine' or 'proxy'
      const filename = urlParts[5];

      // Convert to direct file path (relative to the composition file location)
      const filePath = path.join(__dirname, '..', 'analyzed_videos_store', analysisId, 'segments', quality, filename);
      console.log('🎬 Resolved video path:', filePath);
      return filePath;
    }
  }
  return url;
}

// Text component for subtitles and captions
const TextOverlay = ({ text, style, frame }) => {
  return (
    <div
      style={{
        position: 'absolute',
        ...style,
        color: style.color || 'white',
        fontSize: style.fontSize || 24,
        fontFamily: style.fontFamily || 'Arial, sans-serif',
        textAlign: style.textAlign || 'center',
        padding: '10px',
        backgroundColor: style.backgroundColor || 'rgba(0, 0, 0, 0.7)',
        borderRadius: '4px',
        zIndex: 1000
      }}
    >
      {text}
    </div>
  );
};

// Main timeline composition
const TimelineComposition = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      {/* Video layers */}
      
      
      {/* Text/Caption layers */}
      
      
      {/* Debug frame counter */}
      <div style={{
        position: 'absolute',
        top: 10,
        right: 10,
        color: 'white',
        fontSize: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: '4px 8px',
        borderRadius: '4px',
        zIndex: 2000
      }}>
        Frame: {frame}
      </div>
    </AbsoluteFill>
  );
};

// Register the composition
export const RemotionRoot = () => {
  return (
    <Composition
      id="TimelineComposition"
      component={TimelineComposition}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};

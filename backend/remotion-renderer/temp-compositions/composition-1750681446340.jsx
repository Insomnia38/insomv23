
import React from 'react';
import { Composition, Sequence, AbsoluteFill, OffthreadVideo, Img, Audio, registerRoot } from 'remotion';
import path from 'path';
import fs from 'fs';

// Resolve video URL to file path for Remotion renderer
function resolveVideoUrl(url) {
  if (!url) {
    console.warn('⚠️ Empty video URL provided');
    return null;
  }

  // If already a file path, return as-is
  if (url.startsWith('/') && !url.startsWith('/api/')) {
    return url;
  }

  // Convert API segment URLs to direct file paths
  if (url.startsWith('/api/segment/')) {
    // Extract analysis ID and file path from URL
    // Format: /api/segment/{analysis_id}/mezzanine/{filename}
    const urlParts = url.split('/');
    if (urlParts.length >= 5) {
      const analysisId = urlParts[3];
      const quality = urlParts[4]; // 'mezzanine' or 'proxy'
      const filename = urlParts[5];

      // Convert to direct file path (relative to the composition file location)
      const filePath = path.join(__dirname, '..', '..', 'analyzed_videos_store', analysisId, 'segments', quality, filename);

      // Check if file exists
      if (fs.existsSync(filePath)) {
        console.log('🔗 Resolved API URL to file path:', url, '->', filePath);
        return filePath;
      } else {
        console.error('❌ Video file not found:', filePath);
        return null;
      }
    }
  }

  // If it's an HTTP URL, we can't use it directly in server-side Remotion
  if (url.startsWith('http://') || url.startsWith('https://')) {
    console.warn('⚠️ HTTP URLs not supported in server-side Remotion:', url);
    return null;
  }

  // Return as-is if we can't determine how to resolve it
  console.warn('⚠️ Unable to resolve video URL:', url);
  return url;
}

// Timeline Composition Component
const TimelineComposition = (props) => {
  const timelineData = props.timelineData || { trackItemsMap: {}, trackItemIds: [] };
  const { trackItemsMap = {}, trackItemIds = [] } = timelineData;

  console.log('🎬 Rendering timeline with', trackItemIds.length, 'items');

  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      {trackItemIds.map((itemId, index) => {
        const item = trackItemsMap[itemId];
        if (!item) {
          console.warn('⚠️ Item not found:', itemId);
          return null;
        }

        const from = Math.round((item.display?.from || 0) / 1000 * 30);
        const to = Math.round((item.display?.to || duration) / 1000 * 30);
        const durationInFrames = to - from;

        console.log(`📊 Item ${itemId}: from=${from}, to=${to}, duration=${durationInFrames}, type=${item.type}`);

        if (durationInFrames <= 0) {
          console.warn('⚠️ Invalid duration for item:', itemId, durationInFrames);
          return null;
        }

        return (
          <Sequence
            key={itemId}
            from={from}
            durationInFrames={durationInFrames}
            style={{ zIndex: index }}
          >
            {renderTimelineItem(item, 30)}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

// Render individual timeline items
function renderTimelineItem(item, fps) {
  const { type, details = {}, display = {}, trim = {}, metadata = {} } = item;

  switch (type) {
    case 'video':
      // Resolve video URL to absolute format for Remotion
      const videoSrc = resolveVideoUrl(details.src);
      console.log('🎬 Video item src:', details.src, '-> resolved:', videoSrc);

      return (
        <AbsoluteFill>
          <OffthreadVideo
            src={videoSrc}
            startFrom={Math.round((trim.from || 0) / 1000 * fps)}
            endAt={Math.round((trim.to || display.to || 0) / 1000 * fps)}
            volume={(details.volume || 100) / 100}
            playbackRate={details.playbackRate || 1}
          />
        </AbsoluteFill>
      );

    case 'image':
      // Resolve image URL to absolute format for Remotion
      const imageSrc = resolveVideoUrl(details.src);
      console.log('🖼️ Image item src:', details.src, '-> resolved:', imageSrc);

      return (
        <AbsoluteFill>
          <Img
            src={imageSrc}
            style={{
              objectFit: 'cover',
              width: '100%',
              height: '100%'
            }}
          />
        </AbsoluteFill>
      );

    case 'audio':
      // Resolve audio URL to absolute format for Remotion
      const audioSrc = resolveVideoUrl(details.src);
      console.log('🎵 Audio item src:', details.src, '-> resolved:', audioSrc);

      return (
        <AbsoluteFill>
          <Audio
            src={audioSrc}
            startFrom={Math.round((trim.from || 0) / 1000 * fps)}
            endAt={Math.round((trim.to || display.to || 0) / 1000 * fps)}
            volume={(details.volume || 100) / 100}
          />
        </AbsoluteFill>
      );

    case 'text':
    case 'caption':
      console.log('🎨 Rendering text item:', details.text, 'color:', details.color);
      return (
        <AbsoluteFill
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.1)'
          }}
        >
          <div style={{
            color: details.color || '#FFFFFF',
            fontSize: Math.max(details.fontSize || 48, 24) + 'px',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold',
            textAlign: 'center',
            padding: '20px',
            textShadow: '3px 3px 6px rgba(0,0,0,0.9)',
            background: metadata.isAIGenerated ?
              'linear-gradient(45deg, rgba(64, 224, 208, 0.3), rgba(255, 105, 180, 0.3))' :
              'rgba(0, 0, 0, 0.5)',
            borderRadius: '8px',
            border: metadata.isAIGenerated ? '2px solid rgba(64, 224, 208, 0.5)' : '1px solid rgba(255, 255, 255, 0.2)',
            minWidth: '200px',
            minHeight: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {details.text || 'Sample Text'}
          </div>
        </AbsoluteFill>
      );

    case 'gap':
      return (
        <AbsoluteFill
          style={{
            backgroundColor: details.backgroundColor || 'black'
          }}
        />
      );

    default:
      console.warn('Unknown timeline item type:', type);
      return (
        <AbsoluteFill
          style={{
            backgroundColor: 'rgba(255, 0, 0, 0.1)',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            fontSize: 16
          }}
        >
          <div>Unknown Item: {type}</div>
        </AbsoluteFill>
      );
  }
}

// Register the root composition
registerRoot(() => {
  return (
    <Composition
      id="TimelineComposition"
      component={TimelineComposition}
      durationInFrames={180}
      fps={30}
      width={720}
      height={1280}
    />
  );
});

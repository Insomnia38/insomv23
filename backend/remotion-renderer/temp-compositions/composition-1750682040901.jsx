
import React from 'react';
import { Composition, Sequence, AbsoluteFill, OffthreadVideo, Img, Audio, registerRoot } from 'remotion';

// Timeline Composition Component
const TimelineComposition = (props) => {
  const timelineData = props.timelineData || { trackItemsMap: {}, trackItemIds: [] };
  const { trackItemsMap = {}, trackItemIds = [], duration = 3000 } = timelineData;

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
      console.log('🎬 Video item src:', details.src);

      return (
        <AbsoluteFill>
          <OffthreadVideo
            src={details.src}
            startFrom={Math.round((trim.from || 0) / 1000 * fps)}
            endAt={Math.round((trim.to || display.to || 0) / 1000 * fps)}
            volume={(details.volume || 100) / 100}
            playbackRate={details.playbackRate || 1}
          />
        </AbsoluteFill>
      );

    case 'image':
      console.log('🖼️ Image item src:', details.src);

      return (
        <AbsoluteFill>
          <Img
            src={details.src}
            style={{
              objectFit: 'cover',
              width: '100%',
              height: '100%'
            }}
          />
        </AbsoluteFill>
      );

    case 'audio':
      console.log('🎵 Audio item src:', details.src);

      return (
        <AbsoluteFill>
          <Audio
            src={details.src}
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
      durationInFrames={90}
      fps={30}
      width={720}
      height={1280}
    />
  );
});

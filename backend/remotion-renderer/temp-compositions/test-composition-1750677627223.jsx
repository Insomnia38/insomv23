
import React from 'react';
import { Composition, Sequence, AbsoluteFill } from 'remotion';

// Test Timeline Composition Component
const TestComposition = ({ timelineData }) => {
  const { trackItemsMap = {}, trackItemIds = [] } = timelineData;
  
  return (
    <AbsoluteFill style={{ backgroundColor: 'black' }}>
      {trackItemIds.map((itemId, index) => {
        const item = trackItemsMap[itemId];
        if (!item) return null;
        
        const from = Math.round((item.display?.from || 0) / 1000 * 30);
        const to = Math.round((item.display?.to || 3000) / 1000 * 30);
        const durationInFrames = to - from;
        
        if (durationInFrames <= 0) return null;
        
        return (
          <Sequence
            key={itemId}
            from={from}
            durationInFrames={durationInFrames}
            style={{ zIndex: index }}
          >
            {renderTestItem(item)}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

// Render test timeline items
function renderTestItem(item) {
  const { type, details = {} } = item;
  
  if (type === 'text') {
    return (
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          color: details.color || 'white',
          fontSize: details.fontSize || 24,
          fontFamily: details.fontFamily || 'Arial',
          textAlign: 'center',
          padding: 20,
          background: 'linear-gradient(45deg, #40E0D0, #FF69B4)'
        }}
      >
        <div>{details.text || 'Test Text'}</div>
      </AbsoluteFill>
    );
  }
  
  return null;
}

// Export test composition
export const RemotionRoot = () => {
  return (
    <Composition
      id="TestComposition"
      component={TestComposition}
      durationInFrames={90}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};

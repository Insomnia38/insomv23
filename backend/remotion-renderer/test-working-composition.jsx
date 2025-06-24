import React from 'react';
import { Composition, AbsoluteFill, registerRoot } from 'remotion';

// Simple test composition
const TestComposition = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        color: 'white',
        fontSize: 48,
        fontFamily: 'Arial, sans-serif',
        textAlign: 'center'
      }}>
        🎬 Insomnia Export Test
      </div>
    </AbsoluteFill>
  );
};

// Register the composition
registerRoot(() => {
  return (
    <Composition
      id="TestComposition"
      component={TestComposition}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
    />
  );
});

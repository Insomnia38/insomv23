
import React from 'react';
import { Composition, AbsoluteFill, Video, useCurrentFrame, interpolate, Sequence, registerRoot } from 'remotion';

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

      // Convert to direct file path (using string concatenation instead of path.join)
      const filePath = `../analyzed_videos_store/${analysisId}/segments/${quality}/${filename}`;
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
      
      <Sequence from={0} durationInFrames={43}>
        <Video
          src={resolveVideoPath("http://localhost:8080/api/translated-video/translated_e22f5a0e-4c02-4eca-9993-c1aa4da55f27_e2741704.mp4")}
          startFrom={0}
          volume={1}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${1}, ${1}) translate(${0}px, ${0}px)`
          }}
        />
      </Sequence>
      
      <Sequence from={43} durationInFrames={67}>
        <Video
          src={resolveVideoPath("http://localhost:8080/api/segment/e38c31f5-c01e-46f0-92fe-15d60d29a27d/mezzanine/scene_ae130f2e-83ea-4ffc-ba3f-09a9fff51419_mezzanine.mp4")}
          startFrom={0}
          volume={1}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${1}, ${1}) translate(${0}px, ${0}px)`
          }}
        />
      </Sequence>
      
      <Sequence from={109} durationInFrames={93}>
        <Video
          src={resolveVideoPath("http://localhost:8080/api/segment/e38c31f5-c01e-46f0-92fe-15d60d29a27d/mezzanine/scene_be2d28b3-a706-4bf9-a17e-91153a40583b_mezzanine.mp4")}
          startFrom={0}
          volume={1}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${1}, ${1}) translate(${0}px, ${0}px)`
          }}
        />
      </Sequence>
      
      <Sequence from={202} durationInFrames={58}>
        <Video
          src={resolveVideoPath("http://localhost:8080/api/segment/e38c31f5-c01e-46f0-92fe-15d60d29a27d/mezzanine/scene_3131d1c2-1a49-4b21-98e1-1a21394ffae4_mezzanine.mp4")}
          startFrom={0}
          volume={1}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${1}, ${1}) translate(${0}px, ${0}px)`
          }}
        />
      </Sequence>
      
      <Sequence from={260} durationInFrames={20}>
        <Video
          src={resolveVideoPath("http://localhost:8080/api/segment/e38c31f5-c01e-46f0-92fe-15d60d29a27d/mezzanine/scene_810ea267-cef0-4ad5-95fa-3c9b5bde98fa_mezzanine.mp4")}
          startFrom={0}
          volume={1}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${1}, ${1}) translate(${0}px, ${0}px)`
          }}
        />
      </Sequence>
      
      <Sequence from={280} durationInFrames={106}>
        <Video
          src={resolveVideoPath("http://localhost:8080/api/segment/e38c31f5-c01e-46f0-92fe-15d60d29a27d/mezzanine/scene_ab3546d2-7ced-46e0-870a-1caea38170bb_mezzanine.mp4")}
          startFrom={0}
          volume={1}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${1}, ${1}) translate(${0}px, ${0}px)`
          }}
        />
      </Sequence>
      
      <Sequence from={386} durationInFrames={100}>
        <Video
          src={resolveVideoPath("http://localhost:8080/api/segment/e38c31f5-c01e-46f0-92fe-15d60d29a27d/mezzanine/scene_44ee7619-3a48-4d5c-b3b9-bb8e57bbe638_mezzanine.mp4")}
          startFrom={0}
          volume={1}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${1}, ${1}) translate(${0}px, ${0}px)`
          }}
        />
      </Sequence>
      
      <Sequence from={487} durationInFrames={190}>
        <Video
          src={resolveVideoPath("http://localhost:8080/api/segment/e38c31f5-c01e-46f0-92fe-15d60d29a27d/mezzanine/scene_e3727242-2e2e-42f2-b34d-70deb1f97006_mezzanine.mp4")}
          startFrom={0}
          volume={1}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${1}, ${1}) translate(${0}px, ${0}px)`
          }}
        />
      </Sequence>
      
      <Sequence from={677} durationInFrames={147}>
        <Video
          src={resolveVideoPath("http://localhost:8080/api/segment/e38c31f5-c01e-46f0-92fe-15d60d29a27d/mezzanine/scene_c6bc4287-a063-48d6-a493-958459672311_mezzanine.mp4")}
          startFrom={0}
          volume={1}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${1}, ${1}) translate(${0}px, ${0}px)`
          }}
        />
      </Sequence>
      
      <Sequence from={824} durationInFrames={21}>
        <Video
          src={resolveVideoPath("http://localhost:8080/api/segment/e38c31f5-c01e-46f0-92fe-15d60d29a27d/mezzanine/scene_d318bba0-119f-4029-a6d3-03375ac9a206_mezzanine.mp4")}
          startFrom={0}
          volume={1}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${1}, ${1}) translate(${0}px, ${0}px)`
          }}
        />
      </Sequence>
      
      <Sequence from={845} durationInFrames={22}>
        <Video
          src={resolveVideoPath("http://localhost:8080/api/segment/e38c31f5-c01e-46f0-92fe-15d60d29a27d/mezzanine/scene_f4a5da8a-b861-4288-bd7a-179a82cb00a8_mezzanine.mp4")}
          startFrom={0}
          volume={1}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${1}, ${1}) translate(${0}px, ${0}px)`
          }}
        />
      </Sequence>
      
      <Sequence from={867} durationInFrames={107}>
        <Video
          src={resolveVideoPath("http://localhost:8080/api/segment/e38c31f5-c01e-46f0-92fe-15d60d29a27d/mezzanine/scene_28143e0a-4e24-4b2a-b846-aad6154db355_mezzanine.mp4")}
          startFrom={0}
          volume={1}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${1}, ${1}) translate(${0}px, ${0}px)`
          }}
        />
      </Sequence>
      
      <Sequence from={974} durationInFrames={8}>
        <Video
          src={resolveVideoPath("http://localhost:8080/api/segment/e38c31f5-c01e-46f0-92fe-15d60d29a27d/mezzanine/scene_830ef2a6-f1d8-4279-b978-fae32999750c_mezzanine.mp4")}
          startFrom={0}
          volume={1}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${1}, ${1}) translate(${0}px, ${0}px)`
          }}
        />
      </Sequence>
      
      <Sequence from={982} durationInFrames={112}>
        <Video
          src={resolveVideoPath("http://localhost:8080/api/segment/e38c31f5-c01e-46f0-92fe-15d60d29a27d/mezzanine/scene_a3adc767-2652-4dfd-aea0-0b594f0a4b87_mezzanine.mp4")}
          startFrom={0}
          volume={1}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${1}, ${1}) translate(${0}px, ${0}px)`
          }}
        />
      </Sequence>
      
      {/* Text/Caption layers */}
      
      <Sequence from={48} durationInFrames={26}>
        <TextOverlay
          text="And has amnesia."
          style={{"left":"0px","top":"0px","width":"auto","height":"auto","fontSize":28,"color":"#ffffff","fontFamily":"Arial, sans-serif","textAlign":"center"}}
          frame={frame}
        />
      </Sequence>
      
      <Sequence from={74} durationInFrames={26}>
        <TextOverlay
          text="Oh, my God."
          style={{"left":"0px","top":"0px","width":"auto","height":"auto","fontSize":28,"color":"#ffffff","fontFamily":"Arial, sans-serif","textAlign":"center"}}
          frame={frame}
        />
      </Sequence>
      
      <Sequence from={48} durationInFrames={26}>
        <TextOverlay
          text="And has amnesia."
          style={{"left":"0px","top":"0px","width":"auto","height":"auto","fontSize":28,"color":"#ffffff","fontFamily":"Arial, sans-serif","textAlign":"center"}}
          frame={frame}
        />
      </Sequence>
      
      <Sequence from={74} durationInFrames={26}>
        <TextOverlay
          text="Oh, my God."
          style={{"left":"0px","top":"0px","width":"auto","height":"auto","fontSize":28,"color":"#ffffff","fontFamily":"Arial, sans-serif","textAlign":"center"}}
          frame={frame}
        />
      </Sequence>
      
      <Sequence from={48} durationInFrames={26}>
        <TextOverlay
          text="And has amnesia."
          style={{"left":"0px","top":"0px","width":"auto","height":"auto","fontSize":28,"color":"#ffffff","fontFamily":"Arial, sans-serif","textAlign":"center"}}
          frame={frame}
        />
      </Sequence>
      
      <Sequence from={74} durationInFrames={26}>
        <TextOverlay
          text="Oh, my God."
          style={{"left":"0px","top":"0px","width":"auto","height":"auto","fontSize":28,"color":"#ffffff","fontFamily":"Arial, sans-serif","textAlign":"center"}}
          frame={frame}
        />
      </Sequence>
      
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
registerRoot(() => {
  return (
    <Composition
      id="TimelineComposition"
      component={TimelineComposition}
      durationInFrames={1095}
      fps={30}
      width={1920}
      height={1200}
    />
  );
});

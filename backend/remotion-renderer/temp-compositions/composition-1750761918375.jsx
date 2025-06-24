
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
        ...style,
        zIndex: 1000,
        // Ensure text is visible and properly styled
        wordWrap: 'break-word',
        whiteSpace: 'pre-wrap'
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
          src={resolveVideoPath("http://localhost:8080/api/segment/a499d7a7-aa43-43c5-af75-93b2000f8ffe/mezzanine/scene_3548f90d-1e8b-48ff-a063-80da06322253_mezzanine.mp4")}
          startFrom={0}
          volume={1}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            transform: `scale(${1}, ${1}) translate(${0}px, ${0}px)`
          }}
        />
      </Sequence>
      
      <Sequence from={43} durationInFrames={67}>
        <Video
          src={resolveVideoPath("http://localhost:8080/api/translated-video/translated_e00c5bec-ad6a-44cd-bf4b-0f71e3171791_7b60ae40.mp4")}
          startFrom={0}
          volume={1}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            transform: `scale(${1}, ${1}) translate(${0}px, ${0}px)`
          }}
        />
      </Sequence>
      
      <Sequence from={109} durationInFrames={93}>
        <Video
          src={resolveVideoPath("http://localhost:8080/api/segment/a499d7a7-aa43-43c5-af75-93b2000f8ffe/mezzanine/scene_26e2c838-f18b-4daf-835a-356e2de9ad2a_mezzanine.mp4")}
          startFrom={0}
          volume={1}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            transform: `scale(${1}, ${1}) translate(${0}px, ${0}px)`
          }}
        />
      </Sequence>
      
      <Sequence from={202} durationInFrames={58}>
        <Video
          src={resolveVideoPath("http://localhost:8080/api/segment/a499d7a7-aa43-43c5-af75-93b2000f8ffe/mezzanine/scene_5d7f2e86-8ce8-40ec-bdd3-82a4723934eb_mezzanine.mp4")}
          startFrom={0}
          volume={1}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            transform: `scale(${1}, ${1}) translate(${0}px, ${0}px)`
          }}
        />
      </Sequence>
      
      <Sequence from={260} durationInFrames={20}>
        <Video
          src={resolveVideoPath("http://localhost:8080/api/segment/a499d7a7-aa43-43c5-af75-93b2000f8ffe/mezzanine/scene_c25dca89-4d9a-4b21-9f65-226f476ba28c_mezzanine.mp4")}
          startFrom={0}
          volume={1}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            transform: `scale(${1}, ${1}) translate(${0}px, ${0}px)`
          }}
        />
      </Sequence>
      
      <Sequence from={280} durationInFrames={106}>
        <Video
          src={resolveVideoPath("http://localhost:8080/api/segment/a499d7a7-aa43-43c5-af75-93b2000f8ffe/mezzanine/scene_bbc50573-bdc8-403f-8a38-169a1e5cf0ff_mezzanine.mp4")}
          startFrom={0}
          volume={1}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            transform: `scale(${1}, ${1}) translate(${0}px, ${0}px)`
          }}
        />
      </Sequence>
      
      <Sequence from={386} durationInFrames={100}>
        <Video
          src={resolveVideoPath("http://localhost:8080/api/segment/a499d7a7-aa43-43c5-af75-93b2000f8ffe/mezzanine/scene_4022ba62-9da9-4784-834b-e3f53711aca6_mezzanine.mp4")}
          startFrom={0}
          volume={1}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            transform: `scale(${1}, ${1}) translate(${0}px, ${0}px)`
          }}
        />
      </Sequence>
      
      <Sequence from={487} durationInFrames={190}>
        <Video
          src={resolveVideoPath("http://localhost:8080/api/segment/a499d7a7-aa43-43c5-af75-93b2000f8ffe/mezzanine/scene_c22c7601-daaf-4312-bc33-d298f20228be_mezzanine.mp4")}
          startFrom={0}
          volume={1}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            transform: `scale(${1}, ${1}) translate(${0}px, ${0}px)`
          }}
        />
      </Sequence>
      
      <Sequence from={677} durationInFrames={147}>
        <Video
          src={resolveVideoPath("http://localhost:8080/api/segment/a499d7a7-aa43-43c5-af75-93b2000f8ffe/mezzanine/scene_d7750059-7aa9-4a0a-8933-eeaf00fcad46_mezzanine.mp4")}
          startFrom={0}
          volume={1}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            transform: `scale(${1}, ${1}) translate(${0}px, ${0}px)`
          }}
        />
      </Sequence>
      
      <Sequence from={824} durationInFrames={21}>
        <Video
          src={resolveVideoPath("http://localhost:8080/api/segment/a499d7a7-aa43-43c5-af75-93b2000f8ffe/mezzanine/scene_bd8e8d6c-b74b-4900-9acf-e6d9830601f2_mezzanine.mp4")}
          startFrom={0}
          volume={1}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            transform: `scale(${1}, ${1}) translate(${0}px, ${0}px)`
          }}
        />
      </Sequence>
      
      <Sequence from={845} durationInFrames={22}>
        <Video
          src={resolveVideoPath("http://localhost:8080/api/segment/a499d7a7-aa43-43c5-af75-93b2000f8ffe/mezzanine/scene_d7ab284c-3979-4dc3-8f72-21529daf443c_mezzanine.mp4")}
          startFrom={0}
          volume={1}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            transform: `scale(${1}, ${1}) translate(${0}px, ${0}px)`
          }}
        />
      </Sequence>
      
      <Sequence from={867} durationInFrames={107}>
        <Video
          src={resolveVideoPath("http://localhost:8080/api/segment/a499d7a7-aa43-43c5-af75-93b2000f8ffe/mezzanine/scene_c636ccbe-206e-486c-a570-38b4ed493192_mezzanine.mp4")}
          startFrom={0}
          volume={1}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            transform: `scale(${1}, ${1}) translate(${0}px, ${0}px)`
          }}
        />
      </Sequence>
      
      <Sequence from={974} durationInFrames={8}>
        <Video
          src={resolveVideoPath("http://localhost:8080/api/segment/a499d7a7-aa43-43c5-af75-93b2000f8ffe/mezzanine/scene_32fd090b-42ad-487b-9f40-f4e86069ccc8_mezzanine.mp4")}
          startFrom={0}
          volume={1}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            transform: `scale(${1}, ${1}) translate(${0}px, ${0}px)`
          }}
        />
      </Sequence>
      
      <Sequence from={982} durationInFrames={112}>
        <Video
          src={resolveVideoPath("http://localhost:8080/api/segment/a499d7a7-aa43-43c5-af75-93b2000f8ffe/mezzanine/scene_411a1438-83ae-42f7-974c-a30b5a583d87_mezzanine.mp4")}
          startFrom={0}
          volume={1}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            transform: `scale(${1}, ${1}) translate(${0}px, ${0}px)`
          }}
        />
      </Sequence>
      
      {/* Text/Caption layers */}
      
      <Sequence from={2} durationInFrames={40}>
        <TextOverlay
          text="Misses Griffin, I'm afraid your husband."
          style={{"position":"absolute","bottom":"60px","left":"50%","transform":"translateX(-50%)","width":"80%","maxWidth":"800px","fontSize":28,"color":"#ffffff","fontFamily":"Arial, sans-serif","textAlign":"center","backgroundColor":"rgba(0, 0, 0, 0.8)","padding":"12px 20px","borderRadius":"8px","lineHeight":"1.4","fontWeight":"600","textShadow":"2px 2px 4px rgba(0, 0, 0, 1)","boxShadow":"0 4px 12px rgba(0, 0, 0, 0.5)","border":"1px solid rgba(255, 255, 255, 0.2)"}}
          frame={frame}
        />
      </Sequence>
      
      <Sequence from={189} durationInFrames={150}>
        <TextOverlay
          text="Heading and some body"
          style={{"position":"absolute","left":"660pxpx","top":"388.5pxpx","width":"600","height":"423","fontSize":120,"color":"#ffffff","fontFamily":"Roboto-Bold","textAlign":"center"}}
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

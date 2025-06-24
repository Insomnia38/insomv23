#!/usr/bin/env python3
"""
Test script to create sample transcript data for testing the enhanced subtitle system
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import get_db
from models import VideoTranscript, TranscriptSegment, SceneSubtitle

def create_test_transcript():
    """Create test transcript data for the analysis ID"""
    
    analysis_id = "50a6fef8-72c0-4863-9f9d-8bd07e835fff"
    
    db = next(get_db())
    
    try:
        # Check if transcript already exists
        existing = db.query(VideoTranscript).filter(
            VideoTranscript.analysis_id == analysis_id
        ).first()
        
        if existing:
            print(f"Transcript already exists for analysis {analysis_id}")
            return
        
        # Create main transcript record
        transcript = VideoTranscript(
            analysis_id=analysis_id,
            video_filename="Practice First -- Family Guy #familyguy.mp4",
            video_duration=30.0,  # 30 seconds
            language_code="en-US",
            transcription_method="test_data",
            confidence_score=0.95,
            full_transcript_text="This is a test transcript for Family Guy video. The characters are talking about various topics. This is scene content for testing purposes.",
            processing_time_seconds=5,
            api_response_id="test-transcript-id",
            status="completed"
        )
        
        db.add(transcript)
        db.flush()  # Get the ID
        
        # Create test segments with realistic timing
        test_segments = [
            # Scene 1: 0-6.74s (covers the scene that was being processed)
            {"start": 0.0, "end": 1.5, "text": "This"},
            {"start": 1.5, "end": 2.0, "text": "is"},
            {"start": 2.0, "end": 2.3, "text": "a"},
            {"start": 2.3, "end": 2.8, "text": "test"},
            {"start": 2.8, "end": 3.5, "text": "transcript"},
            {"start": 3.5, "end": 3.8, "text": "for"},
            {"start": 3.8, "end": 4.5, "text": "Family"},
            {"start": 4.5, "end": 4.8, "text": "Guy"},
            {"start": 4.8, "end": 5.2, "text": "video."},
            {"start": 5.2, "end": 5.5, "text": "The"},
            {"start": 5.5, "end": 6.0, "text": "characters"},
            {"start": 6.0, "end": 6.3, "text": "are"},
            {"start": 6.3, "end": 6.74, "text": "talking."},
            
            # Additional segments for other scenes
            {"start": 7.0, "end": 7.5, "text": "About"},
            {"start": 7.5, "end": 8.0, "text": "various"},
            {"start": 8.0, "end": 8.5, "text": "topics."},
            {"start": 9.0, "end": 9.5, "text": "This"},
            {"start": 9.5, "end": 10.0, "text": "is"},
            {"start": 10.0, "end": 10.5, "text": "scene"},
            {"start": 10.5, "end": 11.0, "text": "content"},
            {"start": 11.0, "end": 11.5, "text": "for"},
            {"start": 11.5, "end": 12.0, "text": "testing"},
            {"start": 12.0, "end": 12.5, "text": "purposes."},
            
            # More content to cover 30 seconds
            {"start": 15.0, "end": 15.5, "text": "Additional"},
            {"start": 15.5, "end": 16.0, "text": "dialogue"},
            {"start": 16.0, "end": 16.5, "text": "content"},
            {"start": 16.5, "end": 17.0, "text": "here."},
            {"start": 20.0, "end": 20.5, "text": "More"},
            {"start": 20.5, "end": 21.0, "text": "test"},
            {"start": 21.0, "end": 21.5, "text": "content"},
            {"start": 21.5, "end": 22.0, "text": "continues."},
            {"start": 25.0, "end": 25.5, "text": "Final"},
            {"start": 25.5, "end": 26.0, "text": "test"},
            {"start": 26.0, "end": 26.5, "text": "segment"},
            {"start": 26.5, "end": 27.0, "text": "here."},
        ]
        
        # Add segments to database
        for segment_data in test_segments:
            segment = TranscriptSegment(
                transcript_id=transcript.id,
                start_time=segment_data["start"],
                end_time=segment_data["end"],
                text=segment_data["text"],
                confidence=0.9,
                segment_type="word"
            )
            db.add(segment)
        
        db.commit()
        
        print(f"✅ Created test transcript for analysis {analysis_id}")
        print(f"   - Video duration: {transcript.video_duration}s")
        print(f"   - Segments: {len(test_segments)}")
        print(f"   - Transcript ID: {transcript.id}")
        
        # Test scene subtitle extraction for the scene that was being processed
        scene_start = 3.64
        scene_end = 6.74
        
        scene_segments = db.query(TranscriptSegment).filter(
            TranscriptSegment.transcript_id == transcript.id,
            TranscriptSegment.start_time >= scene_start,
            TranscriptSegment.end_time <= scene_end
        ).order_by(TranscriptSegment.start_time).all()
        
        print(f"\n📝 Scene segments for {scene_start}s-{scene_end}s:")
        for seg in scene_segments:
            print(f"   {seg.start_time}s-{seg.end_time}s: '{seg.text}'")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating test transcript: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_test_transcript()

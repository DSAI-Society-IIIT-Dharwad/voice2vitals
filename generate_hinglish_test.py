"""
generate_hinglish_test.py
=========================
Generates a fast-paced, mixed Hindi-English (Hinglish) consultation test case.

Uses gTTS with different language/accent flags to separate Doctor and Patient:
- Doctor: English (Indian locale: tld='co.in')
- Patient: Hindi (lang='hi')

To simulate "fast speed", we slightly increase the playback rate and minimize pauses.

Output: hinglish_fast_consultation.mp3
"""

import os
import time
import tempfile
from pathlib import Path
from gtts import gTTS
from pydub import AudioSegment

# ---------------------------------------------------------------------------
# Hinglish Conversation Script (Hindi + English Code-switching)
# Format: (speaker, text, lang_config)
# ---------------------------------------------------------------------------
CONVERSATION = [
    ("Doctor",  "Aaiye, please sit down. Tell me, kya problem hai aaj?", {'lang': 'en', 'tld': 'co.in'}),
    ("Patient", "Doctor saab, kal raat se mujhe bohot severe headache ho raha hai, and fever bhi hai.", {'lang': 'hi'}),
    ("Doctor",  "Okay. Temperature check kiya tha aapne? Kitna tha?", {'lang': 'en', 'tld': 'co.in'}),
    ("Patient", "Haan, thermometer mein 101 dikha raha tha. Body ache bhi bohot zyada hai.", {'lang': 'hi'}),
    ("Doctor",  "Any dry cough or sore throat? Gale mein dard hai kya?", {'lang': 'en', 'tld': 'co.in'}),
    ("Patient", "Thoda sour throat hai subah se, but mostly weakness feel ho rahi hai. Kuch khane ka man nahi kar raha.", {'lang': 'hi'}),
    ("Doctor",  "Alright, let me check your pulse and throat. ... Hmm, throat is slightly inflamed. Ye viral pe lag raha hai, maybe seasonal flu.", {'lang': 'en', 'tld': 'co.in'}),
    ("Patient", "Toh koi blood test karwana padega kya doctor?", {'lang': 'hi'}),
    ("Doctor",  "Not right now. If temperature doesn't go down in 48 hours, tab hum Dengue aur CBC check test karenge. Abhi ke liye I am prescribing Paracetamol 650mg SOS.", {'lang': 'en', 'tld': 'co.in'}),
    ("Patient", "Okay. Aur weakness ke liye koi multivitamins?", {'lang': 'hi'}),
    ("Doctor",  "Yes, take one tab of Limcee daily, aur hydration maintain rakhiye. Drink plenty of electral water.", {'lang': 'en', 'tld': 'co.in'}),
    ("Patient", "Theek hai doctor, thank you so much. Kal aana hai wapas?", {'lang': 'hi'}),
    ("Doctor",  "Follow up after three days. Take rest properly, okay?", {'lang': 'en', 'tld': 'co.in'}),
]

# Very short pauses to simulate fast-paced talking
PAUSE_BETWEEN_TURNS_MS = 200

def _generate_turn_audio(text: str, kwargs: dict) -> AudioSegment:
    """Synthesise speech using specific gTTS lang config."""
    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmp:
        tmp_path = tmp.name

    try:
        # Generate with false "slow" to keep baseline normal
        tts = gTTS(text=text, slow=False, **kwargs)
        tts.save(tmp_path)
        segment = AudioSegment.from_mp3(tmp_path)
    finally:
        try:
            os.remove(tmp_path)
        except OSError:
            pass
    return segment

def _speed_up(segment: AudioSegment, speed_factor: float = 1.15) -> AudioSegment:
    """
    Speed up the audio by changing the frame rate.
    Because this also shifts pitch up, we keep it subtle (1.15x to 1.25x).
    """
    new_frame_rate = int(segment.frame_rate * speed_factor)
    fast_audio = segment._spawn(segment.raw_data, overrides={"frame_rate": new_frame_rate})
    return fast_audio.set_frame_rate(segment.frame_rate)

def main():
    print("=" * 60)
    print("  Clinical AI — Fast Hinglish Test Generator")
    print("=" * 60)
    
    output_path = Path("hinglish_fast_consultation.mp3")
    combined = AudioSegment.empty()

    for i, (speaker, text, kwargs) in enumerate(CONVERSATION, 1):
        print(f"  [{i:02d}/{len(CONVERSATION)}] {speaker}: {text[:50]}...")
        
        t0 = time.perf_counter()
        raw = _generate_turn_audio(text, kwargs)
        
        # Apply speedup (Patient slightly faster to differentiate)
        speed = 1.25 if speaker == "Patient" else 1.18
        fast_chunk = _speed_up(raw, speed_factor=speed)
        
        # Add a very short break
        if i > 1:
            combined += AudioSegment.silent(duration=PAUSE_BETWEEN_TURNS_MS)
            
        combined += fast_chunk

    combined.export(str(output_path), format="mp3", bitrate="128k")
    
    total_s = len(combined) / 1000
    print("=" * 60)
    print(f"  [DONE] Total duration : {total_s:.1f}s")
    print(f"  [DONE] Saved to       : {output_path.resolve()}")
    print("\n  To process this mixed-language audio:")
    print(f"    .\\venv\\Scripts\\python.exe clinical_ai_assistant.py {output_path.name}")
    print("=" * 60)

if __name__ == "__main__":
    main()

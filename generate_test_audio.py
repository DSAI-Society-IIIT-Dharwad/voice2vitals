"""
generate_test_audio.py
======================
Generates a realistic doctor-patient conversation MP3 for pipeline testing.

Uses gTTS (Google TTS) to synthesise each speaker turn.
The "Doctor" voice is slightly slowed, the "Patient" voice is normal speed,
giving Whisper + pyannote better cues to distinguish the speakers.

Output: test_consultation.mp3  (in the same directory as this script)

Run:
    .\\venv\\Scripts\\python.exe generate_test_audio.py
"""

import os
import sys
import tempfile
import time
from pathlib import Path

try:
    from gtts import gTTS
except ImportError:
    print("Installing gTTS...")
    os.system(f"{sys.executable} -m pip install gTTS -q")
    from gtts import gTTS

from pydub import AudioSegment

# ---------------------------------------------------------------------------
# Doctor-Patient Conversation Script
# ---------------------------------------------------------------------------
# Format: (speaker, text, speed_factor)
# speed_factor < 1.0 = slower (used to differentiate voices)
CONVERSATION = [
    ("Doctor",  "Good morning. Please come in and have a seat. I'm Doctor Sharma. What brings you in today?",    0.88),
    ("Patient", "Good morning Doctor. I have been feeling really unwell for the past three days. I have a high fever and my throat is very painful.",  1.00),
    ("Doctor",  "I'm sorry to hear that. Can you tell me how high the fever has been? Have you measured it?",   0.88),
    ("Patient", "Yes, it was around 102 degrees Fahrenheit yesterday night. I also have chills and I feel very tired all the time.",  1.00),
    ("Doctor",  "Okay. Any cough, runny nose, or difficulty swallowing?",                                       0.88),
    ("Patient", "Yes, swallowing is quite painful. And I have a mild dry cough. No runny nose though.",          1.00),
    ("Doctor",  "Have you been in contact with anyone who was sick recently?",                                   0.88),
    ("Patient", "Actually yes, my colleague had a similar fever last week.",                                     1.00),
    ("Doctor",  "Alright. Let me examine your throat.",                                                         0.88),
    ("Doctor",  "Your tonsils are quite inflamed and I can see some white patches. This looks like a case of bacterial tonsillitis, possibly streptococcal.",  0.88),
    ("Patient", "Is it serious? Do I need to be hospitalised?",                                                 1.00),
    ("Doctor",  "No, no need for hospitalisation. We will treat this with antibiotics. I am prescribing Amoxicillin 500 milligrams, three times a day for seven days. Also take Paracetamol 650 milligrams every six hours as needed for the fever and pain.", 0.88),
    ("Patient", "Okay Doctor. Are there any side effects I should watch out for?",                              1.00),
    ("Doctor",  "Amoxicillin may cause mild stomach upset. Take it with food to avoid that. If you develop a rash or difficulty breathing, stop immediately and come to the emergency room.", 0.88),
    ("Patient", "Understood. Should I take any throat lozenges or gargles as well?",                           1.00),
    ("Doctor",  "Yes, warm saline gargles three times a day will help reduce the throat swelling. Also drink plenty of fluids and get adequate rest. Avoid cold drinks and ice cream.", 0.88),
    ("Patient", "Alright Doctor. When should I come back for a follow-up?",                                    1.00),
    ("Doctor",  "Come back in seven days to confirm the infection has cleared. If the fever persists beyond 48 hours after starting antibiotics, or if you feel worse, come in immediately.", 0.88),
    ("Patient", "Thank you very much Doctor. I really appreciate it.",                                          1.00),
    ("Doctor",  "Take care and get well soon. The prescription is ready at the front desk.",                   0.88),
]

# Silence between turns (milliseconds)
PAUSE_BETWEEN_TURNS_MS = 600
PAUSE_BETWEEN_SPEAKERS_MS = 900   # longer pause when speaker changes


def _generate_turn_audio(text: str, lang: str = "en") -> AudioSegment:
    """Synthesise speech for a single turn using gTTS → pydub AudioSegment."""
    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmp:
        tmp_path = tmp.name

    try:
        tts = gTTS(text=text, lang=lang, slow=False)
        tts.save(tmp_path)
        segment = AudioSegment.from_mp3(tmp_path)
    finally:
        try:
            os.remove(tmp_path)
        except OSError:
            pass

    return segment


def _change_speed(segment: AudioSegment, speed: float) -> AudioSegment:
    """
    Change playback speed without changing pitch (frame rate trick).
    speed < 1.0 → slower (sounds heavier / authoritative — Doctor)
    speed > 1.0 → faster
    speed = 1.0 → unchanged
    """
    if abs(speed - 1.0) < 0.01:
        return segment
    new_frame_rate = int(segment.frame_rate * speed)
    altered = segment._spawn(segment.raw_data, overrides={"frame_rate": new_frame_rate})
    return altered.set_frame_rate(segment.frame_rate)


def generate_test_conversation(output_path: str = "test_consultation.mp3") -> Path:
    """
    Build the full doctor-patient conversation MP3.

    Returns the Path to the saved file.
    """
    print("=" * 60)
    print("  Clinical AI — Test Audio Generator")
    print("=" * 60)
    print(f"  Turns to synthesise: {len(CONVERSATION)}")
    print(f"  Output             : {output_path}")
    print()

    combined = AudioSegment.empty()
    prev_speaker = None

    for i, (speaker, text, speed) in enumerate(CONVERSATION, 1):
        print(f"  [{i:02d}/{len(CONVERSATION)}] {speaker}: {text[:60]}...")

        t0 = time.perf_counter()
        raw = _generate_turn_audio(text)
        adjusted = _change_speed(raw, speed)
        elapsed = time.perf_counter() - t0

        # Add pause — longer when speaker switches
        if prev_speaker is not None:
            pause_ms = PAUSE_BETWEEN_SPEAKERS_MS if speaker != prev_speaker else PAUSE_BETWEEN_TURNS_MS
            combined += AudioSegment.silent(duration=pause_ms)

        combined += adjusted
        prev_speaker = speaker
        print(f"         -> {len(adjusted) / 1000:.1f}s audio generated in {elapsed:.1f}s")

    # Export final MP3 (Clean)
    out_path_clean = Path(output_path)
    combined.export(str(out_path_clean), format="mp3", bitrate="128k")

    # Generate a Noisy Version (White noise representing HVAC / bad microphone at -20 dBFS)
    # We overlay continuous white noise across the entire conversation.
    try:
        from pydub.generators import WhiteNoise
        noise = WhiteNoise().to_audio_segment(duration=len(combined)).apply_gain(-25) # -25dB background static
        noisy_combined = combined.overlay(noise)
        
        noisy_filename = out_path_clean.stem + "_noisy" + out_path_clean.suffix
        out_path_noisy = out_path_clean.with_name(noisy_filename)
        noisy_combined.export(str(out_path_noisy), format="mp3", bitrate="128k")
        generated_noisy = True
    except Exception as e:
        print(f"Warning: Could not generate noisy version: {e}")
        generated_noisy = False

    total_s = len(combined) / 1000
    print()
    print("=" * 60)
    print(f"  [DONE] Total duration : {total_s:.1f}s ({total_s/60:.1f} min)")
    print(f"  [DONE] Saved (Clean)  : {out_path_clean.name}")
    if generated_noisy:
        print(f"  [DONE] Saved (Noisy)  : {out_path_noisy.name}")
    print()
    print("  To run the full pipeline on these test files:")
    print(f"    .\\venv\\Scripts\\python.exe clinical_ai_assistant.py {out_path_clean.name}")
    if generated_noisy:
        print(f"    .\\venv\\Scripts\\python.exe clinical_ai_assistant.py {out_path_noisy.name}")
    print("=" * 60)
    return out_path_clean


if __name__ == "__main__":
    generate_test_conversation("test_consultation.mp3")

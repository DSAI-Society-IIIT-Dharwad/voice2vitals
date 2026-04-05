"""
clinical_ai_assistant.py
========================
Production-ready Clinical AI Assistant Pipeline
Optimised for NVIDIA RTX 3050 / any CUDA-capable GPU.

Accepted Inputs:
  Audio : .mp3
  Video : .mp4  .mov  .avi  .mkv  .webm  (audio is extracted automatically via ffmpeg)

Pipeline Flow:
  0. [VIDEO ONLY] Extract audio track from video -> temp .mp3   (ffmpeg subprocess)
  1. GPU-accelerated speaker diarization  (pyannote/speaker-diarization-3.1)
  2. Audio slicing per speaker turn       (pydub)
  3. Parallel chunk transcription         (Groq Whisper-large-v3)
  4. Fast context + role correction       (Groq Llama-3-8B   -> JSON)
  5. Clinical prescription generation     (Groq Llama-3-70B  -> JSON)

Setup:
  pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
  pip install pyannote.audio>=3.1.0 pydub>=0.25.1 groq>=0.9.0 pydantic>=2.0.0 python-dotenv soundfile
  # ffmpeg must also be on your PATH:  https://ffmpeg.org/download.html

Environment variables (.env file or shell exports):
  GROQ_API_KEY=<your-groq-key>
  HF_TOKEN=<your-huggingface-token>   # required for pyannote gated models

Usage:
  python clinical_ai_assistant.py conversation.mp3
  python clinical_ai_assistant.py consultation.mp4
  python clinical_ai_assistant.py consultation.mp4 --output-dir ./results
"""

from __future__ import annotations

import json
import logging
import os
import subprocess
import sys
import tempfile
import time
import traceback
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Any
import queue
import threading

import sounddevice as sd
import soundfile as sf

import torch
from groq import Groq
from pydantic import BaseModel, ValidationError
from pydub import AudioSegment
from pyannote.audio import Pipeline as DiarizationPipeline

# ── Optional: load .env automatically if present ──────────────────────────────
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # python-dotenv not installed — rely on shell environment


# =============================================================================
# Logging
# =============================================================================
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  [%(levelname)-8s]  %(name)s — %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("ClinicalAI")


# =============================================================================
# Global Configuration
# =============================================================================
GROQ_API_KEY: str = os.environ.get("GROQ_API_KEY", "")
HF_TOKEN:     str = os.environ.get("HF_TOKEN", "")

DIARIZATION_MODEL: str = "pyannote/speaker-diarization-3.1"
WHISPER_MODEL:     str = "whisper-large-v3"
FAST_LLM:          str = "llama-3.1-8b-instant"      # fast: context correction + role mapping
CLINICAL_LLM:      str = "llama-3.3-70b-versatile"   # deep: clinical prescription generation

# Maximum parallel Groq Whisper threads
# Reduced to 2 to avoid "Connection refused" rate limit errors on regular/free tiers
MAX_WORKERS: int = 2

# Minimum speaker-turn duration worth transcribing (milliseconds)
MIN_CHUNK_MS: int = 400

# Max Whisper API retries per chunk
MAX_RETRIES: int = 3
RETRY_DELAY_S: float = 1.5

# Supported input formats
SUPPORTED_AUDIO_EXTS: frozenset[str] = frozenset({".mp3", ".wav"})
SUPPORTED_VIDEO_EXTS: frozenset[str] = frozenset({".mp4", ".mov", ".avi", ".mkv", ".webm"})
ALL_SUPPORTED_EXTS:   frozenset[str] = SUPPORTED_AUDIO_EXTS | SUPPORTED_VIDEO_EXTS

# Auto-detect GPU; fall back to CPU gracefully
if torch.cuda.is_available():
    DEVICE = torch.device("cuda")
    logger.info(
        "CUDA detected — using GPU: %s (VRAM %.1f GB)",
        torch.cuda.get_device_name(0),
        torch.cuda.get_device_properties(0).total_memory / 1e9,
    )
else:
    DEVICE = torch.device("cpu")
    logger.warning(
        "CUDA not available — falling back to CPU. "
        "Diarization will be significantly slower."
    )


# =============================================================================
# Pydantic Output Schemas
# =============================================================================

class CorrectedTurn(BaseModel):
    role:  str    # "Doctor" | "Patient"
    start: float  # seconds
    end:   float  # seconds
    text:  str    # corrected utterance


class TranscriptCorrection(BaseModel):
    speaker_map:          dict[str, str]      # e.g. {"SPEAKER_00": "Doctor"}
    corrected_transcript: list[CorrectedTurn]


class Medication(BaseModel):
    name:      str   # e.g. "Amoxicillin"
    dosage:    str   # e.g. "500 mg"
    frequency: str   # e.g. "three times daily for 7 days"
    route:     str   # e.g. "oral"


class ClinicalPrescription(BaseModel):
    Chief_Complaint: str
    Symptoms:        list[str]
    Diagnosis:       str
    Medications:     list[Medication]
    Advice:          list[str]
    Follow_Up:       str
    Warnings:        str


# =============================================================================
# Validation Helpers
# =============================================================================

def _validate_env() -> None:
    """Raise early with a clear message if required env vars are missing."""
    missing: list[str] = []
    if not GROQ_API_KEY:
        missing.append("GROQ_API_KEY")
    if not HF_TOKEN:
        missing.append("HF_TOKEN")
    if missing:
        raise EnvironmentError(
            f"Missing required environment variables: {', '.join(missing)}\n"
            "  -> Set them in your shell, OR create a .env file in the same\n"
            "    directory as this script (requires: pip install python-dotenv).\n"
            "  -> HF_TOKEN is your Hugging Face user access token.\n"
            "  -> GROQ_API_KEY is available at https://console.groq.com."
        )


def _validate_input_file(input_path: str) -> Path:
    """
    Ensure the input file exists and is a supported audio or video format.
    Supported audio : .mp3
    Supported video : .mp4  .mov  .avi  .mkv  .webm
    """
    path = Path(input_path).resolve()
    if not path.exists():
        raise FileNotFoundError(f"Input file not found: {path}")
    if path.suffix.lower() not in ALL_SUPPORTED_EXTS:
        raise ValueError(
            f"Unsupported file type: '{path.suffix}'.\n"
            f"  Supported audio : {', '.join(sorted(SUPPORTED_AUDIO_EXTS))}\n"
            f"  Supported video : {', '.join(sorted(SUPPORTED_VIDEO_EXTS))}"
        )
    return path


# =============================================================================
# Step 0 — Extract Audio from Video (ffmpeg)
# =============================================================================

def extract_audio_from_video(video_path: Path, tmp_dir: str) -> Path:
    """
    Use ffmpeg (must be on PATH) to extract the audio track from a video file
    and write it as a 64 kbps mono MP3 into tmp_dir.

    Args:
        video_path : Path to the source video file.
        tmp_dir    : Temporary directory to write the extracted MP3 into.

    Returns:
        Path to the extracted .mp3 file.

    Raises:
        RuntimeError if ffmpeg is not found or returns a non-zero exit code.
    """
    logger.info("--- Step 0: Video Audio Extraction ---")
    logger.info("Input video : %s  (%.1f MB)", video_path.name, video_path.stat().st_size / 1e6)

    output_mp3 = Path(tmp_dir) / (video_path.stem + "_extracted.mp3")

    cmd = [
        "ffmpeg",
        "-y",                    # overwrite output without asking
        "-i", str(video_path),   # input video
        "-vn",                   # drop video stream
        "-acodec", "libmp3lame", # encode to MP3
        "-ab",    "64k",         # 64 kbps is more than enough for speech
        "-ar",    "16000",       # 16 kHz — optimal for Whisper
        "-ac",    "1",           # mono
        str(output_mp3),
    ]

    logger.info("Running ffmpeg: %s", " ".join(cmd))
    t0 = time.perf_counter()

    try:
        result = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=True,           # raises CalledProcessError on non-zero exit
        )
    except FileNotFoundError:
        raise RuntimeError(
            "ffmpeg not found on PATH.\n"
            "Install it from https://ffmpeg.org/download.html and ensure it is in your PATH."
        )
    except subprocess.CalledProcessError as exc:
        stderr_msg = exc.stderr.decode(errors="replace").strip()
        raise RuntimeError(
            f"ffmpeg failed (exit code {exc.returncode}):\n{stderr_msg}"
        ) from exc

    elapsed = time.perf_counter() - t0
    size_mb  = output_mp3.stat().st_size / 1e6
    logger.info(
        "Audio extracted in %.2f s -> '%s' (%.2f MB)",
        elapsed,
        output_mp3.name,
        size_mb,
    )
    return output_mp3


# =============================================================================
# Step 1 — GPU-Accelerated Speaker Diarization
# =============================================================================

def run_diarization(audio_path: Path) -> list[dict[str, Any]]:
    """
    Load pyannote/speaker-diarization-3.1, push it to GPU, and run inference.

    Returns:
        A chronologically sorted list of speaker turns:
        [{"speaker": "SPEAKER_00", "start": 0.0, "end": 3.5}, ...]
    """
    logger.info("--- Step 1: Diarization ---")
    logger.info("Loading pyannote pipeline (model=%s) onto device=%s...", DIARIZATION_MODEL, DEVICE)

    t0 = time.perf_counter()
    pipeline = DiarizationPipeline.from_pretrained(
        DIARIZATION_MODEL,
        use_auth_token=HF_TOKEN
    )
    pipeline.to(DEVICE)
    logger.info("Pipeline loaded in %.2f s", time.perf_counter() - t0)

    logger.info("Running diarization on '%s' …", audio_path.name)
    t1 = time.perf_counter()
    diarization = pipeline(str(audio_path))
    elapsed = time.perf_counter() - t1
    logger.info("Diarization inference completed in %.2f s", elapsed)

    turns: list[dict[str, Any]] = []
    for segment, _, speaker in diarization.itertracks(yield_label=True):
        turns.append(
            {
                "speaker": speaker,
                "start":   round(segment.start, 3),
                "end":     round(segment.end,   3),
            }
        )

    turns.sort(key=lambda t: t["start"])

    # Summarise unique speakers found
    unique_speakers = sorted({t["speaker"] for t in turns})
    logger.info(
        "Diarization complete: %d turns, %d unique speaker(s): %s",
        len(turns),
        len(unique_speakers),
        unique_speakers,
    )
    return turns


# =============================================================================
# Step 2 — Slice Audio Per Speaker Turn (pydub)
# =============================================================================

def slice_audio_chunks(
    audio_path: Path,
    turns: list[dict[str, Any]],
    tmp_dir: str,
) -> list[dict[str, Any]]:
    """
    Slice the full MP3 into per-turn .mp3 chunks and write them to tmp_dir.

    Short turns (< MIN_CHUNK_MS) are skipped to avoid wasting API calls on
    silence or near-silence segments.

    Returns:
        Augmented turn dicts with "chunk_index" and "chunk_path" keys.
    """
    logger.info("--- Step 2: Audio Slicing ---")
    logger.info("Loading full audio: '%s'...", audio_path.name)
    audio: AudioSegment = AudioSegment.from_mp3(str(audio_path))
    total_duration_s = len(audio) / 1000
    logger.info("Audio duration: %.1f s", total_duration_s)

    chunks: list[dict[str, Any]] = []
    skipped = 0

    for idx, turn in enumerate(turns):
        start_ms  = int(turn["start"] * 1000)
        end_ms    = int(turn["end"]   * 1000)
        dur_ms    = end_ms - start_ms

        if dur_ms < MIN_CHUNK_MS:
            logger.debug("Skipping turn %d (%d ms - below threshold).", idx, dur_ms)
            skipped += 1
            continue

        # Clamp to actual audio length to avoid pydub warnings
        end_ms = min(end_ms, len(audio))

        chunk: AudioSegment = audio[start_ms:end_ms]
        chunk_path = os.path.join(tmp_dir, f"chunk_{idx:05d}.mp3")
        chunk.export(chunk_path, format="mp3", bitrate="64k")

        chunks.append(
            {
                **turn,
                "chunk_index": idx,
                "chunk_path":  chunk_path,
                "duration_ms": dur_ms,
            }
        )

    logger.info(
        "Sliced %d usable chunks (skipped %d short turns) → '%s'",
        len(chunks),
        skipped,
        tmp_dir,
    )
    return chunks


# =============================================================================
# Step 3 — Parallel Transcription via Groq Whisper-large-v3
# =============================================================================

def _transcribe_single_chunk(chunk: dict[str, Any], groq_client: Groq) -> dict[str, Any]:
    """
    Transcribe one audio chunk with Groq Whisper.

    • Retries up to MAX_RETRIES times on transient errors.
    • Always deletes the local chunk file in the `finally` block -
      whether transcription succeeded, failed, or raised.
    """
    chunk_path: str = chunk["chunk_path"]
    idx:        int = chunk["chunk_index"]
    transcript: str = ""

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            with open(chunk_path, "rb") as audio_file:
                response = groq_client.audio.transcriptions.create(
                    model=WHISPER_MODEL,
                    file=audio_file,
                    response_format="text",
                    language="en",
                )
            # Groq may return a plain string or an object with .text
            raw: str = response if isinstance(response, str) else getattr(response, "text", "")
            transcript = raw.strip()
            logger.debug(
                "Chunk %d transcribed (attempt %d): '%s …'",
                idx,
                attempt,
                transcript[:60],
            )
            break  # success — exit retry loop

        except Exception as exc:  # noqa: BLE001
            logger.warning(
                "Chunk %d transcription attempt %d/%d failed: %s",
                idx, attempt, MAX_RETRIES, exc,
            )
            if attempt < MAX_RETRIES:
                time.sleep(RETRY_DELAY_S * attempt)  # exponential back-off
            else:
                logger.error("Chunk %d failed all %d attempts — skipping.", idx, MAX_RETRIES)

    # --- Always clean up the temp file ---
    try:
        os.remove(chunk_path)
        logger.debug("Deleted temp chunk: %s", chunk_path)
    except OSError as err:
        logger.warning("Could not delete chunk file '%s': %s", chunk_path, err)

    return {**chunk, "transcript": transcript}


def transcribe_chunks_parallel(
    chunks: list[dict[str, Any]],
    groq_client: Groq,
) -> list[dict[str, Any]]:
    """
    Dispatch all chunks to Groq Whisper concurrently via ThreadPoolExecutor.

    Results are re-sorted chronologically by speaker-turn start time so the
    assembled transcript is always in conversation order, regardless of thread
    completion order.
    """
    logger.info("--- Step 3: Parallel Transcription ---")
    logger.info(
        "Sending %d chunks to Groq Whisper in parallel (max_workers=%d)...",
        len(chunks),
        MAX_WORKERS,
    )
    t0 = time.perf_counter()

    # Pre-allocate results list — preserves slot even if a thread crashes
    results: list[dict[str, Any] | None] = [None] * len(chunks)

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        future_to_slot = {
            executor.submit(_transcribe_single_chunk, chunk, groq_client): i
            for i, chunk in enumerate(chunks)
        }
        done = 0
        for future in as_completed(future_to_slot):
            slot = future_to_slot[future]
            try:
                results[slot] = future.result()
            except Exception as exc:  # noqa: BLE001
                logger.error(
                    "Transcription thread %d raised an unhandled exception: %s", slot, exc
                )
                results[slot] = {**chunks[slot], "transcript": ""}
            done += 1
            logger.info("  … %d / %d chunks done", done, len(chunks))

    elapsed = time.perf_counter() - t0
    logger.info("Transcription completed in %.2f s", elapsed)

    # Drop any None slots (safety net — should not occur)
    transcribed: list[dict[str, Any]] = [r for r in results if r is not None]

    # Sort chronologically
    transcribed.sort(key=lambda t: t["start"])
    return transcribed


def build_raw_transcript_text(transcribed_chunks: list[dict[str, Any]]) -> str:
    """
    Format transcribed chunks as a human-readable raw transcript string.

    Example line:
        [SPEAKER_00 | 0.00s – 4.30s]: Good morning, how can I help you?
    """
    lines: list[str] = []
    for chunk in transcribed_chunks:
        text = chunk.get("transcript", "").strip()
        if text:
            lines.append(
                f"[{chunk['speaker']} | {chunk['start']:.2f}s – {chunk['end']:.2f}s]: {text}"
            )
    return "\n".join(lines)


# =============================================================================
# Step 4 — Fast Role Mapping (Llama 3 8B)
# =============================================================================

_CONTEXT_CORRECTION_SYSTEM = """\
You are a highly experienced clinical medical transcription specialist.
You receive a raw, auto-generated, diarized transcript of a real doctor-patient consultation.
Speaker labels are generic (SPEAKER_00, SPEAKER_01, etc.).

Your task:
Analyze the content and speech patterns of each speaker to determine which label is the
"Doctor" and which is the "Patient". There may be more than two speakers; assign each a role
(e.g., "Doctor", "Patient", "Nurse", "Relative").

Output ONLY a single, valid JSON object. No markdown. No code fences. No explanations.

Strict output schema (do not deviate):
{
  "speaker_map": {
    "<SPEAKER_ID>": "Doctor" | "Patient" | "Nurse" | "Relative"
  }
}
"""

class RoleMapping(BaseModel):
    speaker_map: dict[str, str]


def correct_transcript_fast(
    raw_transcript: str,
    groq_client: Groq,
    transcribed_chunks: list[dict[str, Any]],
) -> TranscriptCorrection:
    """
    Use Groq Llama 3 8B to:
      • Map generic speaker IDs to Doctor / Patient roles.
    
    The raw text is preserved without asking the LLM to rewrite it, avoiding
    excessive token usage and context window limits.
    Returns a validated TranscriptCorrection Pydantic model.
    """
    logger.info("--- Step 4: Role Mapping (Llama 3.1 8B) ---")
    logger.info("Sending transcript snippet to '%s' for role assignment...", FAST_LLM)
    t0 = time.perf_counter()

    # We only need a small part of the transcript to figure out who is who.
    # Limit to ~2000 characters to strictly avoid TPM (Tokens Per Minute) limits
    # on free or on-demand tiers (e.g. Groq 6000 TPM limit).
    snippet = raw_transcript[:2000]
    if len(raw_transcript) > 2000 and "\n" in snippet:
        snippet = snippet.rsplit("\n", 1)[0]

    user_message = (
        "Below is a snippet of a raw diarized transcript of a doctor-patient consultation.\n"
        "Return the speaker_map JSON as instructed:\n\n"
        + snippet
    )

    try:
        response = groq_client.chat.completions.create(
            model=FAST_LLM,
            messages=[
                {"role": "system",  "content": _CONTEXT_CORRECTION_SYSTEM},
                {"role": "user",    "content": user_message},
            ],
            temperature=0.1,
            max_tokens=256,
            response_format={"type": "json_object"},
        )
        raw_json: str = response.choices[0].message.content.strip()
        role_mapping = RoleMapping.model_validate_json(raw_json)

        # Build the final corrected transcript locally
        corrected_turns = []
        for chunk in transcribed_chunks:
            spk = chunk["speaker"]
            role = role_mapping.speaker_map.get(spk, "Unknown")
            corrected_turns.append(
                CorrectedTurn(
                    role=role,
                    start=chunk["start"],
                    end=chunk["end"],
                    text=chunk.get("transcript", ""),
                )
            )

        parsed = TranscriptCorrection(
            speaker_map=role_mapping.speaker_map,
            corrected_transcript=corrected_turns,
        )

        elapsed = time.perf_counter() - t0
        logger.info(
            "Role mapping complete in %.2f s. Speaker map: %s",
            elapsed,
            parsed.speaker_map,
        )
        return parsed

    except ValidationError as exc:
        logger.error("RoleMapping schema validation failed:\n%s", exc)
        raise
    except json.JSONDecodeError as exc:
        logger.error("Llama 3 8B returned malformed JSON: %s", exc)
        raise
    except Exception as exc:
        logger.error("Role mapping API call failed: %s", exc)
        raise

# =============================================================================
# Step 5 — Clinical Prescription Generation (Llama 3 70B)
# =============================================================================

_CLINICAL_SYSTEM = """\
You are a board-certified senior physician AI assistant specialising in clinical documentation.
You receive a corrected, role-assigned transcript of a doctor-patient consultation.

Your task:
Perform deep clinical reasoning on the entire conversation and produce a comprehensive,
structured medical prescription / clinical note.

Output ONLY a single, valid JSON object. No markdown. No code fences. No commentary.

Strict output schema (all fields are required; use "Not specified" for fields that cannot
be inferred from the conversation):
{
  "Chief_Complaint": "<primary reason for this visit — 1-2 clear sentences>",
  "Symptoms": [
    "<symptom 1>",
    "<symptom 2>"
  ],
  "Diagnosis": "<precise clinical diagnosis; include ICD-10 code if inferable>",
  "Medications": [
    {
      "name":      "<EXACT brand or generic drug name as spoken, do NOT generalize (e.g. 'Limcee' not 'multivitamin')>",
      "dosage":    "<exact dosage if stated, e.g. 500 mg>",
      "frequency": "<frequency + duration, e.g. twice daily for 7 days>",
      "route":     "<route of administration, e.g. oral>"
    }
  ],
  "Advice": [
    "<clinical/lifestyle advice 1>",
    "<clinical/lifestyle advice 2>"
  ],
  "Follow_Up": "<specific follow-up recommendation, or 'Not specified'>",
  "Warnings":  "<drug interactions, allergy alerts, contraindications, or 'None noted'>"
}
"""


def generate_clinical_prescription(
    corrected_data: TranscriptCorrection,
    groq_client: Groq,
) -> ClinicalPrescription:
    """
    Use Groq Llama 3 70B to produce a fully structured clinical prescription
    from the role-assigned, corrected transcript.

    Returns a validated ClinicalPrescription Pydantic model.
    """
    logger.info("--- Step 5: Clinical Prescription (Llama 3.3 70B) ---")
    logger.info("Sending corrected transcript to '%s' for clinical reasoning...", CLINICAL_LLM)
    t0 = time.perf_counter()

    # Format the turns into a readable dialogue block for the model
    dialogue = "\n".join(
        f"{turn.role} [{turn.start:.2f}s – {turn.end:.2f}s]: {turn.text}"
        for turn in corrected_data.corrected_transcript
    )

    user_message = (
        "Analyse the following doctor-patient consultation and generate the structured "
        "clinical prescription JSON as instructed:\n\n"
        + dialogue
    )

    try:
        response = groq_client.chat.completions.create(
            model=CLINICAL_LLM,
            messages=[
                {"role": "system", "content": _CLINICAL_SYSTEM},
                {"role": "user",   "content": user_message},
            ],
            temperature=0.2,
            max_tokens=2048,
            response_format={"type": "json_object"},
        )
        raw_json: str = response.choices[0].message.content.strip()
        prescription = ClinicalPrescription.model_validate_json(raw_json)

        elapsed = time.perf_counter() - t0
        logger.info("Clinical prescription generated in %.2f s.", elapsed)
        return prescription

    except ValidationError as exc:
        logger.error("ClinicalPrescription schema validation failed:\n%s", exc)
        raise
    except json.JSONDecodeError as exc:
        logger.error("Llama 3 70B returned malformed JSON: %s", exc)
        raise
    except Exception as exc:
        logger.error("Clinical prescription API call failed: %s", exc)
        raise


# =============================================================================
# Pipeline Orchestrator
# =============================================================================

def process_clinical_audio(
    input_path: str,
    output_dir: str | None = None,
) -> dict[str, Any]:
    """
    End-to-end clinical AI pipeline.
    Accepts both audio (.mp3) and video (.mp4 .mov .avi .mkv .webm) inputs.
    For video inputs, audio is extracted automatically via ffmpeg (Step 0).

    Args:
        input_path:  Path to the doctor-patient conversation file (audio or video).
        output_dir:  Optional directory to save the JSON output file.
                     Defaults to the same directory as the input file.

    Returns:
        {
            "input_type":    "audio" | "video",
            "raw_transcript": <str>,
            "corrected_data": <dict>,   # TranscriptCorrection
            "prescription":  <dict>,    # ClinicalPrescription
            "timings":       <dict>,    # per-step wall-clock seconds
        }
    """
    pipeline_start = time.perf_counter()

    _validate_env()
    input_file = _validate_input_file(input_path)
    is_video   = input_file.suffix.lower() in SUPPORTED_VIDEO_EXTS

    banner = "=" * 64
    logger.info(banner)
    logger.info("  Clinical AI Assistant  —  Pipeline Start")
    logger.info("  Input  : %s  [%s]", input_file, "VIDEO" if is_video else "AUDIO")
    logger.info("  Device : %s", DEVICE)
    logger.info(banner)

    groq_client = Groq(api_key=GROQ_API_KEY)
    timings: dict[str, float] = {}

    # We may need a persistent temp dir for the entire pipeline when video
    # extraction produces an intermediate MP3 that must outlive Step 0.
    outer_tmp = tempfile.mkdtemp(prefix="clinical_video_")

    try:
        # --- Step 0: Video -> Audio (only for video inputs) ---
        if is_video:
            t = time.perf_counter()
            audio_file = extract_audio_from_video(input_file, outer_tmp)
            timings["video_extraction_s"] = round(time.perf_counter() - t, 2)
        else:
            audio_file = input_file

        # --- Step 1: Diarization ---
        t = time.perf_counter()
        turns = run_diarization(audio_file)
        timings["diarization_s"] = round(time.perf_counter() - t, 2)

        if not turns:
            raise RuntimeError(
                "Diarization produced zero speaker turns.\n"
                "Check that the audio file contains audible speech and is not corrupt."
            )

        # Use a nested temp dir for chunks (inner); outer_tmp holds the extracted MP3 if video.
        with tempfile.TemporaryDirectory(prefix="clinical_chunks_") as tmp_dir:

            # --- Step 2: Audio Slicing ---
            t = time.perf_counter()
            chunks = slice_audio_chunks(audio_file, turns, tmp_dir)
            timings["slicing_s"] = round(time.perf_counter() - t, 2)

            if not chunks:
                raise RuntimeError(
                    f"No usable audio chunks after slicing.\n"
                    f"All {len(turns)} speaker turns are shorter than MIN_CHUNK_MS={MIN_CHUNK_MS} ms."
                )

            # --- Step 3: Parallel Whisper Transcription ---
            t = time.perf_counter()
            transcribed_chunks = transcribe_chunks_parallel(chunks, groq_client)
            timings["transcription_s"] = round(time.perf_counter() - t, 2)

        # inner tmp_dir deleted; per-thread cleanup already removed individual chunk files.

    finally:
        # Always clean up the outer temp dir (holds extracted MP3 for video inputs)
        import shutil
        shutil.rmtree(outer_tmp, ignore_errors=True)
        logger.debug("Cleaned up outer temp directory: %s", outer_tmp)

    raw_transcript = build_raw_transcript_text(transcribed_chunks)

    if not raw_transcript.strip():
        raise RuntimeError(
            "Transcription produced an empty result.\n"
            "Groq Whisper may not have recognised any speech in the audio/video."
        )

    logger.info("\n--- RAW TRANSCRIPT ---")
    for line in raw_transcript.splitlines():
        logger.info("| %s", line)
    logger.info("----------------------\n")

    # --- Step 4: Fast Role Mapping (Llama 3.1 8B) ---
    t = time.perf_counter()
    corrected_data = correct_transcript_fast(raw_transcript, groq_client, transcribed_chunks)
    timings["correction_s"] = round(time.perf_counter() - t, 2)

    # --- Step 5: Clinical Prescription (Llama 3.3 70B) ---
    t = time.perf_counter()
    prescription = generate_clinical_prescription(corrected_data, groq_client)
    timings["prescription_s"] = round(time.perf_counter() - t, 2)

    timings["total_s"] = round(time.perf_counter() - pipeline_start, 2)

    logger.info(banner)
    logger.info("  Pipeline complete in %.2f s", timings["total_s"])
    extraction_note = (
        f"video extraction: {timings.get('video_extraction_s', 0):.2f}s | "
        if is_video else ""
    )
    logger.info(
        "  Breakdown -> %sdiarization: %.2fs | slicing: %.2fs | "
        "transcription: %.2fs | correction: %.2fs | prescription: %.2fs",
        extraction_note,
        timings["diarization_s"],
        timings["slicing_s"],
        timings["transcription_s"],
        timings["correction_s"],
        timings["prescription_s"],
    )
    logger.info(banner)

    result: dict[str, Any] = {
        "input_type":     "video" if is_video else "audio",
        "raw_transcript": raw_transcript,
        "corrected_data": corrected_data.model_dump(),
        "prescription":   prescription.model_dump(),
        "timings":        timings,
    }

    # --- Save JSON output ---
    out_dir = Path(output_dir) if output_dir else input_file.parent
    out_dir.mkdir(parents=True, exist_ok=True)
    output_path = out_dir / (input_file.stem + "_clinical_output.json")

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    logger.info("Full output saved -> %s", output_path)
    return result


# =============================================================================
# Pretty Printer
# =============================================================================

def _print_prescription(prescription: dict[str, Any], timings: dict[str, float]) -> None:
    """Render the final prescription and timing summary to stdout."""
    sep   = "═" * 64
    thin  = "─" * 64

    print(f"\n{sep}")
    print("  ██████╗ ██╗  ██╗")
    print("  ██╔══██╗╚██╗██╔╝  CLINICAL PRESCRIPTION")
    print("  ██████╔╝ ╚███╔╝   Clinical AI Assistant")
    print("  ██╔══██╗ ██╔██╗")
    print("  ██║  ██║██╔╝ ██╗")
    print("  ╚═╝  ╚═╝╚═╝  ╚═╝")
    print(sep)

    print(f"\n  Chief Complaint : {prescription.get('Chief_Complaint', 'N/A')}")
    print(f"  Diagnosis       : {prescription.get('Diagnosis', 'N/A')}")

    symptoms = prescription.get("Symptoms", [])
    if symptoms:
        print(f"\n  Symptoms:")
        for s in symptoms:
            print(f"    * {s}")

    meds = prescription.get("Medications", [])
    if meds:
        print(f"\n  Medications:")
        for m in meds:
            if isinstance(m, dict):
                print(
                    f"    * {m.get('name', '?')}  {m.get('dosage', '')}  "
                    f"- {m.get('frequency', '')}  [{m.get('route', '')}]"
                )

    advice = prescription.get("Advice", [])
    if advice:
        print(f"\n  Advice:")
        for a in advice:
            print(f"    * {a}")

    print(f"\n  Follow-Up : {prescription.get('Follow_Up', 'Not specified')}")
    print(f"  Warnings  : {prescription.get('Warnings', 'None noted')}")

    print(f"\n{thin}")
    video_note = (
        f"video_extract={timings.get('video_extraction_s', '?')}s  |  "
        if timings.get('video_extraction_s') else ""
    )
    print(
        f"  Timing  total={timings.get('total_s', '?')}s  |  "
        f"{video_note}"
        f"diarization={timings.get('diarization_s', '?')}s  |  "
        f"transcription={timings.get('transcription_s', '?')}s  |  "
        f"LLM={timings.get('correction_s', 0) + timings.get('prescription_s', 0):.2f}s"
    )
    print(sep)


# =============================================================================
# Live Recording
# =============================================================================

def record_audio(filepath: str, sample_rate: int = 16000) -> None:
    """
    Record streaming audio from the default microphone until the user presses Enter.
    Writes the data incrementally to a .wav file.
    """
    q_data: queue.Queue = queue.Queue()

    def callback(indata: Any, frames: int, time: Any, status: Any) -> None:
        """This is called by sounddevice for each audio block."""
        if status:
            sys.stderr.write(str(status) + "\n")
        q_data.put(indata.copy())
    
    print("\n   [LIVE RECORDING READY]")
    input("   --> Press [ENTER] to START recording...")
    print("   --> Recording started. Speak into your microphone.")
    print("   --> Press [ENTER] again to STOP recording...")
    
    stop_event = threading.Event()
    def _wait_for_stop():
        input()
        stop_event.set()
        
    threading.Thread(target=_wait_for_stop, daemon=True).start()
    
    try:
        with sf.SoundFile(filepath, mode="w", samplerate=sample_rate, channels=1, subtype="PCM_16") as file:
            with sd.InputStream(samplerate=sample_rate, channels=1, callback=callback):
                while not stop_event.is_set():
                    while not q_data.empty():
                        file.write(q_data.get())
                # Drain queue after stopping
                while not q_data.empty():
                    file.write(q_data.get())
    except KeyboardInterrupt:
        print("\n   --> Recording stopped by KeyboardInterrupt.")
        stop_event.set()

    print(f"   [RECORDING SAVED] -> {filepath}\n")


# =============================================================================
# CLI Entry-Point
# =============================================================================

def _parse_args() -> tuple[str | None, str | None, bool]:
    """Minimal CLI argument parsing without external dependencies."""
    args = sys.argv[1:]
    if "-h" in args or "--help" in args:
        print(__doc__)
        sys.exit(0)

    output_dir: str | None = None
    if "--output-dir" in args:
        idx = args.index("--output-dir")
        if idx + 1 < len(args):
            output_dir = args[idx + 1]
            # Remove --output-dir and its value from args so they aren't parsed as input path
            args.pop(idx)
            args.pop(idx)
        else:
            print("ERROR: --output-dir requires a path argument.")
            sys.exit(1)

    record_mode = False
    if "--record" in args:
        record_mode = True
        args.remove("--record")

    input_path: str | None = args[0] if args else None

    if not record_mode and not input_path:
        print("ERROR: Must provide either an <input_file> or the --record flag.")
        print("Run with --help for usage details.")
        sys.exit(1)

    return input_path, output_dir, record_mode


if __name__ == "__main__":
    input_file_arg, out_dir, use_recording = _parse_args()

    try:
        # --- Handle Live Recording ---
        recording_tmp_dir: tempfile.TemporaryDirectory | None = None
        
        if use_recording:
            # We store the live audio in a temporary directory
            recording_tmp_dir = tempfile.TemporaryDirectory(prefix="clinical_live_")
            live_path = os.path.join(recording_tmp_dir.name, "live_recording.wav")
            record_audio(live_path)
            input_file_arg = live_path

        # --- Process Pipeline ---
        result = process_clinical_audio(input_file_arg, output_dir=out_dir)
        _print_prescription(result["prescription"], result["timings"])

    except EnvironmentError as e:
        logger.critical("Environment configuration error:\n%s", e)
        sys.exit(2)
    except FileNotFoundError as e:
        logger.critical("File not found: %s", e)
        sys.exit(3)
    except RuntimeError as e:
        logger.critical("Pipeline runtime error: %s", e)
        sys.exit(4)
    except Exception:  # noqa: BLE001
        logger.critical("Unexpected pipeline failure:\n%s", traceback.format_exc())
        sys.exit(5)
    finally:
        # Clean up live recording temp dir if we used it
        if 'recording_tmp_dir' in locals() and recording_tmp_dir is not None:
            recording_tmp_dir.cleanup()
            logger.debug("Cleaned up live recording temporary directory.")


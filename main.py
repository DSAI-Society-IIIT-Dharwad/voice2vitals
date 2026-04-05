import os
import tempfile
from contextlib import asynccontextmanager
from typing import Dict, Any
from fastapi import FastAPI, UploadFile, File, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from pydantic import BaseModel

# Import our production AI pipeline
from clinical_ai_assistant import process_clinical_audio
from dotenv import load_dotenv

# Load all variables from .env
load_dotenv()

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing Supabase credentials in .env file")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup - ping supabase or set anything up here
    yield
    # Cleanup
    pass

app = FastAPI(title="Voice2Vitals Clinical API", lifespan=lifespan)

# Allow React app to communicate with API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev. Specifically restrict this in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def background_audio_processing(consultation_id: str, file_path: str, file_type: str):
    """
    Runs the heavy process_clinical_audio natively, then uploads the result to Supabase.
    """
    try:
        # 1. Update status to processing
        supabase.table("consultations").update({"status": "processing"}).eq("id", consultation_id).execute()

        # 2. Run AI pipeline (Takes time, done on GPU if available)
        result = process_clinical_audio(input_path=file_path)

        # 3. Insert Transcript data into Supabase
        # We will extract it from the result mapping
        transcript_data = {
            "consultation_id": consultation_id,
            "raw_text": result.get("raw_transcript", ""),
            "structured_data": result.get("corrected_data", {})
        }
        supabase.table("transcripts").insert(transcript_data).execute()

        # 4. Insert Prescription / Extracted Entities into Supabase
        prescription = result.get("prescription", {})
        prescription_data = {
            "consultation_id": consultation_id,
            "patient_name": prescription.get("Patient_Name"),
            "diagnosis": prescription.get("Diagnosis"),
            "full_json": prescription
        }
        supabase.table("prescriptions").insert(prescription_data).execute()

        # 5. Update Consultation to completed
        supabase.table("consultations").update({"status": "completed"}).eq("id", consultation_id).execute()

    except Exception as e:
        print(f"Error processing audio for {consultation_id}: {e}")
        supabase.table("consultations").update({"status": "failed"}).eq("id", consultation_id).execute()

    finally:
        # Clean up temporary file that was uploaded
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception as cleanup_error:
                print(f"Could not delete temp file {file_path}: {cleanup_error}")

@app.post("/api/consultations/upload")
async def upload_audio(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    """
    Accepts an audio file upload, creates a pending consultation record,
    and dispatches pipeline processing to the background.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing file name")
        
    ext = os.path.splitext(file.filename)[1]
    
    # Create DB entry for this consultation
    new_consultation = {
        "status": "pending",
        "file_name": file.filename
    }
    
    try:
        db_res = supabase.table("consultations").insert(new_consultation).execute()
        consultation_data = db_res.data[0]
        consultation_id = consultation_data["id"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    # Write file to disk temporarily for the python script to pick it up
    temp_dir = tempfile.gettempdir()
    temp_file_path = os.path.join(temp_dir, f"consultation_{consultation_id}{ext}")
    
    with open(temp_file_path, "wb") as f:
        f.write(await file.read())

    # Dispatch to background task
    background_tasks.add_task(background_audio_processing, consultation_id, temp_file_path, ext)

    return {
        "message": "Upload successful. Processing started.",
        "consultation_id": consultation_id,
        "status": "pending"
    }

@app.get("/api/consultations/status/{consultation_id}")
def get_consultation_status(consultation_id: str):
    """
    Poll this endpoint / Or poll Supabase directly from frontend
    to get the status and result if finished.
    """
    res = supabase.table("consultations").select("*, transcripts(*), prescriptions(*)").eq("id", consultation_id).execute()
    
    if len(res.data) == 0:
        raise HTTPException(status_code=404, detail="Consultation not found")
        
    return res.data[0]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

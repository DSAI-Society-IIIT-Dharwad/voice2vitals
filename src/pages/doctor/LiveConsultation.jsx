import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, PhoneOff, UploadCloud, Square } from 'lucide-react';
import TranscriptBlock from '../../components/shared/TranscriptBlock';
import ExtractionPanel from '../../components/shared/ExtractionPanel';
import { mockTranscript, mockFieldsMedic } from '../../mock/data';
import axios from 'axios';

export default function DoctorLiveConsultation() {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [status, setStatus] = useState('Ready');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);

  // Stop recording cleanup
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setStatus('Recording...');
      
      timerIntervalRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setStatus('Microphone access denied');
    }
  };

  const stopAndUpload = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setStatus('Uploading and Processing...');
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('file', audioBlob, 'consultation_audio.webm');

        try {
          const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/consultations/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          
          console.log('Upload success:', res.data);
          // Navigate to the review page, passing the consultation id
          navigate(`/doctor/report/${res.data.consultation_id}/review`);
          
        } catch (error) {
          console.error('Upload failed:', error);
          setStatus('Upload Failed');
        }
      };
      
      // Stop all tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="animate-fade-in flex flex-col h-full gap-4">
      <div className="flex justify-between items-center card">
        <div>
          <h2 className="font-semibold text-lg">Consultation: John Doe</h2>
          <div className="text-sm text-secondary">{status}</div>
        </div>
        <div className="font-mono text-xl flex items-center gap-4">
          <span className={isRecording ? 'text-danger animate-pulse' : ''}>
             {formatTime(timer)}
          </span>
          {!isRecording && timer === 0 && (
             <button onClick={startRecording} className="btn-primary flex items-center gap-2">
               <Mic size={18} /> Start
             </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 flex gap-6 overflow-hidden">
        <div className="flex-1 card flex flex-col">
          <h3 className="font-semibold mb-4">Live Transcript (Mock waiting for AI)</h3>
          <div className="flex-1 opacity-50"><TranscriptBlock segments={mockTranscript} /></div>
          <div className="mt-4 flex justify-center gap-4 pt-4 border-t">
             {isRecording && (
                <button onClick={stopAndUpload} className="btn-primary bg-danger text-white flex gap-2 items-center">
                   <Square size={18}/> Stop & Process AI
                </button>
             )}
          </div>
        </div>
        
        <div className="w-[30%] card flex flex-col">
          <h3 className="font-semibold mb-4 text-primary">Live Extracted Data (Mock)</h3>
          <div className="flex-1 overflow-auto opacity-50">
             <ExtractionPanel fields={mockFieldsMedic} />
          </div>
        </div>
      </div>
    </div>
  );
}
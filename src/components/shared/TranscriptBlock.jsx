
import './Components.css';

export default function TranscriptBlock({ segments }) {
  return (
    <div className="transcript-container">
      {segments.map((seg, i) => (
        <div key={i} className={`chat-bubble ${seg.speaker === 'Patient' || seg.speaker === 'Customer' ? 'bubble-right' : 'bubble-left'}`}>
          <div className="speaker-name">{seg.speaker}</div>
          <div className="bubble-text">{seg.text}</div>
        </div>
      ))}
    </div>
  );
}

import './Components.css';

export default function ExtractionPanel({ fields }) {
  return (
    <div className="extraction-container">
      {Object.entries(fields).map(([key, value]) => (
        <div key={key} className="field-group">
          <label className="field-label">{key.replace(/([A-Z])/g, ' $1').trim().toUpperCase()}</label>
          <div className="field-value">
            {Array.isArray(value) ? value.join(', ') : value}
          </div>
        </div>
      ))}
    </div>
  );
}
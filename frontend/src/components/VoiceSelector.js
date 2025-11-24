import React from 'react';
import './VoiceSelector.css';

const VOICES = [
  { id: 'idera', name: 'Idera', description: 'Melodic, gentle' },
  { id: 'emma', name: 'Emma', description: 'Authoritative, deep' },
  { id: 'zainab', name: 'Zainab', description: 'Soothing, gentle' },
  { id: 'osagie', name: 'Osagie', description: 'Smooth, calm' },
  { id: 'wura', name: 'Wura', description: 'Young, sweet' },
  { id: 'jude', name: 'Jude', description: 'Warm, confident' },
  { id: 'chinenye', name: 'Chinenye', description: 'Engaging, warm' },
  { id: 'tayo', name: 'Tayo', description: 'Upbeat, energetic' },
  { id: 'regina', name: 'Regina', description: 'Mature, warm' },
  { id: 'femi', name: 'Femi', description: 'Rich, reassuring' },
  { id: 'adaora', name: 'Adaora', description: 'Warm, engaging' },
  { id: 'umar', name: 'Umar', description: 'Calm, smooth' },
  { id: 'mary', name: 'Mary', description: 'Energetic, youthful' },
  { id: 'nonso', name: 'Nonso', description: 'Bold, resonant' },
  { id: 'remi', name: 'Remi', description: 'Melodious, warm' },
  { id: 'adam', name: 'Adam', description: 'Deep, clear' },
];

function VoiceSelector({ selectedVoice, onSelect, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Choose Your Voice</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="voice-list">
          {VOICES.map((voice) => (
            <label 
              key={voice.id}
              className={`voice-option ${selectedVoice === voice.id ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name="voice"
                value={voice.id}
                checked={selectedVoice === voice.id}
                onChange={() => onSelect(voice.id)}
              />
              <div className="voice-info">
                <span className="voice-name">{voice.name}</span>
                <span className="voice-description">{voice.description}</span>
              </div>
              {selectedVoice === voice.id && (
                <span className="check-mark">✓</span>
              )}
            </label>
          ))}
        </div>

        <div className="modal-footer">
          <button className="save-btn" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default VoiceSelector;

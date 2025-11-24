import React, { useState, useEffect } from 'react';
import './App.css';
import VoiceChat from './components/VoiceChat';

function App() {
  const [selectedVoice, setSelectedVoice] = useState('tayo');

  useEffect(() => {
    // Load saved voice preference
    const savedVoice = localStorage.getItem('selected_voice');
    if (savedVoice) {
      setSelectedVoice(savedVoice);
    }
  }, []);

  const handleVoiceChange = (voiceId) => {
    setSelectedVoice(voiceId);
    localStorage.setItem('selected_voice', voiceId);
  };

  return (
    <div className="App">
      <VoiceChat 
        selectedVoice={selectedVoice} 
        onVoiceChange={handleVoiceChange}
      />
    </div>
  );
}

export default App;

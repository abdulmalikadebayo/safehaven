import React, { useRef, useState, useEffect } from 'react';
import './MessageBubble.css';
import { motion } from 'framer-motion';

function MessageBubble({ message }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Debug log message
  console.log('📨 MessageBubble rendering:', {
    role: message.role,
    text: message.text,
    hasAudio: !!message.audioUrl,
    timestamp: message.timestamp
  });

  // Attempt autoplay for assistant messages (will gracefully fail if not allowed)
  useEffect(() => {
    if (message.audioUrl && message.role === 'assistant' && audioRef.current) {
      // Small delay to ensure audio is loaded
      const timer = setTimeout(() => {
        audioRef.current?.play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(err => {
            console.log('Autoplay prevented (user must interact first):', err.message);
            // Don't set isPlaying to true if autoplay fails
            setIsPlaying(false);
          });
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [message.audioUrl, message.role]);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleAudioEnd = () => {
    setIsPlaying(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className={`message ${message.role}`}
    >
      <div className="message-label">
        {message.role === 'user' ? 'USER' : 'ASSISTANT'}
      </div>
      <div className="message-content">
        <p>{message.text}</p>
      </div>
      
      {message.audioUrl && (
        <div className="audio-player">
          <button 
            className="play-btn"
            onClick={toggleAudio}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              {isPlaying ? (
                <>
                  <rect x="6" y="4" width="4" height="16" rx="1"/>
                  <rect x="14" y="4" width="4" height="16" rx="1"/>
                </>
              ) : (
                <path d="M8 5v14l11-7z"/>
              )}
            </svg>
          </button>
          <div className="audio-waveform">
            <span className={isPlaying ? 'playing' : ''}></span>
            <span className={isPlaying ? 'playing' : ''}></span>
            <span className={isPlaying ? 'playing' : ''}></span>
            <span className={isPlaying ? 'playing' : ''}></span>
            <span className={isPlaying ? 'playing' : ''}></span>
          </div>
          <span className="audio-label">
            {isPlaying ? 'Playing' : 'Tap to replay'}
          </span>
          <audio 
            ref={audioRef}
            src={message.audioUrl}
            onEnded={handleAudioEnd}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        </div>
      )}
      
      <div className="message-time">
        {message.timestamp.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </div>
    </motion.div>
  );
}

export default MessageBubble;

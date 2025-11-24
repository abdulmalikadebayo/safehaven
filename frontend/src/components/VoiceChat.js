import React, { useState, useRef, useEffect } from 'react';
import './VoiceChat.css';
import VoiceSelector from './VoiceSelector';
import MessageBubble from './MessageBubble';
import { sendVoiceMessage, sendTextMessage } from '../services/api';

function VoiceChat({ selectedVoice, onVoiceChange }) {
  const [messages, setMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  const [error, setError] = useState('');
  const [textInput, setTextInput] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    // Welcome message with audio
    setMessages([{
      role: 'assistant',
      text: "Hello! I'm your SafeHaven Companion. I'm here to support your wellness journey. How are you feeling today? If you'd like to change my voice to one that suits you better, just click the settings icon at the top right.",
      audioUrl: '/welcome.mp3',
      timestamp: new Date(),
    }]);
  }, []);

  useEffect(() => {
    // Scroll to bottom on new messages
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startRecording = async () => {
    try {
      // Request microphone permission explicitly
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Check if MediaRecorder is supported
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        throw new Error('Browser does not support audio recording');
      }
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleSendAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setError('');
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Microphone access denied. Please allow microphone access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('No microphone found. Please connect a microphone.');
      } else {
        setError('Failed to access microphone: ' + err.message);
      }
      console.error('Recording error:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSendAudio = async (audioBlob) => {
    setIsProcessing(true);
    setError('');
    setProcessingStatus('Transcribing your message...');

    try {
      console.log('Sending audio to backend...');
      const response = await sendVoiceMessage(audioBlob, selectedVoice);
      setProcessingStatus('SafeHaven is thinking...');
      console.log('Response from backend:', response);
      console.log('User query:', response.user_query);
      console.log('Transcript:', response.transcript);
      console.log('Response text:', response.response_text);
      console.log('Audio URL:', response.audio_url);

      // Add user message with transcribed/original text from backend
      const userMessage = {
        role: 'user',
        text: response.user_query || response.transcript || 'Voice message',
        timestamp: new Date(),
      };
      console.log('Adding user message:', userMessage);
      setMessages((prev) => [...prev, userMessage]);

      setProcessingStatus('YarnGPT is creating voice response...');
      
      // Add assistant response
      const assistantMessage = {
        role: 'assistant',
        text: response.response_text,
        audioUrl: response.audio_url,
        timestamp: new Date(),
      };
      console.log('Adding assistant message:', assistantMessage);
      setMessages((prev) => [...prev, assistantMessage]);
      setProcessingStatus('');

    } catch (err) {
      setError('Failed to process message. Please try again.');
      setProcessingStatus('');
      console.error('Send error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendText = async () => {
    if (!textInput.trim()) return;

    setIsProcessing(true);
    setError('');
    setProcessingStatus('SafeHaven is thinking...');

    const userText = textInput;
    setTextInput(''); // Clear input immediately

    try {
      console.log('Sending text to backend:', userText);
      
      // Add user message
      const userMessage = {
        role: 'user',
        text: userText,
        timestamp: new Date(),
      };
      console.log('Adding user message:', userMessage);
      setMessages((prev) => [...prev, userMessage]);

      const response = await sendTextMessage(userText, selectedVoice);
      setProcessingStatus('YarnGPT is creating voice response...');
      console.log('Response from backend:', response);
      console.log('Response text:', response.response_text);
      console.log('Audio URL:', response.audio_url);

      // Add assistant response
      const assistantMessage = {
        role: 'assistant',
        text: response.response_text,
        audioUrl: response.audio_url,
        timestamp: new Date(),
      };
      console.log('Adding assistant message:', assistantMessage);
      setMessages((prev) => [...prev, assistantMessage]);
      setProcessingStatus('');

    } catch (err) {
      setError('Failed to send message. Please try again.');
      setProcessingStatus('');
      console.error('Text send error:', err);
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleInputChange = (e) => {
    setTextInput(e.target.value);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  return (
    <div className="voice-chat" role="main" aria-label="Voice chat interface">
      {/* Header */}
      <header className="chat-header">
        <div className="header-content">
          <h1>SafeHaven Companion</h1>
          <p className="tagline">Your wellness journey starts here</p>
        </div>
        <button 
          className="settings-btn"
          onClick={() => setShowVoiceSelector(true)}
          aria-label="Open voice settings"
          title="Change Voice"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/>
          </svg>
        </button>
      </header>

      {/* Messages */}
      <div className="messages-container" role="log" aria-live="polite" aria-label="Chat messages">
        {messages.map((message, index) => (
          <MessageBubble key={index} message={message} />
        ))}
        {isProcessing && (
          <div className="processing-status" role="status" aria-live="polite">
            <div className="status-content">
              <div className="status-spinner">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" opacity="0.25"/>
                  <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="status-text">{processingStatus}</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} aria-hidden="true" />
      </div>

      {/* Error */}
      {error && (
        <div className="error-banner" role="alert" aria-live="assertive">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Input Container */}
      <div className="input-container">
        <div className="input-wrapper" role="search" aria-label="Message input">
          <textarea
            ref={textareaRef}
            value={textInput}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Message SafeHaven..."
            disabled={isProcessing || isRecording}
            rows="1"
            className="main-input"
            aria-label="Type your message"
          />

          {textInput.trim() ? (
            <button
              className="send-btn-main"
              onClick={handleSendText}
              disabled={isProcessing}
              aria-label="Send message"
              title="Send message"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          ) : (
            <button
              className={`mic-btn ${isRecording ? 'recording' : ''}`}
              onClick={toggleRecording}
              disabled={isProcessing}
              aria-label={isRecording ? 'Stop voice recording' : 'Start voice recording'}
              aria-pressed={isRecording}
              title={isRecording ? 'Stop recording' : 'Start voice recording'}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {isRecording ? (
                  <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>
                ) : (
                  <>
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="currentColor"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="23"/>
                    <line x1="8" y1="23" x2="16" y2="23"/>
                  </>
                )}
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Voice Selector Modal */}
      {showVoiceSelector && (
        <VoiceSelector
          selectedVoice={selectedVoice}
          onSelect={(voiceId) => {
            onVoiceChange(voiceId);
            setShowVoiceSelector(false);
          }}
          onClose={() => setShowVoiceSelector(false)}
        />
      )}

      {/* Footer */}
      <footer className="chat-footer">
        <div className="footer-left">
          <p className="built-by">
            Built by <strong>Abdul-Malik Adebayo</strong>
          </p>
          <p className="powered-by">
            Powered by <a href="https://yarngpt.ai" target="_blank" rel="noopener noreferrer" className="yarngpt-link">YarnGPT</a> • Showcasing Nigerian-accent TTS
          </p>
        </div>
        <div className="contact-links">
          <a 
            href="mailto:abdulmalikadebayo1@gmail.com" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="Email Abdul-malik"
            title="Email"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </a>
          <a 
            href="https://www.linkedin.com/in/abdul-malik-adebayo-294161174" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="LinkedIn Profile"
            title="LinkedIn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
        </div>
      </footer>
    </div>
  );
}

export default VoiceChat;
